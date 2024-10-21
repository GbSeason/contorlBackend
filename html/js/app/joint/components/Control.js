var joint_control = {
    template: `
    <div class="frame_1">
        <el-row>
            <el-col :span="8">
                <el-button @click="getMotoInfoLoop">GET INFO</el-button>
                <el-button @click="startScanTarget">Start scan</el-button>
                <el-button @click="stopScanTarget">Stop scan</el-button>                
            </el-col>
            <el-col :span="8">
                <div class="control-frame">
                    <div class="front">
                        <i class="el-icon-caret-left" type="4" id="front-button"></i>
                    </div>
                    <div id="direction-keys">
                        <div type="0" class="quarter up"></div>
                        <div type="1" class="quarter right"></div>
                        <div type="2" class="quarter down"></div>
                        <div type="3" class="quarter left"></div>
                        <div class="center"></div>
                    </div>
                    <div class="back">
                        <i class="el-icon-caret-right" type="5" id="back-button"></i>
                    </div>
                </div>
            </el-col>
            <el-col :span="8">

            </el-col>
        </el-row>
    </div>
`,
    props: ['parent'],
    data: function () {
        return {
            keyDown: false,
            normalColor: "#64d4b8",
            overColor: "#e49b48",
            downColor: "#f16560",
            intervalIds: [],
            directionCodes: { up: "0", right: "1", down: "2", left: "3", front: "4", back: "5" },
            getMotoIntervalId: [],
            timeStemp: 0
        }
    },
    mounted: function () {
        this.initControl();
        this.initControlMouse();
        this.getMotoInfoLoop();
    },
    methods: {
        startScanTarget: function () {
            this.parent.socketSendmsg("startScanTarget","")
        },
        stopScanTarget: function () {
            this.parent.socketSendmsg("stopScanTarget","")
        },
        getMotoInfoLoop: function () {
            this.parent.socketSendmsg("message", "info")
            // this.getMotoIntervalId.forEach(item=>{
            //     clearInterval(item);
            // })
            // let intervalId = setInterval(() => {
            //     this.parent.socketSendmsg("message","info")
            // }, 3000)
            // this.getMotoIntervalId.push(intervalId)
        },
        startAction: function (direction) {
            this.stopAction()
            // 0:up  1:right 2:down 3:left 4:front 5:back
            // let intervalId = setInterval(() => {
            this.parent.socketSendmsg("action", direction)
            // }, 20)
            // this.intervalIds.push(intervalId)
        },
        stopAction: function () {
            if (+new Date() - this.timeStemp > 5) {
                this.parent.socketSendmsg("stopAction", "stopAction")
            }
            this.timeStemp = +new Date()
            // this.intervalIds.forEach(item=>{
            //     clearInterval(item);
            // })
        },
        addListener: function (dom) {
            dom.addEventListener("mousedown", (event) => {
                event.target.style.backgroundColor = this.downColor;
                this.startAction(event.target.getAttribute("type"))
            })
            dom.addEventListener("mouseup", (event) => {
                event.target.style.backgroundColor = this.overColor;
                this.stopAction()
            })
            dom.addEventListener("mouseover", (event) => {
                event.target.style.backgroundColor = this.overColor;
            })
            dom.addEventListener("mouseout", (event) => {
                event.target.style.backgroundColor = this.normalColor;
            })
            document.addEventListener("mouseup", (event) => {
                this.stopAction()
            })
        },
        initControlMouse: function () {
            const keys = document.getElementById('direction-keys').children;
            for (let i = 0; i < 4; i++) {
                this.addListener(keys[i])
            }
            let front = document.getElementById('front-button');
            let back = document.getElementById('back-button');
            this.addListener(front)
            this.addListener(back)
        },
        initControl: function () {
            document.addEventListener('keydown', (event) => {
                if (this.keyDown) {
                    return;
                }
                this.keyDown = true;
                const keys = document.getElementById('direction-keys').children;
                switch (event.keyCode) {
                    case 37: // left
                        keys[3].style.backgroundColor = this.downColor;
                        this.startAction(this.directionCodes.left)
                        break;
                    case 38: // up
                        keys[0].style.backgroundColor = this.downColor;
                        this.startAction(this.directionCodes.up)
                        break;
                    case 39: // right
                        keys[1].style.backgroundColor = this.downColor;
                        this.startAction(this.directionCodes.right)
                        break;
                    case 40: // down
                        keys[2].style.backgroundColor = this.downColor;
                        this.startAction(this.directionCodes.down)
                        break;
                    case 70: // front
                        document.getElementById('front-button').style.backgroundColor = this.downColor;
                        this.startAction(this.directionCodes.front)
                        break;
                    case 66: // back
                        document.getElementById('back-button').style.backgroundColor = this.downColor;
                        this.startAction(this.directionCodes.back)
                        break;
                }
            });

            document.addEventListener('keyup', (event) => {
                this.keyDown = false;
                const keys = document.getElementById('direction-keys').children;
                this.stopAction()
                switch (event.keyCode) {
                    case 37: // left
                        keys[3].style.backgroundColor = this.normalColor;
                        break;
                    case 39: // right
                        keys[1].style.backgroundColor = this.normalColor;
                        break;
                    case 38: // up
                        keys[0].style.backgroundColor = this.normalColor;
                        break;
                    case 40: // down
                        keys[2].style.backgroundColor = this.normalColor;
                        break;
                    case 70: // front
                        document.getElementById('front-button').style.backgroundColor = this.normalColor;
                        break;
                    case 66: // back
                        document.getElementById('back-button').style.backgroundColor = this.normalColor;
                        break;
                }
            });
        }
    },
}