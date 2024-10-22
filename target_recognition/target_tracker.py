import cv2

# 初始化视频源，可以是视频文件或摄像头
video = cv2.VideoCapture(0)  # 0 通常为默认摄像头

# 初始化追踪器
tracker = cv2.TrackerKCF.create()

# 读取视频的第一帧
ret, frame = video.read()

# 选择框选区域，这里可以手动选择或通过其他方式获取
# bbox = cv2.selectROI(frame, False)
bbox = (320, 240, 100, 100)  # 假设已知目标的初始位置


# 使用追踪器对目标进行追踪
tracker.init(frame, bbox)

while True:
    # 读取新的帧
    ret, frame = video.read()
    if not ret:
        break

    # 更新追踪器以追踪目标
    success, box = tracker.update(frame)

    # 绘制追踪器的框
    if success:
        (x, y, w, h) = [int(v) for v in box]
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

    # 显示结果
    cv2.imshow("Tracking", frame)

    # 按 'q' 退出循环
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# 释放资源和关闭窗口
video.release()
cv2.destroyAllWindows()
