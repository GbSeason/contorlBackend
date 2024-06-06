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
    # 从左侧视图中截取目标图像
    template = image_left[template_box[1]:template_box[1] + template_box[3],
               template_box[0]:template_box[0] + template_box[2]]
    #
    # 将模板的宽度和高度保存下来
    w, h = template_box[2], template_box[3]
    # 模板匹配
    res = cv2.matchTemplate(image_right, template, cv2.TM_CCOEFF_NORMED)
    # 设定阈值
    threshold = 0.9
    # 取匹配程度大于90%的坐标
    loc_array = np.where(res >= threshold)
    # 取里面最大的
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(loc_array)
    # 得到目标在两个视图的视差
    x1, x2 = template_box[0], max_loc[0]
    # # 根据坐标画矩形框表示相似区域
    # for pt in zip(*loc[::-1]):
    #     cv2.rectangle(self.image, pt, (pt[0] + w, pt[1] + h), (0, 255, 0), 2)
    #
    # # 显示结果
    # cv2.imshow('Matched Areas', self.image)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()
