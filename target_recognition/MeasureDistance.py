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
    # 从左侧视图中截取目标图像 xy是目标的中心点为了，匹配精确，可以基于xy中心点适当扩大目标范围，也就是增加 w和h 目前没加扩大
    top = int(y-h/2)
    left = int(x-w/2)
    template = image_left[top : top + h, left : left + w]
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
        # print("=====",min_loc,y_true - min_loc[1])
        if np.abs(top - min_loc[1]) < 15:
            # 得到目标在两个视图的视差
            x1, x2 = template_box[0], min_loc[0]
            difference = np.abs(x1 - x2)
            print(f"MeasureDistance-->difference:{difference}")
            # ===两个轮廓的视差计算出距离=== 660常数 5焦距===这里数值不准需要调整 40.89131164550781 53  2.5391387939453125
            # 2.88934326171875  3.7449322780018157
            # 2.1669464111328125 2.8086200996845725       15.691680908203125  20.33828348047449      2.8741607666015625 3.7252539598254084
            # 0.635/640 = 0.0009921875   0.3583846597*6= 2.15030795848
            # 0.508*6 / (0.635/640*difference)
            distance = float(3.5*60 / (6.35/640*difference))
            return distance, min_loc
        else:
            return -1, -1
    return -1, -1
    # # 根据坐标画矩形框表示相似区域
    # for pt in zip(*loc[::-1]):
    #     cv2.rectangle(self.image, pt, (pt[0] + w, pt[1] + h), (0, 255, 0), 2)
    #
    # # 显示结果
    # cv2.imshow('Matched Areas', self.image)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()
