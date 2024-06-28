import json
import time
from video_get import videoGet
from target_recognition import getApplesDetector
# from serial_connect.SerialControl import Serials
from serial_connect.MArmControl import MArmCommand
from web_server import startServer
from requestControl.RequestControl import RequestControl
from threading import Timer, Thread
from urllib import parse
from target_recognition.MeasureDistance import measure
# from action_work.actionWork import action_1
from joint_move import JointMove


class Dispatcher:
    def __init__(self):
        self.webServer = None
        self.timer = None
        self.timerAction = None
        self.video = None
        # self.serial = None
        self.request = RequestControl()
        self.command = MArmCommand()
        self.armInfo = {"x": 0, "y": 0, "z": 0}
        self.armInfoAll = None
        # 当前运动状态 True动作执行中  False动作停止
        self.actionStatus = False
        self.start_recognition = True

    # 接收到web端消息
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
            motoData = self.request.sendControl(commandURL)
            if type(motoData) is dict:
                self.mArmMessageHandle(motoData)

    def actionWorkAutomation(self, box):
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
        JointMove.calculate_target_coordinate(self.armInfoAll['s'], self.armInfoAll['e'], self.armInfoAll['t'],
                                              self.armInfoAll['b'],0,distance)
        #判断其是否在操作范围内

        # 如果不在操作范围内，则地盘移动到合适距离内

        print(distance)
        # 根据距离判断是需要靠近目标还是要远离目标
        # if distance > 100: #当距离大于10cm时，需要靠近目标，以当前目标为中心点开始移动机械臂末端
        #     action_1(box,distance)

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
            Thread(target=self.request.sendControl, args=[commandURL]).start()
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
            if self.video is not None and self.start_recognition:
                frame = self.video.currentFrame
                # print("=== start find apple ====")
                if frame is not None:
                    # print("=== find apple ====")
                    detector = getApplesDetector()
                    boxes = detector.detectTarget(frame)
                    # print(boxes)
                    # ************当识别出目标时，需要暂停识别，机械臂动作，等待前端给出指令：继续识别还是开始执行动作************
                    if len(boxes) > 0:
                        self.webServer.sendWebMessage('findTargets', json.dumps(boxes))
                        # self.start_recognition = False
                    else:
                        self.webServer.sendWebMessage('findTargets', "[]")
                    # 视频识别再次启动 一秒一次
            time.sleep(0.1)
        # self.timer = Timer(0.5, self.startVideoRecognition)
        # self.timer.start()

    # 开启串口配置消息句柄
    def startSerial(self):
        pass
        # self.serial = Serials("COM4", self.mArmMessageHandle)

    # 启动所有功能
    def start(self):
        # 创建视频获取对象--自动启动
        self.video = videoGet()
        # 创建视频识别线程
        Thread(target=self.startVideoRecognition).start()
        # self.startVideoRecognition()
        # 开启串口通信 ////////暂时不用串口,使用wifi与机械部分通信
        # self.startSerial()
        # 启动webserver,传递视频画面，消息处理句柄
        startServer(self.video, self)
