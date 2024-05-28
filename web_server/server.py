from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, emit


class webServer:
    def __init__(self, videor, dispatcher):
        self.location = "0.0.0.0"
        self.port = 5000
        self.socketio = None
        self.video_factory = videor
        self.handle = dispatcher.webMessageHandle
        dispatcher.webServer = self

    def sendWebMessage(self, type="test", msg="test"):
        print('to web')
        if type == "binary":
            self.socketio.emit('video', msg, binary=True)
        if type == "msg":
            self.socketio.emit('msg', msg, broadcast=True)
        else:
            self.socketio.emit(type, str(msg))

    def __build(self, app, socketio):
        # attempt to build necessary components to a Flask app
        client_dict = {}

        @app.route("/")
        def client():
            return render_template("index.html")

        @socketio.on('connect')
        def send_connect(cnt):
            print("[{}] Connection started.".format(request.sid))
            client_dict[request.sid] = {"name": ""}
            emit('connected', {"msg": "连接成功", "sid": request.sid})

        @socketio.on('getVideo')
        def getVideo(data):
            img = self.video_factory.getCurrentImg()
            emit('video', img, binary=True)

        @socketio.on('message')
        def getMessage(data):
            self.handle(data)

        @socketio.on('action')
        def getMessageOnAction(data):
            self.handle(data)

        #     ===============其他操作

        @socketio.on('send')
        def verify_client_send(data):
            # client = client_dict[request.sid]
            self.handle(data)
            # emit('broadcast', {"msg": data, "sid": request.sid}, broadcast=True)
            # print(client)
            # if(client["name"]):
            #     # has a valid name; allow broadcast. Use sid for client to filter its own chat.
            #     message = "{}: {}".format(client["name"], data)
            #     emit('broadcast', {"msg": message, "sid": request.sid}, broadcast=True)
            #     print("[{}] broadcasted: {}".format(request.sid, message))
            # else:
            #     # doesn't have a name, check for format
            #     if("client_id:" == data[:10]):
            #         # correct prefix, check if name is valid
            #         name = data.split(":")[-1].strip()
            #         if(name):
            #             # correct format; throw them the client and told them they are good
            #             emit('response_good', {"name": name, "sid": request.sid})
            #             client["name"] = name
            #             print("[{}] registered with name `{}`".format(request.sid, name))
            #             return
            #     # wrong format

        @socketio.on('disconnect')
        def disconnect():
            client_dict.pop(request.sid, None)
            print("[{}] Connection ended.".format(request.sid))

    def start_server(self):
        app = Flask(__name__, template_folder="../html", static_folder="../html")
        app.config['SECRET_KEY'] = 'secret_websocket_server'
        self.socketio = SocketIO(app)
        self.__build(app, self.socketio)
        self.socketio.run(app, host=self.location, port=self.port, allow_unsafe_werkzeug=True, debug=False)
