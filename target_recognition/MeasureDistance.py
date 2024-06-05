import cv2
import numpy as np

class MD:
    def __init__(self,image,template):
        self.image = image
        self.template = template

    def measure(self):
        # # 读取图像和模板
        # image = cv2.imread('image.jpg')
        # template = cv2.imread('template.jpg')
        # 将模板的宽度和高度保存下来
        w, h = self.template.shape[:-1]
        # 模板匹配
        res = cv2.matchTemplate(self.image, self.template, cv2.TM_CCOEFF_NORMED)
        # 设定阈值
        threshold = 0.9
        # 取匹配程度大于90%的坐标
        loc = np.where(res >= threshold)
        # 根据坐标画矩形框表示相似区域
        for pt in zip(*loc[::-1]):
            cv2.rectangle(self.image, pt, (pt[0] + w, pt[1] + h), (0, 255, 0), 2)

        # 显示结果
        cv2.imshow('Matched Areas', self.image)
        cv2.waitKey(0)
        cv2.destroyAllWindows()