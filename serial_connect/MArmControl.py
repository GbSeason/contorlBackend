# 生成机械臂控制指令
import json


# 机械臂的坐标轴定义基于右手定则，机械臂的正前方为X轴正方向，机械臂的前方的左侧为Y轴正方向，机械臂的竖直正上方为Z轴正方向。
class MArmCommand:
    def __init__(self):
        # 获得机械臂末端点位置坐标和各关节角度、负载的反馈
        self.GET_INFO = {"T": 105}
        # 运动到初始位置
        self.TO_INITIAL_POSITION = {"T": 100}

    # 单独控制第5关节运动  角度 acc：转动开始和结束时的加速度,speed速度单位为步/秒，舵机的一圈为 4096 步，数值越大速度越快，
    # 当速度值为 0 时，以最大速度转动
    # 1：BASE_JOINT基础关节。2：SHOULDER_JOINT肩关节。3：ELBOW_JOINT肘关节。4：EOAT_JOINT手腕 / 夹爪关节。5：第5关节
    def joint_go(self, joint, angle, speed=0):
        command = {"T": 121, "joint": joint, "angle": angle, "spd": speed, "acc": 10}
        if joint is not None and angle is not None:
            return json.dumps(command)
        else:
            return None

    # 机械臂末端点位置控制（逆运动学）进程阻塞
    def XYZ_go_spd(self, x, y, z, t, speed=0):
        command = {"T": 104, "x": x, "y": y, "z": z, "t": t, "spd": speed}
        if x is not None and y is not None:
            return json.dumps(command)
        else:
            return None

    # 机械臂末端点位置控制（逆运动学）不会引起进程阻塞
    def go_XYZ(self, x, y, z, t=3.14):
        command = {"T": 1041, "x": x, "y": y, "z": z, "t": t}
        if x is not None and y is not None:
            return json.dumps(command)
        else:
            return None

    def to_home(self):
        return json.dumps(self.TO_INITIAL_POSITION)

    def get_info(self):
        return json.dumps(self.GET_INFO)

    # 连续运动控制（角度控制 + 逆运动学控制）
    # {"T": 123, "m": 0, "axis": 0, "cmd": 0, "spd": 0}
    # 123：这条指令为CMD_CONSTANT_CTRL，使机械臂各关节或机械臂末端点在输入指令后可以连续运动。
    # m：表示连续运动控制模式。
    # 0：角度控制模式。
    # 1：坐标控制模式。
    # axis：不同模式下控制转动的部位不一样。
    # 角度控制模式下：m值为0时，控制的是机械臂各关节角度的转动。1 - BASE基础关节；2 - SHOULDER肩关节；3 - ELBOW肘关节；4 - HAND夹爪 / 手腕关节。
    # 坐标控制模式下：m的值为1时，控制的是机械臂末端点坐标的转动。1 - X轴；2 - Y轴；3 - Z轴；4 - HAND夹爪 / 手腕关节。
    # cmd：运动的状态。
    # 0 - STOP停止运动。
    # 1 - INCREASE角度控制模式，增加角度；逆运动学控制模式，增加坐标轴值。
    # 2 - DECREASE角度控制模式，减少角度；逆运动学控制模式，减少坐标轴值。
    # spd：速度系数，数值越大速度越快，由于各个关节转速有上限，因此建议在0 - 20之间取值。
    def go_continuous(self, axis, status, spd=5):
        command = {"T": 123, "m": 1, "axis": axis, "cmd": status, "spd": spd}
        if axis is not None and status is not None:
            return json.dumps(command)
        else:
            return None

    # 机械臂末端点的单独轴位置控制
    # axis：表示为轴的序号。1-X轴；2-Y轴；3-Z轴；4-T轴，夹爪/手腕的角度，弧度制。
    # pos：某个轴的具体位置，单位为mm。例如上方的例子就是让机械臂末端点运动至Y轴的0位置，也就是机械臂的正前方。
    # spd：运动的速度，该数值越大速度越快，本移动命令底层包含了曲线速度控制函数，所以速度并不是恒定的。
    def go_axis(self, axis, pos, spd=0.25):
        command = {"T": 103, "axis": axis, "pos": pos, "spd": spd}
        if axis is not None and pos is not None:
            return json.dumps(command)
        else:
            return None

    def go_angle(self, joint, angle, spd=10, acc=10):
        command = {"T": 121, "joint": 1, "angle": 0, "spd": 10, "acc": 10}
        if joint is not None and angle is not None:
            return json.dumps(command)
        else:
            return None

# m = MArmCommand()
# print(m.XYZ_go(10, 20, 5, 500))
# print(m.XYZ_go_spd(10, 20, 5, 50,200))
