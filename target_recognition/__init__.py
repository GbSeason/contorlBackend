from .detectVideo import detectApple


# 传入的frame获取识别的目标
def getApplesDetector():
    da = detectApple()
    return da
