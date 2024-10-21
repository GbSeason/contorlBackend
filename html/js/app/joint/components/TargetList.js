var joint_target_list = {
  template: `
  <div class="frame_1">
    <div v-for="(item, index) in targets" :key="index" class="target">
      <img class="backgroundimg" :id="boxName+index">
      <div class="actions">
        <div class="button-border" @click="action(item, index)">执行</div>
      </div>
    </div>
  </div>
`,
  props: ["parent"],
  data: function () {
    return {
      boxName: "targetBox_",
      targets: []
    };
  },
  methods: {
    showTargets: function(data) {
      this.targets = [];
      if (data.length > 2) {
        //[{"frame": [[522.5556640625, 80.27911376953125, 28.788330078125, 38.64739990234375]], "conf": [0.27099180221557617]}]
        let datas = JSON.parse(data);
        if (datas && datas.length > 0) {
          datas.forEach((element) => {
            element.frame.forEach((item, index) => {
              let entity = { frame: [], conf: 0 };
              entity.frame = item;
              entity.conf = element.conf[index];
              this.targets.push(entity);
            });
          });
        }
      }
    },
    setListImageBoxSrc: function(imgCopy,index){
       let boxEntity = document.getElementById(`${this.boxName}${index}`)
       if(boxEntity){
            boxEntity.src = imgCopy;
       }
    },
    action: function(item, index) {
      // 执行时，需要按照一下步骤进行：1存储选择的所有box；2将选择的box传入后台；3后台记录所有选择的box，记录机械臂当前所有状态，4依次执行选择的box
      // 目前为每次执行一个目标
      this.parent.action(index)
    },
  },
}

