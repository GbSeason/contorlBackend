import json
import time
from video_get import videoGet
from target_recognition import getApplesDetector
from serial_connect.SerialControl import Serials
from serial_connect.MArmControl import MArmCommand
from web_server import startServer
# from requestControl.RequestControl import RequestControl
from threading import Timer, Thread
from urllib import parse
from target_recognition.MeasureDistance import measure
# from action_work.actionWork import action_1
from joint_move import JointMoveCalc
from joint_move.scanMove import scanMove


class Dispatcher:
    def __init__(self):
        self.webServer = None
        self.timer = None
        self.timerAction = None
        self.video = None
        self.serial = None
        # self.request = RequestControl()//不适用
        self.command = MArmCommand()
        self.scan_move = scanMove(self)
        self.armInfo = {"x": 0, "y": 0, "z": 0}
        self.armInfoAll = None
        # 当前运动状态 True动作执行中  False动作停止
        self.actionStatus = False
        self.recognition_status = True  # 当前识别是否工作

    # 接收到web端消息 / 串口消息
    def webMessageHandle(self, data, isAction):
        # print(f'dispatcher web: {data}')
        command = ""
        if data == 'info':
            command = self.command.get_info()
        if isAction is True:
            self.actionStatus = True
            threadAG = Thread(target=self.actionGo, args=[data])
            threadAG.start()
            # self.actionGo(data)
        else:
            commandURL = parse.quote(command)
            motoData = self.serial.sendMsg(commandURL)
            if type(motoData) is dict:
                self.mArmMessageHandle(motoData)

    def actionWorkAutomation(self, box):
        print(f"开始执行作业动作,目标:{box}")
        # 首先确认机械臂位置数据是否存在
        if self.armInfoAll:
            # 开始自动执行作业，首先需要计算出目标距离
            frames = self.video.getLRFrame()
            distance = measure(frames[0], box, frames[1])


            # distance是摄像机此时距离目标的位置，具体该如何移动机械臂和地盘，需要计算目标在机械臂坐标系内的坐标
            # 如果在，读取机械臂参数
            """
            机械臂返回参数格式
            {"T":1051,"x":309.0444117,"y":3.318604879,"z":238.2448043,"b":0.010737866,"s":-0.004601942,"e":1.570796327,"t":3.141592654,"torB":-56,"torS":-20,"torE":0,"torH":0}
            x、y、z：分别代表末端点X轴、Y轴、Z轴的坐标。
            b、s、e、t：分别代表基础关节、肩关节、肘关节、末端关节角度，以弧度制形式显示。
            torB、torS、torE、torH：分别代表基础关节、肩关节、肘关节、末端关节的负载。
            """
            # 计算出目标真实坐标
            tx, ty, tz = JointMoveCalc.calculate_target_coordinate(self.armInfoAll['s'], self.armInfoAll['e'],
                                                                   self.armInfoAll['t'],
                                                                   self.armInfoAll['b'], 0, distance)
            # 判断其是否在操作范围内,返回值为boolean和距离
            canDo, dist = JointMoveCalc.check_point_in_sphere(tx, ty, tz, 40)
            # 如果不在操作范围内，则底盘移动到合适距离内
            if canDo is False:
                print("目标太远，需要底盘移动")
                # 需要操作底盘移动适当的距离
                pass
            else:
                # 操作部移动到目标位置
                self.moveToCoordinates(tx, ty, tz)
            print(distance)
            print("作业完成，再次启动目标搜索")
        else:
            print("当前机械臂无数据")
        self.recognition_status = True
        # 根据距离判断是需要靠近目标还是要远离目标
        # if distance > 100: #当距离大于10cm时，需要靠近目标，以当前目标为中心点开始移动机械臂末端
        #     action_1(box,distance)

    def moveToCoordinates(self, tx, ty, tz):
        self.command.go_XYZ(tx, ty, tz)

    def actionStop(self, typeName):
        self.actionStatus = False

    def actionGo(self, typeName):
        command = ""
        step = 5
        if self.actionStatus is True:
            if typeName == "4":
                self.armInfo['x'] += step
            if typeName == "5":
                self.armInfo['x'] -= step
            if typeName == "3":
                self.armInfo['y'] += step
            if typeName == "1":
                self.armInfo['y'] -= step
            if typeName == "0":
                self.armInfo['z'] += step
            if typeName == "2":
                self.armInfo['z'] -= step
            command = self.command.go_XYZ(self.armInfo['x'], self.armInfo['y'], self.armInfo['z'])
            commandURL = parse.quote(command)
            Thread(target=self.serial.sendMsg, args=[commandURL]).start()
            time.sleep(0.05)
            self.actionGo(typeName)

    # 接收到机械臂当前状态信息消息
    def mArmMessageHandle(self, data):
        if data and len(data) > 5:
            #  json.loads(data)
            jsonData = data
            if jsonData['T'] and jsonData['T'] == 1051:
                self.armInfoAll = jsonData
                self.armInfo['x'] = int(jsonData['x'])
                self.armInfo['y'] = int(jsonData['y'])
                self.armInfo['z'] = int(jsonData['z'])
                self.webServer.sendWebMessage('info', json.dumps(self.armInfo))
                # print(f'current arm info is :x{self.armInfo['x']}, y{self.armInfo['y']}, z{self.armInfo['z']}')

    # 持续识别目标
    def startVideoRecognition(self):
        # print("target--go")
        while True:
            if self.video is not None and self.recognition_status:
                # 捕捉到当前画面
                frame = self.video.currentFrame
                # print("=== start find apple ====")
                if frame is not None:
                    # print("=== find apple ====")
                    # 创建识别器
                    detector = getApplesDetector()
                    # 识别目标
                    boxes = detector.detectTarget(frame)
                    # print(boxes)
                    # ************当识别出目标时，需要暂停识别，机械臂动作，等待前端给出指令：继续识别还是开始执行动作************
                    if len(boxes) > 0:
                        # 如果找到目标，先暂停扫描
                        self.scan_move.pauseScan()
                        # 发送目标位置到web端
                        self.webServer.sendWebMessage('findTargets', json.dumps(boxes))
                        self.recognition_status = False
                    else:
                        self.webServer.sendWebMessage('findTargets', "[]")
                    # 视频识别再次启动 一秒一次
            time.sleep(0.1)
        # self.timer = Timer(0.5, self.startVideoRecognition)
        # self.timer.start()

    # 开启串口配置消息句柄
    def startSerial(self):
        self.serial = Serials(None, self.mArmMessageHandle)  #

    def startScanMove(self):
        self.scan_move.startScan()

    # 启动所有功能
    def start(self):
        # 创建视频获取对象--自动启动
        self.video = videoGet()
        # 开始旋转摄像机扫描
        Thread(target=self.startScanMove).start()
        # 创建视频识别线程
        Thread(target=self.startVideoRecognition).start()
        # self.startVideoRecognition()
        # 开启串口通信 ////////暂时不用串口,使用wifi与机械部分通信
        self.startSerial()
        # 启动webserver,传递视频画面，消息处理句柄
        startServer(self.video, self)
