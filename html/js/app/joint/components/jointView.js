var joint_view = {
  template: `
  <div class="frame_1">
    <el-row>
      <el-col :span="24">
        <div class="shower">
          <canvas id="renderCanvas" touch-action="none"></canvas>
        </div>
      </el-col>
    </el-row>
  </div>
`,
  props: ["parent"],
  data: function () {
    return {
      name: "",
      engine: null,
      scene: null,
      sceneToRender: null,
      canvas: null,
      robot: null,
      sphereL: null,
      sphereL2: null,
      sphereH: null,
      picker: null,
    };
  },
  mounted: function () {
    this.init3DView();
    this.setJointPosition('shoulder',80)
  },
  methods: {
    setJointPosition:function (target, deg) {
      if (target == "base") {
        this.robot.rotation.y = BABYLON.Angle.FromDegrees(deg).radians();
      }
      if (target == "shoulder") {
        this.sphereL.rotation.x = BABYLON.Angle.FromDegrees(deg).radians();
      }
      if (target == "elbow") {
        this.sphereH.rotation.x = BABYLON.Angle.FromDegrees(deg).radians();
      }
    },
    setJointPositionRad:function (data) {
        this.robot.rotation.y = data[0];
        this.sphereL.rotation.x = data[1];
        this.sphereH.rotation.x = data[2];
        this.picker.rotation.y = data[3];
    },
    createScene: function () {
      this.scene = new BABYLON.Scene(this.engine);
      //1名称，2水平旋转，3垂直旋转，4距离，5 摄像机目标位置
      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 4,
        (1.4 * Math.PI) / 4,
        14,
        new BABYLON.Vector3(-1, 4, 0)
      );
      camera.attachControl(this.canvas, true);
      var light = new BABYLON.DirectionalLight(
        "dir01",
        new BABYLON.Vector3(-1, -2, -1),
        this.scene
      );
      light.position = new BABYLON.Vector3(40, 80, 40);
      light.intensity = 1.5; //强度
      const groundMat = new BABYLON.StandardMaterial("groundMat");
      groundMat.diffuseColor = new BABYLON.Color3(0.203, 0.162, 0.014);

      const ground = BABYLON.MeshBuilder.CreateGround("ground", {
        width: 100,
        height: 100,
      });
      ground.material = groundMat;

      const whiteTexture = new BABYLON.StandardMaterial("whiteTexture");
      whiteTexture.diffuseColor = new BABYLON.Color3(
        0.7098039215686275,
        0.6509803921568628,
        0.25882352941176473
      );

      this.robot = this.buildRobot();
      this.robot.position.y = 0.8;

      //肩关节与底座连接片
      const roundPlate1 = this.build2LayerRoundPlate(
        "roundPlate1",
        0.7,
        0.7,
        0.8,
        0.1,
        0.2
      );
      const roundPlate2 = roundPlate1.clone("roundPlate2");

      roundPlate1.position.y = 1.2;
      roundPlate1.position.x = 0.75;
      roundPlate1.rotation.z = Math.PI / 2;

      roundPlate2.rotation.y = Math.PI;
      roundPlate2.rotation.z = Math.PI / 2;
      roundPlate2.position.x = -0.75;
      roundPlate2.position.y = 1.2;

      const doubleRoundPlate = BABYLON.Mesh.MergeMeshes([
        roundPlate1,
        roundPlate2,
      ]);
      doubleRoundPlate.parent = this.robot;

      //底座与肩关节连接处-回转关节-球体
      this.sphereL = BABYLON.MeshBuilder.CreateSphere("sphereL", {
        diameter: 0.5,
      });
      this.sphereL.parent = doubleRoundPlate;
      this.sphereL.position = new BABYLON.Vector3(0, 1.8, 0);
      // sphereL.rotation.x = Math.PI / 4;
      this.sphereL.checkCollisions = true;
      //肩关节-与底座片-连接轴
      const jointCylinder1 = BABYLON.MeshBuilder.CreateCylinder(
        "jointCylinder1",
        { diameter: 1, height: 2 }
      );
      jointCylinder1.parent = doubleRoundPlate;
      jointCylinder1.rotation.z = Math.PI / 2;
      jointCylinder1.position.y = 1.5;
      jointCylinder1.material = whiteTexture;

      //肩关节
      const mainBody = this.buildRoundPlate("mainBody", 0.7, 0.7, 3.6, 1.1);
      mainBody.parent = this.sphereL;
      mainBody.rotation.z = Math.PI / 2;
      mainBody.position.x = -0.55;
      mainBody.position.y = 1.5; //垂直高度
      //////////////////
      //肩关节与肘关节连接-球体
      this.sphereL2 = BABYLON.MeshBuilder.CreateSphere("sphereL2", {
        diameter: 0.5,
      });
      this.sphereL2.parent = mainBody;
      this.sphereL2.position = new BABYLON.Vector3(1.8, -0.5, 0);
      // sphereL2.checkCollisions = true;

      // robot.rotation.y = Math.PI/2
      // sphereL.rotation.x = Math.PI/2

      //肩关节与肘关节连接轴
      const jointCylinder2 = BABYLON.MeshBuilder.CreateCylinder(
        "jointCylinder2",
        { diameter: 0.5, height: 1.8 }
      );
      jointCylinder2.parent = mainBody;
      jointCylinder2.position.x = 1.9;
      jointCylinder2.position.y = -0.55;
      jointCylinder2.material = whiteTexture;

      //肩关节与肘关节连接片
      const controlPlate1 = this.build2LayerRoundPlate(
        "controlPlate1",
        0.6,
        0.6,
        1.6,
        0.2,
        0.2
      );
      const controlPlate2 = controlPlate1.clone();

      controlPlate1.rotation.z = Math.PI / 2;
      controlPlate2.rotation.z = Math.PI / 2;

      controlPlate1.position.x = 0.6;
      controlPlate2.position.x = -0.7;
      /////////////////////////////////////////

      const doubleControlPlate = BABYLON.Mesh.MergeMeshes([
        controlPlate1,
        controlPlate2,
      ]);

      doubleControlPlate.parent = this.sphereL2;
      doubleControlPlate.rotation.z = -Math.PI / 2;
      doubleControlPlate.position.x = 1;

      this.sphereH = BABYLON.MeshBuilder.CreateSphere("sphereH", {
        diameter: 0.5,
      });
      this.sphereH.parent = doubleControlPlate;
      this.sphereH.position = new BABYLON.Vector3(0, 1, 0);
      // sphereH.rotation.x = Math.PI / 4;
      this.sphereH.checkCollisions = true;

      const jointCylinder3 = BABYLON.MeshBuilder.CreateCylinder(
        "jointCylinder3",
        { diameter: 0.8, height: 1.8 }
      );
      jointCylinder3.parent = doubleControlPlate;
      jointCylinder3.rotation.z = Math.PI / 2;
      jointCylinder3.position.x = 0.05;
      jointCylinder3.position.y = 0.9;
      jointCylinder3.material = whiteTexture;

      const hanger = this.buildHanger();
      hanger.parent = this.sphereH;
      hanger.rotation.z = -Math.PI / 2;
      hanger.rotation.x = -Math.PI / 2;
      hanger.position.x = 0.35;
      hanger.position.z = -1.4;

      const hangerPlate = this.buildRoundPlate("hangerPlate", 0.4, 0.4, 1, 0.1);
      const hangerPlate2 = this.buildRoundPlate("hangerPlate2", 0.4, 0.4, 1, 0.1);
      hangerPlate.parent = hanger;
      hangerPlate2.parent = hanger;
      hangerPlate.position.x = -2;
      hangerPlate2.position.x = -2;
      hangerPlate2.position.y = -0.6;

      this.picker = BABYLON.MeshBuilder.CreateCylinder("picker", {
        diameter: 0.6,
        height: 0.8,
      });
      this.picker.parent = hanger;
      this.picker.position.x = -2.5;
      this.picker.position.y = -0.35;
      this.picker.rotation.y = Math.PI / 4;

      const pickerHead = BABYLON.MeshBuilder.CreateCylinder("pickerHead", {
        diameter: 0.4,
        height: 0.6,
      });
      pickerHead.parent = this.picker;
      pickerHead.position.z = -0.5;
      pickerHead.rotation.x = Math.PI / 2;
      this.picker.material = whiteTexture;
      pickerHead.material = whiteTexture;

      const sphereP = BABYLON.MeshBuilder.CreateSphere("sphereP", {
        diameter: 0.1,
      });
      sphereP.parent = pickerHead;
      sphereP.position = new BABYLON.Vector3(0, -0.3, 0);
      // sphereP.rotation.x = Math.PI / 4;
      sphereP.checkCollisions = true;

      const pickerPlate = this.buildRoundPlate("pickerPlate", 0.2, 0.2, 0.4, 0.1);
      pickerPlate.parent = sphereP;
      pickerPlate.rotation.y = Math.PI / 2;
      pickerPlate.position.z = 0.2;
      pickerPlate.material = whiteTexture;
      // pickerPlate.position.y = -0.2

      const pickerStick = BABYLON.MeshBuilder.CreateCylinder("pickerStick", {
        diameter: 0.1,
        height: 0.5,
      });
      pickerStick.parent = pickerPlate;
      pickerStick.position.x = -0.2;
      pickerStick.position.y = -0.35;

      const pickerPick = BABYLON.MeshBuilder.CreateBox("pickerPick", {
        width: 0.5,
        height: 0.5,
        depth: 0.05,
      });
      pickerPick.parent = pickerStick;
      pickerPick.rotation.x = Math.PI / 2;
      pickerPick.position.y = -0.2;

      //control

      // const changeJointBase = (y) => {
      //   robot.rotation.y = BABYLON.Angle.FromDegrees(y).radians();
      // };

      // const changeJoint1 = (x) => {
      //   sphereL.rotation.x = BABYLON.Angle.FromDegrees(x).radians();
      // };

      // const changeJoint2 = (y) => {
      //   sphereL2.rotation.y = BABYLON.Angle.FromDegrees(y).radians();
      // };

      // const changeJoint3 = (x) => {
      //   sphereH.rotation.x = BABYLON.Angle.FromDegrees(x).radians();
      // };

      // const changeJoint4 = (y) => {
      //   picker.rotation.y = BABYLON.Angle.FromDegrees(y).radians();
      // };

      // const changeJoint5 = (y) => {
      //   sphereP.rotation.y = BABYLON.Angle.FromDegrees(y).radians();
      // };

      // Skybox
      var skybox = BABYLON.MeshBuilder.CreateBox("wall", { size: 300 });
      var skyboxMaterial = new BABYLON.StandardMaterial("wall", this.scene);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
        "./js/app/joint/babylon/wall",
        this.scene
      );
      skyboxMaterial.reflectionTexture.coordinatesMode =
        BABYLON.Texture.SKYBOX_MODE;
      skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
      skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      skybox.material = skyboxMaterial;
      skybox.checkCollisions = true;

      // Shadows
      var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
      shadowGenerator.getShadowMap().renderList.push(this.robot);
      shadowGenerator.getShadowMap().renderList.push(doubleRoundPlate);
      shadowGenerator.getShadowMap().renderList.push(mainBody);
      shadowGenerator.getShadowMap().renderList.push(doubleControlPlate);
      shadowGenerator.getShadowMap().renderList.push(hanger);
      shadowGenerator.getShadowMap().renderList.push(hangerPlate);
      shadowGenerator.getShadowMap().renderList.push(hangerPlate2);
      shadowGenerator.getShadowMap().renderList.push(this.picker);
      shadowGenerator.getShadowMap().renderList.push(pickerHead);
      shadowGenerator.getShadowMap().renderList.push(pickerPick);
      shadowGenerator.getShadowMap().renderList.push(pickerStick);
      shadowGenerator.getShadowMap().renderList.push(pickerPlate);
      shadowGenerator.useVarianceShadowMap = true;
      ground.receiveShadows = true;
      skybox.receiveShadows = true;

      return this.scene;
    },
    initFunction: function () {
      // var asyncEngineCreation = async ()=> {
      //   try {
      //     return this.createDefaultEngine();
      //   } catch (e) {
      //     console.log(
      //       "the available createEngine function failed. Creating the default  this.engine instead"
      //     );
      //     return this.createDefaultEngine();
      //   }
      // };
      this.engine = this.createDefaultEngine();
      if (!this.engine) console.log(" this.engine should not be null.");
      this.startRenderLoop(this.engine, this.canvas);
      this.scene = this.createScene();
      
    },
    startRenderLoop: function (engine, canvas) {
      this.engine.runRenderLoop(()=> {
        if (this.sceneToRender && this.sceneToRender.activeCamera) {
          this.sceneToRender.render();
        }
      });
    },
    createDefaultEngine: function () {
      return new BABYLON.Engine(this.canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        disableWebGL2Support: false,
      });
    },
    //底座
    buildRobot: function () {
      const base = BABYLON.MeshBuilder.CreateCylinder("base", {
        diameter: 3.5,
        height: 1.5,
      }); //圆柱体
      // const base = BABYLON.MeshBuilder.CreateCapsule("base", {diameter: 3.5, height: 1.5});//胶囊体
      const myMaterial = new BABYLON.StandardMaterial("myMaterial", this.scene);
      myMaterial.diffuseColor = new BABYLON.Color3(0.53, 0.124, 0.041);
      base.material = myMaterial;
      return base;
    },
    build2LayerRoundPlate: function (name, r1, r2, width, depth, depth2) {
      const roundPlate = this.buildRoundPlate(
        name + "plate",
        r1,
        r2,
        width,
        depth
      );
      const plate = BABYLON.MeshBuilder.CreateCylinder(name, {
        diameter: r2 * 2,
        height: depth2,
      });
      plate.position.y = depth2 / 2;
      plate.position.x = width / 2;
      plate.parent = roundPlate;
      return roundPlate;
    },
    buildRoundPlate: function (name, r1, r2, width, depth) {
      const xCenterCircle1 = -(width / 2);
      const xCenterCircle2 = width / 2;
      const outline = [];
      for (let i = 0; i <= 40; i++) {
        const x = r1 * Math.cos(Math.PI / 2 + (i * Math.PI) / 40);
        const z = r1 * Math.sin(Math.PI / 2 + (i * Math.PI) / 40);
        outline.push(new BABYLON.Vector3(x + xCenterCircle1, 0, z));
      }
      for (let i = 0; i <= 40; i++) {
        const x = r2 * Math.cos((3 * Math.PI) / 2 + (i * Math.PI) / 40);
        const z = r2 * Math.sin((3 * Math.PI) / 2 + (i * Math.PI) / 40);
        outline.push(new BABYLON.Vector3(x + xCenterCircle2, 0, z));
      }
      const roundPlate = BABYLON.MeshBuilder.ExtrudePolygon(name, {
        shape: outline,
        depth,
      });
      return roundPlate;
    },
    buildHanger: function () {
      const roundPlate = this.buildRoundPlate("hangerPlate", 0.4, 0.5, 3, 0.7);
      // const cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder1", {diameter: 0.4, height: 0.5})
      // cylinder.parent = roundPlate
      // cylinder.rotation.x = Math.PI /2
      // cylinder.rotation.y = Math.PI /4
      // cylinder.position.x = -1.8
      // cylinder.position.y = -0.35
      return roundPlate;
    },
    init3DView: function () {
      this.canvas = document.getElementById("renderCanvas");
      this.initFunction()
      // .then(() => {
      //   this.sceneToRender = this.scene;
      // });
      this.sceneToRender = this.scene;
    },
  },
}