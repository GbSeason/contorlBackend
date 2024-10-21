# This is a sample Python script.

# Press Shift+F10 to execute it or replace it with your code.
# Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.
# ====================================================================================================================
# = 本项目集成YOLO，opencv，flask，websocket，串口通信等，主要功能是通过关节末端摄像头获取图像，通过yolo识别目标，计算位置，通过串口    =
# = 控制关节运动到达目标位置，执行操作。运行web服务，接收网页端请求可以同步观察实时画面，监控识别过程，识别纠正和关节控制。                =
# ====================================================================================================================
from dispatcher import Dispatcher
# import subprocess


def init(name):
    # start_nginx()
    Dispatcher().start()


# def start_nginx():
#     subprocess.Popen(["./nginx-1.19.7/nginx.exe"], cwd="./nginx-1.19.7/")
#     print("Nginx is running.")


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    init(__name__)
