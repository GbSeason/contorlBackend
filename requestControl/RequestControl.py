import requests


class RequestControl:
    def __init__(self):
        self.url = 'http://192.168.20.24/js?json='

    def sendControl(self, command):
        urlCommand = f'{self.url}{command}'
        # print(urlCommand)
        # 发送GET请求
        response = requests.get(urlCommand)
        # 检查请求是否成功
        if response.status_code == 200:
            # 获取响应内容（假设是JSON格式）
            data = response.json()
            # print(data)
            if "105" in command:
                return data
        else:
            print('请求失败，状态码:', response.status_code)


# RequestControl().sendControl("{%22T%22:105}")