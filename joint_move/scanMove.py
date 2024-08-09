from serial_connect.MArmControl import MArmCommand
from apscheduler.schedulers.blocking import BlockingScheduler
from requestControl.RequestControl import RequestControl


class scanMove:
    def __init__(self):
        self.command = MArmCommand()
        self.head_h = [-0.5, -0.05, 0.4, 0.85, 1.3]  # 摄像头左右旋转的范围，5步循环
        self.head_v = [2.2, 2.67, 3.14, 3.57, 4]  # 摄像头上下旋转的范围，5步循环
        self.h_rad_index = 0
        self.v_rad_index = 0
        self.h_dir = 1
        self.v_dir = 1
        # 创建扫描任务
        self.scheduler = BlockingScheduler()
        self.scheduler.add_job(self.scanCameraMove, 'interval', seconds=1)
        self.request = RequestControl()

    def scanCameraMove(self):
        #         摄像机移动扫描各个角度寻找目标
        command_mh_str = self.command.joint_go_rad(self.command.EOAT_HOR_JOINT, self.head_h[self.h_rad_index])
        self.request.sendControl(command_mh_str)
        # 先看上下方向是否要旋转 如果水平方向一个循环结束 则旋转一次上下
        if self.h_rad_index == 4 or self.h_rad_index == 0:
            command_mv_str = self.command.joint_go_rad(self.command.EOAT_JOINT, self.head_v[self.v_rad_index])
            self.request.sendControl(command_mv_str)
            self.v_rad_index += self.v_dir
            if self.v_rad_index >= 4:
                self.v_rad_index = 4
                self.v_dir = -1
            if self.v_rad_index <= 0:
                self.v_rad_index = 0
                self.v_dir = 1
        # 再旋转水平方向
        self.h_rad_index += self.h_dir
        if self.h_rad_index >= 4:
            self.h_rad_index = 4
            self.h_dir = -1
        if self.h_rad_index <= 0:
            self.h_rad_index = 0
            self.h_dir = 1

    def pauseScan(self):
        self.scheduler.pause()

    def resumeScan(self):
        self.scheduler.resume()

    def startScan(self):
        self.scheduler.start()
