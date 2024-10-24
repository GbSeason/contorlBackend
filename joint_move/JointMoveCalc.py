import numpy as np
import math
import config


def calculate_target_coordinate_g(x, y, z, a, b, d):
    """
    计算仰角为 a，在xy平面内相对x轴角度为 b，距离为 d的point的三维坐标值
    :param x:原点x
    :param y:原点y
    :param z:原点z
    :param a:仰角 弧度制
    :param b:摄像头在xy平面内相对x轴角度 弧度制
    :param d:目标点距离观察点的直线距离
    :return: 目标点的坐标
    """
    ra = a
    rb = b
    xy_ = d * np.cos(ra)
    target_z = d * np.sin(ra)
    target_y = xy_ * np.sin(rb)
    target_x = xy_ * np.cos(rb)
    return x + target_x, y + target_y, z + target_z


def calculate_joint_coordinate(jl0, jl1, jl2, ja0, ja1, ja2, ja_y, end_z_offset):
    """
    计算除回转关节外的三个关节在不同运动状态时，最末端摄像机的位置信息，
    机械臂的正前方为X轴正方向，机械臂的前方的左侧为Y轴正方向，机械臂的竖直正上方为Z轴正方向。
    :param jl0: 第一关节的长度
    :param jl1: 第二关节的长度
    :param jl2: 第三关节的长度
    :param ja0: 第一关节的角度 弧度制
    :param ja1: 第二关节的角度 弧度制
    :param ja2: 第三关节的角度 弧度制
    :param ja_y: 肩关节的角度，也就是在xy平面上旋转的角度 弧度制
    :param end_z_offset: 末端关节(第三关节)上连接的摄像机在z轴方向偏移量
    :return: x,y,z
    """
    end_z_hypotenuse = np.sqrt(end_z_offset ** 2 + jl2 ** 2)  # 计算摄像头架设点与末端关节的直线距离
    ja2_true = np.arcsin(end_z_offset / end_z_hypotenuse) + ja2  # 用反正切计算出实际固定的角度偏移

    ja2_plus = ja0 + ja1  # 第二个关节的实际角度
    ja3_plus = ja2_plus + ja2_true  # 第三个关节的实际角度

    z = (np.sin(ja0) * jl0) + (np.sin(ja2_plus) * jl1) + (np.sin(ja3_plus) * end_z_hypotenuse)
    x_ = (np.cos(ja0) * jl0) + (np.cos(ja2_plus) * jl1) + (
            np.cos(ja3_plus) * end_z_hypotenuse)  # 这步计算出的，实际上是大斜边的投影长度，还需要根据肩关节的回转角度计算真实的x，y坐标值

    y = np.sin(ja_y) * x_
    x = np.cos(ja_y) * x_

    return x, y, z


def check_point_in_sphere(x, y, z, r=60):
    """
    :param x:
    :param y:
    :param z:
    :param r:球体半径
    :return:计算xyz坐标点是否在半径为r的球体中，并返回距离
    """
    distance = math.sqrt(x ** 2 + y ** 2 + z ** 2)
    if distance <= r:
        return True, distance
    else:
        return False, distance


def calculate_target_coordinate(ja0=0, ja1=0, ja2=0, ja_y=0, b=0, d=0):
    """
    输入关节参数，及识别到的目标的直线距离，计算目标在三维坐标系中的坐标值
    jl0=config.JOINT_L_S, jl1=config.JOINT_L_E, jl2=config.JOINT_L_T,
    param jl0: 第一关节的长度
    param jl1: 第二关节的长度
    param jl2: 第三关节的长度
    param end_z: 末端关节(第三关节)上连接的摄像机在z轴方向偏移量
    这些参数作为配置项处理

    :param ja0: 第一关节的角度 弧度制
    :param ja1: 第二关节的角度 弧度制
    :param ja2: 第三关节的角度 弧度制
    :param ja_y: 基础关节的角度，也就是在xy平面上旋转的角度 弧度制

    :param d: 识别到目标与摄像机的直线距离
    :param b: 摄像机可以在xy平面内绕z轴旋转，b为在xy平面内相对x轴旋转的角度
    :return: xyz
    """
    # 这个算法还有问题，直接使用硬件传回的坐标
    x, y, z = calculate_joint_coordinate(config.JOINT_L_S, config.JOINT_L_E, config.JOINT_L_T, ja0, ja1, ja2, ja_y,
                                         config.JOINT_END_CAM_Z)
    ja2_ = ja0 + ja1 + ja2  # 计算第三关节真正的倾角
    tx, ty, tz = calculate_target_coordinate_g(x, y, z, ja2_, b, d)
    return tx, ty, tz


def calculate_target_coordinate_by_hard_data(ja0=0, ja1=0, ja2=0, b=0, d=0, x=0, y=0, z=0):
    ja2_ = ja0 - ja1 - ja2  # 计算第三关节真正的倾角
    print(f"第三关节真正的倾角:{ja2_}")
    tx, ty, tz = calculate_target_coordinate_g(x, y, z, ja2_, b, d)
    return tx, ty, tz


# target_xg, target_yg, target_zg = calculate_target_coordinate_g(5.60, 6.36, 3.19, 30, 30, 14)


# target_xg, target_yg, target_zg = calculate_target_coordinate(np.radians(30), np.radians(10), np.radians(0),
#                                                               np.radians(10), np.radians(0), 100)
# print(f"目标在坐标系中的坐标为g: ({target_xg}, {target_yg}, {target_zg})")

# print(np.rad2deg( np.arcsin(0.71)))
# """
# 以下为测试代码
# # 测试
# x = 1
# y = 1
# z = 1
# radius = 5
# is_inside, distance_to_surface = check_point_in_sphere(x, y, z, radius)
# print(is_inside, distance_to_surface)
# """
