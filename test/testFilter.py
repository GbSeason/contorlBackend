import numpy as np
import cv2
from video_get import videoGet


blurred_l = None
drawing = False  # 真如果鼠标被按下
ix, iy = -1, -1
# 鼠标回调函数
def draw_rectangle(event, x, y, flags, param):
    global ix, iy, drawing, blurred_l
    # 当按下左键是记录起始位置坐标
    if event == cv2.EVENT_LBUTTONDOWN:
        drawing = True
        ix, iy = x, y

    # 当左键按下并移动是绘制矩形
    elif event == cv2.EVENT_MOUSEMOVE:
        if drawing:
            img_copy = blurred_l.copy()
            cv2.rectangle(img_copy, (ix, iy), (x, y), (0, 255, 0), 1)
            cv2.imshow("image", img_copy)

    # 鼠标松开停止绘画
    elif event == cv2.EVENT_LBUTTONUP:
        drawing = False
        cv2.rectangle(blurred_l, (ix, iy), (x, y), (0, 255, 0), 1)


def view():
    global blurred_l
    vg = videoGet()
    cv2.namedWindow("view")
    cv2.setMouseCallback("view", draw_rectangle)
    while True:
        if vg.currentFrameLeft is not None:
            # 双边滤波
            blurred_l = cv2.bilateralFilter(cv2.cvtColor(vg.currentFrameLeft, cv2.COLOR_BGR2GRAY), 3, 75, 75)
            # 显示视差图
            cv2.imshow('view', blurred_l)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                vg.stop()
                break
    cv2.destroyAllWindows()


view()
