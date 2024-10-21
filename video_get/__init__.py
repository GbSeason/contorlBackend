import cv2
import threading


# opencv获取摄像头画面,并且更新当前数据
class videoGet:
    def __init__(self):
        self.index = 0
        self.currentImg = None
        self.currentImgRight = None
        self.currentFrame = None
        self.currentFrameRight = None
        self.start()

    def getCurrentImg(self):
        return self.currentImg

    def getCurrentImgRight(self):
        return self.currentImgRight

    def getLRFrame(self):
        return [self.currentFrame, self.currentFrameRight]

    def getCurrentFrame(self):
        return self.currentFrame

    def list_cameras(self):
        # 初始化摄像头列表
        camera_indices = []
        # 尝试打开从0开始的摄像头
        while True:
            camera_index = len(camera_indices)
            cap = cv2.VideoCapture(camera_index)
            if not cap.read()[0]:  # 通过尝试读取一帧来检查摄像头是否打开
                break
            camera_indices.append(camera_index)
            cap.release()
        return camera_indices

    def videoCapture(self):
        cap = cv2.VideoCapture(8)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        while True:
            ret, frame = cap.read()
            if ret:
                self.currentFrame = frame[0:479, 0:639]
                self.currentFrameRight = frame[0:479, 640:1279]
                # 编码帧为JPEG格式
                _, frame_jpeg = cv2.imencode('.jpg', self.currentFrame)
                _r, frame_jpeg_right = cv2.imencode('.jpg', self.currentFrameRight)
                self.currentImg = frame_jpeg.tobytes()
                self.currentImgRight = frame_jpeg_right.tobytes()

    def start(self):
        thread = threading.Thread(target=self.videoCapture)
        thread.start()
