var user_manage_add_user = {
    template:`<div>
        <el-dialog title="新增人员" :visible.sync="showView" width="500px"
            :close-on-press-escape="false"
            :close-on-click-modal="false"
            :modal="false">
            <el-row>
                <el-col :span="24">
                    <el-form ref="personFormRef" :model="userInfo" :rules="userInfoRules" size="mini" label-width="100px"
                        label-position="left" >
                        <el-form-item label="姓名">
                            <el-input v-model="userInfo.name" placeholder="请输入姓名"></el-input>
                        </el-form-item>
                        <el-form-item label="登录名">
                            <el-input v-model="userInfo.login_name" placeholder="请输入登录名"></el-input>
                        </el-form-item>
                        <el-form-item label="电话">
                            <el-input v-model="userInfo.phone" placeholder="请输入电话"></el-input>
                        </el-form-item>
                        <!-- <el-form-item label="性别">
                            <el-radio-group v-model="userInfo.gender">
                                <el-radio label="男"></el-radio>
                                <el-radio label="女"></el-radio>
                            </el-radio-group>
                        </el-form-item> -->
                        <el-form-item label="公司代码">
                            <el-input v-model="userInfo.company_num" placeholder="请输入公司代码"></el-input>
                        </el-form-item>
                        <el-form-item label="公司名称">
                            <el-input v-model="userInfo.company_name" placeholder="请输入公司名称"></el-input>
                        </el-form-item>
                        <el-form-item label="简介">
                            <el-input v-model="userInfo.remark" type="textarea" maxlength="200" show-word-limit
                                placeholder="请输入简介"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="submitForm()">创建</el-button>
                            <el-button @click="closeView()">关闭</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </el-dialog>
    </div>`,
    props:['parent'],
    components: {
    },
    data() {
        return {
            showView: false,
            userInfo: {
                idkey: "",
                family_idkey: "", //所属家庭主键
                name: "",//姓名
                petname: "",//小名
                enname: "",//英文名
                login_name: "",//登录名
                login_pwd: "",//登录密码
                company_num: "",//所属公司代码
                company_name: "",//公司名称
                gender: "",//性别
                birthday: "",//出生日期
                idcard: "",//身份证号
                nation: "",//民族
                native_place: "",//籍贯
                head_img: "",//头像资源idkey
                remark: "",//简介
                phone: "",//电话
                phone1: "",//电话1
                email: "",//邮箱
                email1: "",//邮箱1
                create_person: "",//创建人id
                create_time: ""//创建时间
            },
            userInfoRules: {
                name: [
                    { required: true, message: '请输入姓名', trigger: 'blur' },
                    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
                ],
                login_name: [
                    { required: true, message: '请输', trigger: 'blur' },
                ],
                gender: [
                    { required: true, message: '请输选择性别', trigger: 'blur' },
                ]
            }
        }
    },
    created() {
    },
    methods: {
        submitForm:function() {
            this.$refs.personFormRef.validate((valid) => {
                if (valid) {
                    postAPI("/api/addPerson", this.userInfo,(res) => {
                        if (res.res) {
                            this.$message.success("新增成功")
                            this.parent.onSubmitSearch()
                            this.closeView();
                        }
                    })
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });

        },
        show:function() {
            this.showView = true;
        },
        closeView:function() {
            this.showView = false;
        }
    }
};
var user_manage_main= {
    //生产管理
    template:`
            <div>
                <el-row>
                <el-col :span="24">
                <el-form :inline="true"  class="demo-form-inline" size="mini">
                  <el-form-item>
                    <el-button type="primary" @click="onSubmitSearch">查询</el-button>
                    <el-button type="primary" @click="onCreate">新增</el-button>
                  </el-form-item>
                </el-form>
                </el-col>
                </el-row>
                <el-row>
                <el-col :span="24">
                    <el-table border v-loading="loadingData" :height="tableHeight"
                        :data="tableData"
                        style="width: 100%">
                        <el-table-column show-overflow-tooltip
                          prop="name"
                          label="名称"
                          width="180">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="login_name"
                          label="登录名"
                          width="180">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="phone"
                          label="电话">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="company_name" width="200"
                          label="公司名称">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="company_num"
                          label="代码">
                        </el-table-column>
                        <el-table-column  label="操作" width="300">
                          <template slot-scope="scope">
                            <!-- <el-button @click="showDetail(scope.row)" type="primary" width="60"
                                size="mini" style="width:90px">查看详情</el-button> -->
                            <el-button @click="resetPwd(scope.row)" type="warning" width="60"
                                size="mini" style="width:90px">重置密码</el-button>
                            <el-button v-if="scope.row.login_name != '000001'" 
                                @click="deletePersonCheck(scope.row)" type="danger" width="60"
                                size="mini" style="width:90px">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-col>
                </el-row>
                <add-user ref="addUser" :parent="this"></add-user>
        </div>
        `,
    props:['parent'],
    components:{
        addUser:user_manage_add_user
    },
    data:function(){
        return {
            tableHeight:590-170,
            loadingData:false,
            tableData:[]
        }
    },
    created: function() {
    },
    mounted:function(){
       this.init()
    },
   methods:{
       init:function(){
          this.onSubmitSearch()
       },
       sizeChange:function(size){
          this.tableHeight = size.height - 100
       },
       onCreate:function(){
          this.$refs.addUser.show()
        },
       showDetail:function(row){
           this.$confirm(`${JSON.stringify(row)}`, '用户详情', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              dangerouslyUseHTMLString:true,
              type: 'warning'
            }).then(() => {
            }).catch(() => {

            });
       },
       deletePersonCheck:function(row){
           this.$confirm(`确认删除用户 :${row.name}?`, '删除提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              dangerouslyUseHTMLString:true,
              type: 'warning'
            }).then(() => {
              this.deletePerson(row);
            }).catch(() => {

            });
       },
       resetPwd:function(row){
           this.$confirm(`确认重置密码，用户 :${row.name}?`, '重置密码提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              dangerouslyUseHTMLString:true,
              type: 'warning'
            }).then(() => {
              postAPI(
               "/api/reset_user_authentication",
               {idkey:row.idkey},
               (response)=>{
                   if(response.res){
                       this.$notify({
                          title: '提醒',
                          type: 'success',
                          message: '密码重置成功'
                        });  
                     }else{
                         this.$notify({
                          title: '提醒',
                          type: 'error',
                          message: '密码重置失败'
                        });  
                     }
                   this.loadingData = false;
                  }
                );
            }).catch(() => {

            });
       },
       deletePerson:function(row){
           this.loadingData = true;
           postAPI(
               "/api/deletePerson",
               {idkey:row.idkey},
               (response)=>{
                   if(response.res){
                       this.onSubmitSearch();
                   }
                   this.loadingData = false;
                }
            )
       },
       onSubmitSearch:function(){
           this.loadingData = true;
           postAPI(
               "/api/getPerson",
               {},
               (response)=>{
                   if(response.res){
                       this.tableData=response.res
                   }
                   this.loadingData = false;
                }
            )
       }

   }
};