var joint_status = {
  template: `
  <div class="status-line">
    <div class="status-cell-frame" v-for="cell in statusList" :key="cell.name">
      <div :class="cell.status ? 'status-cell status-normal' : 'status-cell status-error'"></div>
      <label class="cell-title">{{ cell.name }}</label>
    </div>
  </div>
`,
  props:[],
  data: function () {
    return {
      statusList: [
        {
          name: 'camera',
          status: 1
        },
        {
          name: 'joint1',
          status: 1
        },
        {
          name: 'joint2',
          status: 1
        },
        {
          name: 'joint3',
          status: 1
        },
        {
          name: 'joint4',
          status: 1
        },
        {
          name: 'joint5',
          status: 1
        }
      ]
    }
  },
  methods: {
    setStatus: function(name, status) {
      this.statusList.forEach(item => {
        if (item.name == name) {
          item.status = status
        }
      })
    },
  }
}
