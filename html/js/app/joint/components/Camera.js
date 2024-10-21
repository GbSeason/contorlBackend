var joint_camera = {
  template: `
  <div class="frame" id="videoFrameBox">
    <img :src="videoContent" class="video-view" id="videoImageTag" />
    <!-- <img :src="videoContent_right" class="video-view" id="videoImageTagRight" /> -->
  </div>
  `,
  props: ['parent'],
  data: function () {
    return {
      videoContent: null,
      videoContent_right: null,
      imgTag: null,
      imgFrame: null,
      Xoff: 0,
      Yoff: 0,
      targetsDivBoxs: [],
      targetsLocBoxs: [],
    }
  },
  mounted: function () {
    this.imgTag = document.getElementById("videoImageTag");
    this.imgFrame = document.getElementById("videoFrameBox");
  },
  methods: {
    setVideo: function (data) {
      const blob = new Blob([data], { type: "image/jpeg" });
      this.videoContent = URL.createObjectURL(blob);
    },
    setVideoRight: function (data) {
      const blob = new Blob([data], { type: "image/jpeg" });
      this.videoContent_right = URL.createObjectURL(blob);
    },
    clearBoxs: function () {
      this.targetsDivBoxs.forEach((item) => {
        this.imgFrame.removeChild(item);
      });
      this.targetsDivBoxs = [];
      this.targetsLocBoxs = [];
    },
    getBox: function (index) {
      return this.targetsLocBoxs[index];
    },
    setBox: function (data) {
      this.clearBoxs();
      if (data.length > 2) {
        this.Xoff = this.imgTag.clientLeft;
        this.Yoff = this.imgTag.clientTop;
        //[{"frame": [[522.5556640625, 80.27911376953125, 28.788330078125, 38.64739990234375]], "conf": [0.27099180221557617]}]
        let datas = JSON.parse(data);
        if (datas && datas.length > 0) {
          datas.forEach((element) => {
            element.frame.forEach((item, index) => {
              let entity = { frame: [], conf: 0 };
              entity.frame = item;
              entity.conf = element.conf[index];
              let box = this.addTargetBox(entity, index);
              this.targetsLocBoxs.push(box);
            });
          });
        }
      }
    },
    addTargetBox: function (box, index) {
      var newDiv = document.createElement("div");
      // 设置新div的样式或属性
      let x_ = box.frame[0] - box.frame[2] / 2;
      let y_ = box.frame[1] - box.frame[3] / 2;
      let x = this.Xoff + x_;
      let y = this.Yoff + y_;
      let width = box.frame[2];
      let height = box.frame[3];
      newDiv.style.width = `${width}px`;
      newDiv.style.height = `${height}px`;
      newDiv.style.top = `${y}px`;
      newDiv.style.left = `${x}px`;
      newDiv.style.color = `red`;
      newDiv.style.position = "absolute";
      newDiv.style.border = "1px solid #FF0000";
      newDiv.innerText = `${index + 1}:${box.conf.toFixed(1)}`;
      // 将新div添加到父div中
      this.imgFrame.appendChild(newDiv);
      this.targetsDivBoxs.push(newDiv);
      this.cropImage(x_, y_, width, height, index);
      return [x, y, width, height];
    },
    cropImage: function (x, y, width, height, index) {
      // 创建一个Canvas元素
      let canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      // 获取Canvas上下文
      let ctx = canvas.getContext("2d");
      let img = new Image();
      img.src = this.videoContent;
      img.onload = () => {
        // 绘制图片的指定区域
        ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
        // 将Canvas转换为Base64编码的图片
        let base64Image = canvas.toDataURL("image/jpg");
        this.parent.drawImageToList(base64Image, index);
      };
    },
  },
}