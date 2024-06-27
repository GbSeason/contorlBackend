import numpy as np
import math



def calculate_target_coordinate_g(x, y, z, a, b, d):
    """
    计算仰角为 a，在xy平面内相对x轴角度为 b，距离为 d的point的三维坐标值
    :param x:原点x
    :param y:原点y
    :param z:原点z
    :param a:仰角
    :param b:在xy平面内相对x轴角度
    :param d:目标点距离观察点的直线距离
    :return: 目标点的坐标
    """
    ra = np.radians(a)
    rb = np.radians(b)
    target_z = d * np.sin(ra)
    target_y = target_z / np.tan(ra) * np.sin(rb)
    target_x = target_y / np.tan(rb)
    return x + target_x, y + target_y, z + target_z


def check_point_in_sphere(x, y, z, r):
    """
    :param x:
    :param y:
    :param z:
    :param r:球体半径
    :return:计算xyz坐标点是否在半径为r的球体中，并返回距离
    """
    distance = math.sqrt(x ** 2 + y ** 2 + z ** 2)
    if distance <= r:
        return True, r - distance
    else:
        return False, distance - r



target_xg, target_yg, target_zg = calculate_target_coordinate_g(5, 6, 3, 30, 30, 14)
print(f"目标在三维坐标系中的坐标为g: ({target_xg:.2f}, {target_yg:.2f}, {target_zg:.2f})")
"""
以下为测试代码
# 测试
x = 1
y = 1
z = 1
radius = 5
is_inside, distance_to_surface = check_point_in_sphere(x, y, z, radius)
print(is_inside, distance_to_surface)
"""
