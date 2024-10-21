var joint_main = {
    template: `
        <div class="home">
            <el-row class="bottom-line">
                <el-col :span="24">
                    <status ref="statusView" />
                </el-col>
            </el-row>
            <el-row class="bottom-line">
                <el-col :span="24" class="center-middle">
                    <camera-view ref="cameraView" :parent="this"></camera-view>
                    <target-list ref="targetListView" :parent="this"></target-list>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <joint-view ref="jointView"></joint-view>
                </el-col>
                <el-col :span="8">
                    <r-t-info></r-t-info>
                </el-col>
                <el-col :span="8">
                    <control :parent="this"></Control>
                </el-col>
            </el-row>
        </div>
    `,
    props: ['parent'],
    components: {
        cameraView: joint_camera,
        control: joint_control,
        jointView: joint_view,
        RTInfo: joint_rt_info,
        Status: joint_status,
        targetList: joint_target_list
    },
    data() {
        return {
            text: "",
            socket: null,
            SID: null,
            messageType: {
                msg: "message",//普通消息，暂未定义
                getVideo: "getVideo",//获取当前视图
                getVideoRight: "getVideoRight",//获取当前视图
                video: "video",//接收到视图
                videoRight: "videoRight",//接收到视图
                broadcast: "broadcast",//广播
                connected: "connected",//连接成功
                findTargets: "findTargets",//识别到目标
                motoInfo: "info",//机械臂信息
                action: "action",//执行动作
                actionWork: "actionWork",//执行作业
            },
            getVideoLoopId: null,
            currentImageData: null,
            currentImageRightData:null,
        }
    },
    mounted: function () {
        this.socketOpen();
        // this.resizeBody();
        // window.addEventListener("resize", () => {
        //     this.resizeBody();
        //   })
    },
    methods: {
        sizeChange: function (size) { },
        resizeBody: function () {
            document.getElementById("app").style.height = `${window.innerHeight}px`;
        },
        socketOpen: function () {
            this.socket = io();
            this.socket.on("response_fail", () => {
                console.log("Fail received.");
            });
            this.socket.on(this.messageType.connected, (data) => {
                console.log("connected sid==>" + data.sid);
                this.SID = data.sid;
                this.getVideoLoop();
            });
            this.socket.on(this.messageType.video, (data) => {
                if (data) {
                    this.$refs.statusView.setStatus("camera", 1)
                    this.currentImageData = data;
                    this.$refs.cameraView.setVideo(data);
                } else {
                    this.$refs.statusView.setStatus("camera", 0)
                }
            });
            this.socket.on(this.messageType.videoRight, (data) => {
                if (data) {
                    this.currentImageRightData = data;
                    this.$refs.cameraView.setVideoRight(data);
                }
            });
            this.socket.on(this.messageType.findTargets, (data) => {
                // console.log("find Targets", data);
                this.$refs.targetListView.showTargets(data);
                this.$refs.cameraView.setBox(data);
            });
            this.socket.on(this.messageType.motoInfo, (data_arm) => {
                console.log("motoInfo", data_arm);
                if(data_arm && data_arm != 'null'){
                    let armData = JSON.parse(data_arm);
                    this.$refs.jointView.setJointPositionRad([armData.b, armData.s*-1, Math.PI/2-armData.e,
                     (Math.PI*1.5)-armData.t,
                    //armData.t > Math.PI?( armData.t - Math.PI/2 ):(armData.t - Math.PI)
                     ])
                }
            });

        },
        drawImageToList: function (imgCopy, index) {
            //截取的画面绘制到列表中
            this.$refs.targetListView.setListImageBoxSrc(imgCopy, index);
        },
        getVideoLoop: function () {
            this.getVideoLoopId = setInterval(() => {
                this.socketSendmsg(this.messageType.getVideo, "");
                this.socketSendmsg("message", "info");
                // this.socketSendmsg(this.messageType.getVideoRight, ""); //调左右摄像头焦距时用
            }, 200);
        },
        action: function (index) {
            // 执行时，需要按照一下步骤进行：1存储选择的所有box；2将选择的box传入后台；3后台记录所有选择的box，记录机械臂当前所有状态，4依次执行选择的box
            // 目前为每次执行一个目标
            let box = this.$refs.cameraView.getBox(index);
            this.socketSendmsg(this.messageType.actionWork, box);
        },
        socketSendmsg: function (type, msg) {
            // 发送消息
            if (this.socket) {
                // console.log(type,msg);
                this.socket.emit(type, msg);
            }
        },
    }
}