from .server import webServer
import threading


def startServer(videor, despatcher):
    ws = webServer(videor, despatcher)
    ws.start_server()
    # return ws
    # thread = threading.Thread(target=ws.start_server)
    # thread.start()
