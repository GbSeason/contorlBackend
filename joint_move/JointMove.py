import numpy as np
import math


def calculate_target_coordinate_o(cam_x, cam_y, cam_z, cam_roll, cam_pitch, cam_yaw, distance):
    """
    计算摄像头中目标在三维坐标系中的具体坐标
    参数:
    cam_x, cam_y, cam_z (float): 摄像头在三维坐标系中的位置
    cam_roll, cam_pitch, cam_yaw (float): 摄像头在x轴、y轴和z轴的旋转角度(度)
    distance (float): 目标与摄像头之间的直线距离
    返回:
    target_x, target_y, target_z (float): 目标在三维坐标系中的具体坐标
    """
    # 将旋转角度转换为弧度
    roll = np.radians(cam_roll)
    pitch = np.radians(cam_pitch)
    yaw = np.radians(cam_yaw)

    # 计算摄像头方向向量
    dir_x = np.cos(pitch) * np.cos(yaw)
    dir_y = np.cos(pitch) * np.sin(yaw)
    dir_z = np.sin(pitch)

    # 计算目标在三维坐标系中的具体坐标
    target_x = cam_x + dir_x * distance
    target_y = cam_y + dir_y * distance
    target_z = cam_z + dir_z * distance

    return target_x, target_y, target_z


def calculate_target_coordinate(x, y, z, roll, pitch, yaw, distance):
    """
    Calculate the target coordinates in 3D space given the camera position, rotation, and distance to target.

    Parameters:
        x, y, z (float): Camera position in 3D space
        roll, pitch, yaw (float): Camera rotation angles in degrees
        distance (float): Distance from camera to target

    Returns:
        target_x, target_y, target_z (float): Target coordinates in 3D space
    """
    # Convert rotation angles from degrees to radians
    roll_rad = math.radians(roll)
    pitch_rad = math.radians(pitch)
    yaw_rad = math.radians(yaw)

    # Calculate rotation matrix
    rotation_matrix = np.array([
        [math.cos(yaw_rad) * math.cos(pitch_rad),
         -math.sin(yaw_rad) * math.cos(roll_rad) + math.cos(yaw_rad) * math.sin(pitch_rad) * math.sin(roll_rad),
         math.sin(yaw_rad) * math.sin(roll_rad) + math.cos(yaw_rad) * math.sin(pitch_rad) * math.cos(roll_rad)],
        [math.sin(yaw_rad) * math.cos(pitch_rad),
         math.cos(yaw_rad) * math.cos(roll_rad) + math.sin(yaw_rad) * math.sin(pitch_rad) * math.sin(roll_rad),
         -math.cos(yaw_rad) * math.sin(roll_rad) + math.sin(yaw_rad) * math.sin(pitch_rad) * math.cos(roll_rad)],
        [-math.sin(pitch_rad), math.cos(pitch_rad) * math.sin(roll_rad), math.cos(pitch_rad) * math.cos(roll_rad)]
    ])

    # Calculate direction vector
    direction_vector = np.array([0, 0, 1])  # assume camera is facing positive z-axis
    direction_vector = np.dot(rotation_matrix, direction_vector)

    # Calculate target coordinates
    target_x = x + direction_vector[0] * distance
    target_y = y + direction_vector[1] * distance
    target_z = z + direction_vector[2] * distance

    return target_x, target_y, target_z


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


"""
以下为测试代码

target_x1, target_y1, target_z1 = calculate_target_coordinate(0, 0, 0, 0, 30, 30, 15)
print(f"目标在三维坐标系中的坐标为1: ({target_x1:.2f}, {target_y1:.2f}, {target_z1:.2f})")

target_x, target_y, target_z = calculate_target_coordinate_o(0, 0, 0, 0, 30, 30, 15)
print(f"目标在三维坐标系中的坐标为: ({target_x:.2f}, {target_y:.2f}, {target_z:.2f})")

# 测试
x = 1
y = 1
z = 1
radius = 5
is_inside, distance_to_surface = check_point_in_sphere(x, y, z, radius)
print(is_inside, distance_to_surface)
"""
