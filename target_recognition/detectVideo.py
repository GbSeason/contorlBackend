from ultralytics import YOLO
import cv2
import numpy as np
# import json


# Load the YOLOv8 model
class detectApple:
    def __init__(self):
        self.model = YOLO('./models/best.pt')

    def detectTarget(self, frame):
        # print(height, width)
        results = self.model(frame, verbose=False)
        # Visualize the results on the frame
        # annotated_frame = results[0].plot()
        boxes = []
        for r in results:
            if len(r.boxes.xywh) > 0:
                # 将NumPy数组转换为JSON
                for i,item in enumerate(r.boxes.conf):
                    if item > 0.5:
                        boxes.append({"frame": r.boxes.xywh[i].numpy().tolist(),"conf": item.numpy().tolist()})
                # print("==========")
                # print(r.boxes.xyxy)
                # print(r.boxes.conf)
                # print(r.boxes.cls)
        return boxes
