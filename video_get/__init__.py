import cv2
import threading


# opencv获取摄像头画面,并且更新当前数据
class videoGet:
    def __init__(self):
        self.index = 0
        self.currentImg = None
        self.currentFrame = None
        self.currentFrameRight = None
        self.start()

    def getCurrentImg(self):
        return self.currentImg

    def getCurrentFrame(self):
        return self.currentFrame

    def videoCapture(self):
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        while True:
            ret, frame = cap.read()
            if ret:
                self.currentFrame = frame[0:480, 0:640]
                self.currentFrameRight = frame[0:480, 639:640]
                # 编码帧为JPEG格式
                _, frame_jpeg = cv2.imencode('.jpg', self.currentFrame)
                self.currentImg = frame_jpeg.tobytes()

    def start(self):
        thread = threading.Thread(target=self.videoCapture)
        thread.start()
