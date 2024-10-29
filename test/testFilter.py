import numpy as np
import cv2

# 加载左右视图图像
imgL = cv2.imread('1.jpg', 0)  # 左视图图像
imgR = cv2.imread('2.jpg', 0)  # 右视图图像

# 平滑 - 均值滤波
# blurred_l = cv2.blur(imgL, (3, 3))
# blurred_r = cv2.blur(imgR, (3, 3))

# blurred_l = cv2.GaussianBlur(imgL, (5, 5), 0)
# blurred_r = cv2.GaussianBlur(imgR, (5, 5), 0)
# 双边滤波
blurred_l = cv2.bilateralFilter(imgL, 5, 75, 75)
blurred_r = cv2.bilateralFilter(imgR, 5, 75, 75)

cv2.imshow('Disparity1', blurred_l)
cv2.imshow('Disparity2', blurred_r)
# 锐化
# sharpened_l = cv2.addWeighted(blurred_l, 1.5, cv2.blur(imgL, (0, 0)), -0.5, 0)
# sharpened_r = cv2.addWeighted(blurred_r, 1.5, cv2.blur(imgR, (0, 0)), -0.5, 0)

# 直方图均衡化
# equalized_l = cv2.equalizeHist(sharpened_l)
# equalized_r = cv2.equalizeHist(sharpened_r)

# 创建StereoBM对象.StereoBM_create(numDisparities=16, blockSize=15)
stereo = cv2.StereoBM.create(numDisparities=16, blockSize=15)

# 计算视差图
disparity = stereo.compute(blurred_l, blurred_r)

# 显示视差图
cv2.imshow('Disparity', np.uint8(disparity))
cv2.waitKey(0)
cv2.destroyAllWindows()
