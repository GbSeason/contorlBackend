function byId(id) {
    return document.getElementById(id)
}
function getTime() {
    let d = new Date()
    return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function getDateTimeStr() {
    let dstr = this.getTime();
    return `${dstr.substr(5, 2)}${s.substr(8, 2)}${s.substr(11, 2)}${s.substr(14, 2)}${s.substr(0, 4)}.00`
}
var globe_deviceInfo = null;
var intervalId = 0;
var intervalIdMem = 0;
var allAppEntitys = [];



//====连接设备===
var loginView = {
    template: `
        <div>
            <el-row>
                <el-col :span="24" class="center-h" style="margin-bottom:10px;">
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24" class="center-h">
                    <label class="device-title">用户登录</label>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24" class="center-h m-top-20">
                <div class="bg-conn-form">
                    <el-row class="center-v">
                        <el-col :span="5" class="right-h">
                            账号:
                        </el-col>
                        <el-col :span="19" class="left-h">
                            <el-input class="m-left-20 width-text" v-model="deviceInfo.username" 
                                size="small" placeholder="请输入账号"></el-input>
                        </el-col>
                    </el-row>
                    <el-row class="m-top-20 center-v">
                        <el-col :span="5" class="right-h">
                            密码:
                        </el-col>
                        <el-col :span="19" class="left-h">
                            <el-input type="password" class="m-left-20 width-text" 
                                v-model="deviceInfo.password" size="small" placeholder="请输入密码"></el-input>
                        </el-col>
                    </el-row>
                    </div>
                </el-col>
            </el-row>
            <el-row class="m-top-20">
                <el-col :span="24" class="center-h">
                    <div style="width:469px;display: flex;justify-content:space-between;align-items: center;">
                        <el-progress :color="'#ccbd00'" v-show="connecting" :percentage="perc" stroke-width=10 
                                style="width:200px;" status="warning" :show-text="false"></el-progress>
                        <div>&nbsp;</div>
                        <el-button type="primary" :loading="connecting" round @click="connectDevice"
                            style="margin-left: 10px;">登录</el-button>
                    </div>
                </el-col>
            </el-row>
        </div>
    `,
    props: ['parent'],
    data() {
        return {
            perc: 0,
            connecting: false,
            deviceInfo: {
                username: '',//'192.168.1.4''fd53:7cb8:383:4::67','10.64.74.35'
                password: ''
            }
        }
    },
    mounted: function () {
        this.checkUserSession()
    },
    methods: {
        checkUserSession: function () {
            let userSession = localStorage.getItem("userSession")
            if (userSession && typeof userSession == 'string' && userSession.length > 20) {
                let user = JSON.parse(userSession)
                if ((+new Date() - user.session_time) > 1000 * 86400) {
                    localStorage.removeItem("userSession")
                } else {
                    this.parent.loginInfo = user;
                    globe_deviceInfo = user;
                    this.parent.viewPage = 2;
                }
            }
        },
        connectDevice: function () {
            if (isEmpty(this.deviceInfo.username)) {
                this.$notify({
                    title: '消息',
                    message: "请填写用户名",
                    type: 'warning',
                    duration: 2000
                });
                return;
            }
            if (isEmpty(this.deviceInfo.password)) {
                this.$notify({
                    title: '消息',
                    message: "请填写密码",
                    type: 'warning',
                    duration: 2000
                });
                return;
            }
            this.connecting = true;
            let connectInterval = setInterval(() => {
                if (this.perc < 100) {
                    if (this.perc < 90) {
                        this.perc += 10
                    } else {
                        this.perc += 1
                    }

                }
            }, 1000)
            postAPI(
                "/api/login",
                {
                    login_name: this.deviceInfo.username,
                    login_pwd: md5(this.deviceInfo.password, this.deviceInfo.password, false)
                },
                (response) => {
                    this.connecting = false;
                    if (response && response.data.length == 1) {
                        if (response.data[0].session_id) {
                            this.parent.loginInfo = response.data[0];
                            this.perc = 0
                            clearInterval(connectInterval)
                            this.$notify({
                                title: '消息',
                                message: "登录成功",
                                duration: 2000
                            });
                            localStorage.setItem("userSession", JSON.stringify(response.data[0]));
                            this.connecting = false;
                            this.parent.deviceInfo = this.deviceInfo;
                            globe_deviceInfo = response.data[0];
                            this.parent.viewPage = 2;
                        } else {
                            this.$notify({
                                title: '消息',
                                message: "用户名/密码错误",
                                duration: 2000
                            });
                        }
                    } else {
                        this.$notify({
                            title: '消息',
                            message: "用户名/密码错误",
                            duration: 2000
                        });
                    }
                })
            //            pywebview.api.connectDevice(this.deviceInfo.ip,deviceInfo.port).then(()=>{
            //                this.parent.viewPage = 2;
            //            })
        }
    }
}

//====测试页===
var desktop = {
    components: {

    },
    template: `
        <div class="desk-top">
            <div v-for="app in userAppList" :key="app.name" class="app-desk-icon"
               :title="app.des" @click="openApp(app)">
                <div v-loading="app['opening']">
                    <i :class="app.icon" style="font-size:40px"></i>
                </div>
                <div>{{app.name}}</div>
            </div>
        </div>
    `,
    props: ['parent'],
    data() {
        return {
            w: 0,
            h: 0,
            packageList: [],
            consoleInfo: "",
            logHeight: '100px',
            currentMenu: 1,
            userAppList: []
        }
    },
    mounted: function () {
        this.sizeChange(this.parent.windowWidth, this.parent.windowHeight)
        this.makeUserApp()
    },
    methods: {
        makeUserApp: function () {
            this.userAppList = [];
            app_list.forEach(item => {
                //所有
                // if(globe_deviceInfo.company_num == item.belongTo || globe_deviceInfo.company_num == '000'){
                this.userAppList.push(item)
                // }
            })
        },
        openApp: function (app) {
            if (app.show) {
                return;
            }
            if (app.opening) {
                return
            }
            app['opening'] = true;
            //图标loading
            if (typeof window[app.appValueName] != 'object') {
                //加载app对应的模块
                this.load_app_script(app.target, 0, () => {
                    //创建窗口
                    this.create_window(app)
                    //加载完成后停止loading
                    app['opening'] = false;
                })
            } else {
                this.create_window(app)
                app['opening'] = false;
            }
        },
        load_app_script: function (loads, index, back) {
            let item = loads[index]
            if (item) {
                if(item.indexOf(".js?") >=0){
                    loadScript(item, () => {
                        if (index + 1 < loads.length) {
                            this.load_app_script(loads, index + 1, back)
                        } else {
                            back()
                        }
                    });
                }
                if(item.indexOf(".css?") >=0){
                    loadCSS(item, () => {
                        if (index + 1 < loads.length) {
                            this.load_app_script(loads, index + 1, back)
                        } else {
                            back()
                        }
                    });
                }
            } else {
                back()
            }
        },
        create_window: function (app) {
            if (!app.appValueName) {
                return
            }
            //app.appValueName
            let newDiv = document.createElement("div");
            let titleId = app.appValueName + "_title_bar";
            let bodyId = app.appValueName + "_body";
            let windowId = app.appValueName + "_window";
            // 设置div的样式
            newDiv.id = windowId
            // 设置div的内容
            newDiv.innerHTML = `
                <div id="${bodyId}" class="app-window-body">
                    <app-main-view ref="appMainView" :parent="this"></app-main-view>
                </div>
            `;
            // 将div添加到body中
            document.body.appendChild(newDiv);
            let app_vue = null;
            //创建jquery窗口
            let win_app = $("#" + windowId).dialog({
                width: 1240,
                height: 600,
                title: `${app.name}-${app.des}`,
                closeOnEscape: false,
                close: () => {
                    app_vue.onClose && app_vue.onClose();
                    //关闭后销毁所有对象
                    console.log(app.name + " closed")
                    $('#' + windowId).remove();
                    newDiv = null;
                    app_vue = null;
                    app["show"] = false;
                    app["opening"] = false;
                    $("#" + windowId).dialog("destroy");
                },
                resize: (event, ui) => {
                    if (app_vue) {
                        app_vue.sizeChange(ui.size)
                    }
                },
                open: (event, ui) => {
                    if (app_vue) {
                        setTimeout(() => {
                            app_vue.sizeChange(ui.size)
                        }, 500)

                    }
                }
            });
            app_vue = this.insertApp(bodyId, titleId, app)
            let appEntity = {
                wid: windowId,
                win: win_app,
                vue: app_vue,
                dom: newDiv,
                dat: app
            }
            allAppEntitys.push(appEntity)
            //设置全局变量
            app["show"] = true

        },
        insertApp: function (bodyId, titleId, app) {
            //为app创建新的vue对象
            let app_vue = new Vue({
                el: '#' + bodyId,
                components: {
                    'app-main-view': eval(app.appValueName)
                },
                data: {
                },
                mounted: () => {
                },
                methods: {
                    sizeChange: function (size) {
                        if (this.$refs.appMainView) {
                            this.$refs.appMainView.sizeChange(size)
                        }
                    },
                    onClose: function () {
                        this.$refs.appMainView.onClose && this.$refs.appMainView.onClose()
                    },
                    permission_check: function (fun_name) {
                        let pass = false;
                        let inList = 0;
                        if (app.permissions) {
                            if (app.permissions.white) {
                                app.permissions.white.forEach((per) => {
                                    if (per.name == fun_name) {
                                        inList = 1
                                        if (per.users.indexOf(globe_deviceInfo.login_name) >= 0) {
                                            pass = true;
                                        } else {
                                            pass = false;
                                        }
                                    }
                                })
                            }
                            if (app.permissions.black) {
                                app.permissions.black.forEach((per) => {
                                    if (per.name == fun_name) {
                                        inList = 2
                                        if (per.users.indexOf(globe_deviceInfo.login_name) >= 0) {
                                            pass = false;
                                        } else {
                                            pass = true;
                                        }
                                    }
                                })
                            }
                        }
                        return inList == 0 ? true : pass;
                    }
                }
            })
            return app_vue;
        },
        sizeChange: function (w, h) {
            this.w = w;
            this.h = h;
        }
    }
}
//====主页面===
var mainView = {
    components: {
        'desktop': desktop,
        'loginView': loginView
    },
    template: `<div id="mainviewdiv">
                <!-- <el-row v-if="viewPage == 2">
                    <el-col :span="24" style="display: flex;justify-content: center;">
                        <div class="title-bar-div"></div>
                        <div class="title-bar-div-txt">
                            <div v-if="connect_ok" style="color:#00f900;display: flex;align-items: center;">
                                <i class="el-icon-circle-check" style="color: #00f900"/>
                                <el-dropdown @command="handleMainMenuClick" style="margin-left:5px;cursor:pointer;">
                                  <span class="el-dropdown-link" style="color: #ffffff;">
                                    {{loginInfo.name}}[{{loginInfo.login_name}}]
                                    <i class="el-icon-arrow-down el-icon--right"></i>
                                  </span>
                                  <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item command="1">修改密码</el-dropdown-item>
                                    <el-dropdown-item command="2">我的信息</el-dropdown-item>
                                    <el-dropdown-item command="3">退出</el-dropdown-item>
                                  </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                        </div>
                    </el-col>
                </el-row> -->
                <el-row style="height: calc(100% - 50px);display: flex;align-items: center;">
                    <el-col :span="24" style="display: flex;justify-content: center;height: 100%;">
                        <div class="main-panel" v-bind:style="{justifyContent: viewPage == 1?'center':'start'}">
                            <!-- <loginView v-if="viewPage == 1" :parent="this"></loginView>-->
                            <desktop v-if="viewPage == 2" ref="testViewRef" :parent="this"></desktop>
                        </div>
                    </el-col>
                </el-row>
                <el-dialog title="修改密码" width="350px"
                :close-on-press-escape="false"
                :close-on-click-modal="false"
                :visible.sync="showUpPwdDialog" :destroy-on-close="true" :modal="false">
                    <el-form ref="form" label-width="100px" :inline="true" size="mini">
                        <el-form-item label="原密码">
                            <el-input  show-password v-model="mainForm.pwd_old" placeholder="请输入原密码"
                            size="mini" style="width:180px" :maxlength="16"></el-input>
                        </el-form-item>
                        <el-form-item label="新密码">
                            <el-input  show-password v-model="mainForm.pwd_new" placeholder="请输入新密码"
                            size="mini" style="width:180px" :maxlength="16"></el-input>
                        </el-form-item>
                        <el-form-item label="重复新密码">
                            <el-input  show-password v-model="mainForm.pwd_new_repeat" placeholder="请输入新密码"
                            size="mini" style="width:180px" :maxlength="16"></el-input>
                        </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                        <el-button type="primary" @click="savePwd" size="mini" :loading="savingPwd">保存</el-button>
                        <el-button  @click="showUpPwdDialog = false" size="mini">关闭</el-button>
                    </span>
                </el-dialog>
                <el-dialog title="我的信息" width="350px"
                :close-on-press-escape="false"
                :close-on-click-modal="false"
                :visible.sync="showUserInfoDialog" :destroy-on-close="true" :modal="false">
                    <el-row>
                        <el-col :span="24">
                            <div style="display: flex;flex-direction: column;">
                                <div style="margin-top:10px;">名称: {{loginInfo.name}}</div>
                                <div style="margin-top:10px;">登录账号: {{loginInfo.login_name}}</div>
                                <div style="margin-top:10px;">公司名称: {{loginInfo.company_name}}</div>
                            </div>
                        </el-col>
                    </el-row>
                    <span slot="footer" class="dialog-footer">
                        <el-button  @click="showUserInfoDialog = false" size="mini">关闭</el-button>
                    </span>
                </el-dialog>
            </div>`,

    data() {
        return {
            savingPwd: false,
            showUserInfoDialog: false,
            showUpPwdDialog: false,
            viewPage: 2,
            loginInfo: {},
            windowHeight: document.body.clientHeight,
            windowWidth: document.body.clientWidth,
            connect_ok: true,
            deviceInfo: {
                ip: '',
                port: null,
                logPath: ''
            },
            mainForm: {
                idkey: "",
                pwd_old: '',
                pwd_new: '',
                pwd_new_repeat: ''
            }
        }
    },
    mounted: function () {
        window.addEventListener('resize', () => {
            this.getWinSize();
        });
        this.getWinSize();
    },
    methods: {
        savePwd: function () {
            if (!this.mainForm.pwd_old || !this.mainForm.pwd_new || !this.mainForm.pwd_new_repeat) {
                this.$notify({
                    title: '提醒',
                    type: 'warning',
                    message: '各项都须填写'
                });
                return;
            }
            if (this.mainForm.pwd_new != this.mainForm.pwd_new_repeat) {
                this.$notify({
                    title: '提醒',
                    type: 'warning',
                    message: '两次新密码输入不一致'
                });
                return;
            }
            this.savingPwd = true;
            this.mainForm.idkey = globe_deviceInfo.idkey;
            let cloneForm = cloneData(this.mainForm);
            cloneForm.pwd_new_repeat = cloneForm.pwd_new = md5(cloneForm.pwd_new, cloneForm.pwd_new, false)
            cloneForm.pwd_old = md5(cloneForm.pwd_old, cloneForm.pwd_old, false)
            postAPI(
                "/api/update_user_authentication",
                cloneForm,
                (response) => {
                    if (response.res) {
                        this.$notify({
                            title: '提醒',
                            type: 'success',
                            message: '密码修改成功，请重新登录'
                        });
                        this.showUpPwdDialog = false;
                        this.logout();
                    } else {
                        this.$notify({
                            title: '提醒',
                            type: 'error',
                            message: '密码修改失败 / 原密码不正确'
                        });
                    }
                    this.savingPwd = false;
                }
            )

        },
        handleMainMenuClick: function (command) {
            if (command == 1) {
                this.showUpPwdDialog = true;
            }
            if (command == 2) {
                this.showUserInfoDialog = true;
            }
            if (command == 3) {
                this.$confirm('确认退出?', '退出提醒', {
                    confirmButtonText: '退出',
                    cancelButtonText: '取消',
                    dangerouslyUseHTMLString: true,
                    type: 'warning'
                }).then(() => {
                    this.logout();
                }).catch(() => {

                });
            }
        },
        logout: function () {
            allAppEntitys.forEach((entity) => {
                if (entity.dom) {
                    entity.vue.onClose && entity.vue.onClose();
                    $('#' + entity.wid).remove();
                    entity.dom = null;
                    entity.vue = null;
                    entity.dat["show"] = false;
                    entity.dat["opening"] = false;
                    $("#" + entity.wid).dialog("destroy");
                }
            })
            localStorage.removeItem("userSession")
            localStorage.removeItem("printList_pms")
            this.viewPage = 1;
        },
        onConnectChange: function (status) {
            this.connect_ok = status
        },
        getWinSize: function () {
            this.windowHeight = window.innerHeight;
            this.windowWidth = window.innerWidth;
            let mv = byId('mainviewdiv')
            mv.style.height = (this.windowHeight) + 'px';
            mv.style.width = (this.windowWidth) + 'px';
            this.$refs.testViewRef && this.$refs.testViewRef.sizeChange(this.windowWidth, this.windowHeight)
        }
    }
}



//===============从这里开始============
var appMain = new Vue({
    el: '#App',
    components: {
        'main-view': mainView
    },
    data: {
    },
    mounted: () => {

    },
    methods: {
        messageListener: function (message) {
            if (message.indexOf("连接断开") >= 0) {
                this.$refs.mainView.onConnectChange(false)
            }
            if (message.toLowerCase().indexOf("connect android success") >= 0) {
                this.$refs.mainView.onConnectChange(true)
            }
            if (message != "connect android success") {
                this.$notify({
                    title: '消息',
                    message: message,
                    duration: 2000
                });
            }
        }
    }
})