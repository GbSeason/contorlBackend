//自定义应用列表 
//====注：有依赖关系的js文件需要先加载被依赖者，放在数组前面，应用初始化js放在最后====
//====应用appValueName不能重复 ====
// var random = Math.random()
var app_list = [
    // {
    //     name:"PMS",
    //     des:"生产管理系统",
    //     target:["/js/app/pms_app_dashboard.js"+rand,
    //         "/js/app/pms_app_base_manage.js"+rand,
    //         "/js/app/pms_app_print.js"+rand,
    //         "/js/app/pms_app_product.js"+rand,
    //         "/js/app/pms_app_produce.js"+rand,
    //         "/js/app/pms_app_costing.js"+rand,
    //         "/js/app/app_pms.js"+rand],
    //     appValueName:"app_pms",//变量名
    //     permissions:{
    //             white:[
    //                 {
    //                     name:'costing',
    //                     users:['880001']
    //                 },
    //                 {
    //                     name:'baseManage',
    //                     users:['880001']
    //                 },
    //                 ],
    //             black:[]
    //             },
    //     belongTo:"880",
    //     show:false,
    //     opening:false,
    //     version:"1.0",
    //     icon:"el-icon-box"
    // },
    {
        name: "Joint",
        des: "0.0.1",
        target: [
            "/js/app/joint/css/joint.css" + rand,
            
            "/js/app/joint/babylon/dat.gui.min.js" + rand,
            "/js/app/joint/babylon/ammo.js" + rand,
            "/js/app/joint/babylon/cannon.js" + rand,
            "/js/app/joint/babylon/Oimo.js" + rand,
            "/js/app/joint/babylon/earcut.min.js" + rand,
            "/js/app/joint/babylon/babylon.js" + rand,
            "/js/app/joint/babylon/babylonjs.materials.min.js" + rand,
            "/js/app/joint/babylon/babylonjs.proceduralTextures.min.js" + rand,
            "/js/app/joint/babylon/babylonjs.postProcess.min.js" + rand,
            "/js/app/joint/babylon/babylonjs.loaders.js" + rand,
            "/js/app/joint/babylon/babylonjs.serializers.min.js" + rand,
            "/js/app/joint/babylon/babylon.gui.min.js" + rand,
            "/js/app/joint/babylon/babylon.inspector.bundle.js" + rand,
            
            "/js/app/joint/components/socket.io.js" + rand,
            "/js/app/joint/components/Camera.js" + rand,
            "/js/app/joint/components/Camera.js" + rand,
            "/js/app/joint/components/Control.js" + rand,
            "/js/app/joint/components/jointView.js" + rand,
            "/js/app/joint/components/RTInfo.js" + rand,
            "/js/app/joint/components/Status.js" + rand,
            "/js/app/joint/components/TargetList.js" + rand,
            "/js/app/joint/joint_main.js" + rand
        ],
        appValueName: "joint_main",//变量名
        belongTo: null,
        version: "1.0",
        show: false,
        opening: false,
        icon: "el-icon-news"
    },
    // {
    //     name:"人员管理",
    //     des:"人员管理",
    //     target:["/js/app/user_manage.js"+rand],
    //     appValueName:"user_manage_main",//变量名
    //     belongTo:"000",
    //     version:"1.0",
    //     show:false,
    //     opening:false,
    //     icon:"el-icon-news"
    // }
]