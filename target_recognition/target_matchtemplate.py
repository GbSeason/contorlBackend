import cv2
import numpy as np

# 读取图像和模板图像
img = cv2.imread('image.jpg')
template = cv2.imread('template.jpg')

# 将图像和模板图像转换为灰度图
img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
template_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)

# 模板匹配
res = cv2.matchTemplate(img_gray, template_gray, cv2.TM_CCOEFF_NORMED)

# 找到最佳匹配位置
min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)

# 计算矩形的矩对角线位置
top_left = max_loc
bottom_right = (top_left[0] + template.shape[1], top_left[1] + template.shape[0])

# 绘制矩形边界框
cv2.rectangle(img, top_left, bottom_right, (0, 255, 0), 2)

# 显示图像
cv2.imshow('Matched Result', img)
cv2.waitKey(0)
cv2.destroyAllWindows()
