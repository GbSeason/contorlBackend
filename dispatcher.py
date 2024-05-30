import json
from video_get import videoGet
from target_recognition import getApplesDetector
# from serial_connect.SerialControl import Serials
from serial_connect.MArmControl import MArmCommand
from web_server import startServer
from requestControl.RequestControl import RequestControl
from threading import Timer
from urllib import parse
from pygame import time

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
        # 当前运动状态 True动作执行中  False动作停止
        self.actionStatus = False

    # 接收到web端消息
    def webMessageHandle(self, data, isAction):
        # print(f'dispatcher web: {data}')
        command = ""
        if data == 'info':
            command = self.command.get_info()
        if isAction is True:
            print(f"action dispatcher {data} {isAction}")
            self.actionStatus = True
            self.actionGo(data)
        else:
            commandURL = parse.quote(command)
            motoData = self.request.sendControl(commandURL)
            if type(motoData) is dict:
                self.mArmMessageHandle(motoData)

    def actionStop(self, typeName):
        self.actionStatus = False

    def actionGo(self, typeName):
        command = ""
        if self.actionStatus is True:
            if typeName == "4":
                self.armInfo['x'] += 1
            if typeName == "5":
                self.armInfo['x'] -= 1
            if typeName == "3":
                self.armInfo['y'] += 1
            if typeName == "1":
                self.armInfo['y'] -= 3
            if typeName == "0":
                self.armInfo['z'] += 1
            if typeName == "2":
                self.armInfo['z'] -= 1
            command = self.command.go_XYZ(self.armInfo['x'], self.armInfo['y'], self.armInfo['z'])
            commandURL = parse.quote(command)
            self.request.sendControl(commandURL)
            self.timerAction = Timer(100/1000, self.actionGo, args=[typeName])  # 0.02
            self.timerAction.start()

    # 接收到机械臂当前状态信息消息
    def mArmMessageHandle(self, data):
        if data and len(data) > 5:
            #  json.loads(data)
            jsonData = data
            if jsonData['T'] and jsonData['T'] == 1051:
                self.armInfo['x'] = int(jsonData['x'])
                self.armInfo['y'] = int(jsonData['y'])
                self.armInfo['z'] = int(jsonData['z'])
                self.webServer.sendWebMessage('info', json.dumps(self.armInfo))
                # print(f'current arm info is :x{self.armInfo['x']}, y{self.armInfo['y']}, z{self.armInfo['z']}')

    # 持续识别目标
    def startVideoRecognition(self):
        # print("target--go")
        if self.video is not None:
            frame = self.video.currentFrame
            # print("=== start find apple ====")
            if frame is not None:
                # print("=== find apple ====")
                detector = getApplesDetector()
                boxes = detector.detectTarget(frame)
                self.webServer.sendWebMessage('findTargets', json.dumps(boxes))
                # print(boxes)
        # 视频识别再次启动 一秒一次
        self.timer = Timer(0.5, self.startVideoRecognition)
        self.timer.start()

    # 开启串口配置消息句柄
    def startSerial(self):
        pass
        # self.serial = Serials("COM4", self.mArmMessageHandle)

    # 启动所有功能
    def start(self):
        # 创建视频获取对象--自动启动
        self.video = videoGet()
        # 创建视频识别线程
        self.startVideoRecognition()
        # 开启串口通信 ////////暂时不用串口,使用wifi与机械部分通信
        # self.startSerial()
        # 启动webserver,传递视频画面，消息处理句柄
        startServer(self.video, self)
