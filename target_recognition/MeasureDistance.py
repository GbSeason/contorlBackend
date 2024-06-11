import cv2
import numpy as np


# class MD:
#     def __init__(self,image,template):
#         self.image = image
#         self.template = template

# 通过左右视图差计算目标距离
# image_left 左侧视图
# templateBox 目标在左侧视图中的位置[x,y,w,h]
# image_right 右侧视图
# ======返回距离，单位毫米
def measure(image_left, template_box, image_right):
    print(template_box, len(template_box))
    # 将模板的宽度和高度保存下来
    x, y, w, h = int(template_box[0]), int(template_box[1]), int(template_box[2]), int(template_box[3])
    # 从左侧视图中截取目标图像
    template = image_left[y:y + h, x:x + w]
    # 模板匹配
    res = cv2.matchTemplate(image_right, template, cv2.TM_SQDIFF)
    # print(res)
    # # 设定阈值
    # threshold = 0.8
    # # 取匹配程度大于90%的坐标
    # loc_array = np.where(res >= threshold)
    # print(loc_array)
    if len(res) > 0:
        # 取里面最大的
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
        print(min_loc)
        # 得到目标在两个视图的视差
        x1, x2 = template_box[0], min_loc[0]
        difference = np.abs(x1 - x2)
        # ===两个轮廓的视差计算出距离=== 660常数 5焦距===这里数值不准需要调整
        distance = int(600 / difference * 2.1)
        return distance
    return -1
    # # 根据坐标画矩形框表示相似区域
    # for pt in zip(*loc[::-1]):
    #     cv2.rectangle(self.image, pt, (pt[0] + w, pt[1] + h), (0, 255, 0), 2)
    #
    # # 显示结果
    # cv2.imshow('Matched Areas', self.image)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()
