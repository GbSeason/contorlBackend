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
    top = int(y - h / 2)
    left = int(x - w / 2)
    resBox = matchTarget(image_left, image_right, [left, top, w, h])
    if resBox[0] > -1:
        # 得到目标在两个视图的视差
        x1, x2 = template_box[0], resBox[0]
        difference = np.abs(x1 - x2)
        print(f"MeasureDistance-->difference:{difference}")
        distance = float(3.5 * 60 / (6.35 / 640 * difference))
        return distance, resBox
    else:
        return -1, -1


def matchTarget(sourceFrame, targetFrame, sourceBox):
    # 扩大选取，增加识别率
    x, y, w, h = int(sourceBox[0]), int(sourceBox[1]), int(sourceBox[2]), int(sourceBox[3])
    w1 = int(w / 2)
    h1 = int(h / 2)
    leftType = 1  # 0 x值  1 二倍
    topType = 1  # 0 y值  1 二倍
    if x > w1:
        x = x - w1
        w += w
    else:
        leftType = 0
        w += 2 * x
        x = 0
    if y > h1:
        y = y - h1
        h += h
    else:
        topType = 0
        h += 2 * y
        y = 0
    template = sourceFrame[y: y + h, x: x + w]
    # 模板匹配
    res = cv2.matchTemplate(targetFrame, template, cv2.TM_CCOEFF_NORMED)
    findBox = [-1, -1, -1, -1]
    if len(res) > 0:
        # 取里面最大的
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
        if np.abs(sourceBox[1] - max_loc[1]) < 15:
            # 两个目标的y坐标相差不大 返回的box需要还原到原来的box大小
            findBox[0] = max_loc[0] + sourceBox[0] if leftType == 0 else max_loc[0] + sourceBox[2] / 2
            findBox[1] = max_loc[1] + sourceBox[1] if topType == 0 else max_loc[1] + sourceBox[3] / 2
            findBox[2] = sourceBox[2]
            findBox[3] = sourceBox[3]
    return findBox

    # # 根据坐标画矩形框表示相似区域
    # for pt in zip(*loc[::-1]):
    #     cv2.rectangle(self.image, pt, (pt[0] + w, pt[1] + h), (0, 255, 0), 2)
    #
    # # 显示结果
    # cv2.imshow('Matched Areas', self.image)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()
