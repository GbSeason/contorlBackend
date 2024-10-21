var pms_base_manage_add_edit_material={
    //新增/修改材料元数据
    template: `<div>
                <el-dialog :title="rowData?'编辑材料':'添加材料'" width="500px"
                :close-on-press-escape="false"
                :close-on-click-modal="false"
                :visible.sync="showDialog" :destroy-on-close="true" :modal="false">
                    <el-form ref="form" :model="form" label-width="80px" :inline="true" size="mini">
                        <el-form-item label="名称">
                            <el-input class="margin-left-10" v-model="form.materia_name" placeholder="请输入名称"
                            size="mini" style="width:200px"></el-input>
                        </el-form-item>
                        <el-form-item label="图号">
                            <el-input class="margin-left-10" v-model="form.image_no" placeholder="请输入图号"
                            size="mini" style="width:200px"></el-input>
                        </el-form-item>
                        <el-form-item label="单位">
                            <el-input class="margin-left-10" v-model="form.unit" placeholder="请输入单位"
                            size="mini" style="width:200px"></el-input>
                        </el-form-item>
                        <el-form-item label="单重">
                            <el-input class="margin-left-10" v-model="form.weight" placeholder="请输入单重"
                            size="mini" style="width:200px"></el-input>(Kg)
                        </el-form-item>
                        <el-form-item label="单价">
                            <el-input class="margin-left-10" v-model="form.price" placeholder="请输入单价"
                            size="mini" style="width:200px"></el-input>
                        </el-form-item>
                        <el-form-item label="工序">
                            <div style="color:#269aff;display: flex;width: 360px;height: 80px;flex-wrap: wrap;
                                    justify-content:space-around;">
                                <div>车&nbsp;&nbsp;&nbsp;&nbsp;钻:<el-input v-model="form.processes_cz" placeholder="车钻" 
                                    size="mini" style="width:60px"></el-input></div>
                                <div>铣&nbsp;&nbsp;&nbsp;&nbsp;齿:<el-input v-model="form.processes_xc" placeholder="铣齿" 
                                    size="mini" style="width:60px"></el-input></div>
                                <div>插&nbsp;&nbsp;&nbsp;&nbsp;齿:<el-input v-model="form.processes_cc" placeholder="插齿" 
                                    size="mini" style="width:60px"></el-input></div>
                                <div>热处理:<el-input v-model="form.processes_rcl" placeholder="热处理" size="mini" 
                                    style="width:60px"></el-input></div>
                                <div>磨&nbsp;&nbsp;&nbsp;&nbsp;齿:<el-input v-model="form.processes_mc" placeholder="磨齿" 
                                    size="mini" style="width:60px"></el-input></div>
                                <div>磨&nbsp;&nbsp;&nbsp;&nbsp;外:<el-input v-model="form.processes_mw" placeholder="磨外" 
                                    size="mini" style="width:60px"></el-input></div>
                            </div>
                        </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                        <el-button type="primary" @click="save" size="mini">保存</el-button>
                        <el-button  @click="showDialog = false" size="mini">关闭</el-button>
                    </span>
                </el-dialog>
            </div>`,
    props: ['parent'],
    data: function() {
        return {
            showDialog: false,
            rowData:null,
            form:{
                materia_name:null,
                image_no:null,
                unit:null,
                weight:null,
                price:null,
                processes_cz:0,
                processes_xc:0,
                processes_cc:0,
                processes_rcl:0,
                processes_mc:0,
                processes_mw:0
            }
        }
    },
    created: function() {
    },
    mounted:function(){
    },
    methods: {
        save:function(){
            if(!this.form.image_no){
                this.$notify({
                  title: '提醒',
                  type: 'error',
                  message: '请填写图号'
                });
                return;
            }
            let param ={"fun_name":"add_materia_attribute", // 方法名
                    "class_name":"pms_app",// 类名
                    params:this.form // 参数-要与调用的方法匹配
                }
               postAPI(
                   "/api/app",
                   param,
                   (response)=>{
                       if(response.res =="error exist"){
                           this.$message({
                              message: '此图号已存在',
                              type: 'warning'
                            });
                       }else{
                           this.$notify({
                              title: '提醒',
                              type: 'success',
                              message: this.rowData?'编辑材料成功':'新增材料成功'
                            });
//                        console.log(response);
                           this.parent.search();
                           this.close();
                       }
                    }
                )
        },
        close:function(){
            this.showDialog = false;
        },
        resetForm:function(){
            this.form={
                materia_namenull:null,
                image_no:null,
                unit:null,
                weight:null,
                price:null,
                processes_cz:0,
                processes_xc:0,
                processes_cc:0,
                processes_rcl:0,
                processes_mc:0,
                processes_mw:0
            }
            this.rowData = null
        },
        show:function(row){
            this.resetForm();
            if(row){
                this.rowData = row
                for(key in row){
                   this.form[key] = row[key]
                 }
             }
            this.showDialog = true;
        }
    }
}

var pms_base_manage_add_edit_customer={
    //新增供应商
    template: `<div>
                <el-dialog :title="form.pk?'编辑供应商':'添加供应商'" width="400px"
                :close-on-press-escape="false"
                :close-on-click-modal="false"
                :visible.sync="showDialog" :destroy-on-close="true" :modal="false">
                    <el-form ref="form" :model="form" label-width="80px" :inline="true" size="mini">
                        <el-form-item label="名称">
                            <el-input class="margin-left-10" v-model="form.customer_name" placeholder="请输入名称"
                            size="mini" style="width:200px"></el-input>
                        </el-form-item>
                        <el-form-item label="地址">
                            <el-input class="margin-left-10" v-model="form.customer_addr" placeholder="请输入地址"
                            size="mini" style="width:200px"></el-input>
                        </el-form-item>
                        <el-form-item label="电话">
                            <el-input class="margin-left-10" v-model="form.customer_phone" placeholder="请输入电话"
                            size="mini" style="width:200px"></el-input>
                        </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                        <el-button type="primary" @click="save" size="mini">保存</el-button>
                        <el-button  @click="showDialog = false" size="mini">关闭</el-button>
                    </span>
                </el-dialog>
            </div>`,
    props: ['parent'],
    data: function() {
        return {
            showDialog: false,
            form:{
                customer_name:null,
                customer_phone:null,
                customer_addr:null,
                create_time:null
            }
        }
    },
    created: function() {
    },
    mounted:function(){
    },
    methods: {
        save:function(){
            if(!this.form.customer_name){
                this.$notify({
                  title: '提醒',
                  type: 'error',
                  message: '请填写供应商名称'
                });
                return;
            }
            this.form.create_time = + new Date();
            let param ={"fun_name":"add_customer", // 方法名
                    "class_name":"pms_app",// 类名
                    params:this.form // 参数-要与调用的方法匹配
                }
               postAPI(
                   "/api/app",
                   param,
                   (response)=>{
                       if(response.res =="error exist"){
                           this.$message({
                              message: '此供应商名称已存在',
                              type: 'warning'
                            });
                       }else{
                           this.$notify({
                              title: '提醒',
                              type: 'success',
                              message: this.form.pk?'供应商编辑成功':'供应商添加成功'
                            });
                           this.parent.search()
                           this.close();
                       }
                    }
                )
        },
        close:function(){
            this.showDialog = false;
        },
        resetForm:function(){
            this.form={
                customer_name:null,
                customer_phone:null,
                customer_addr:null,
                create_time:null
            }
        },
        show:function(row){
            this.resetForm();
            if(row){
                for(key in row){
                    this.form[key] = row[key]
                }
            }
            this.showDialog = true;
        }
    }
}

var pms_base_manage_material_table_list={
    //材料管理--数据列表
    template:`
        <div>
            <el-row>
                <el-col :span="24">
                <el-form :inline="true" :model="searchForm" class="demo-form-inline" size="mini">
                  <el-form-item label="材料名称">
                    <el-input clearable v-model="searchForm.materia_name" placeholder="请输入材料名称"
                            size="mini" style="width:240px"></el-input>
                  </el-form-item>
                  <el-form-item label="图号">
                    <el-input clearable v-model="searchForm.image_no" placeholder="请输入图号"
                            size="mini" style="width:240px"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="search">查询</el-button>
                  </el-form-item>
                  <el-form-item style="float: right;">
                    <el-button type="success" @click="addMaterial">添加材料</el-button>
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
                          prop="materia_name"
                          label="材料名称"
                          width="180">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="image_no"
                          label="图号"
                          width="180">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="weight"
                          label="单重(Kg)">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="unit"
                          label="单位">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="unit"
                          label="工序" width="300">
                            <template slot-scope="scope">
                                车钻:{{scope.row.processes_cz}}&nbsp;&nbsp;&nbsp;&nbsp;
                                铣齿:{{scope.row.processes_xc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                插齿:{{scope.row.processes_cc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                <br>
                                热处理:{{scope.row.processes_rcl}}&nbsp;&nbsp;&nbsp;&nbsp;
                                磨齿:{{scope.row.processes_mc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                磨外:{{scope.row.processes_mw}}
                            </template>
                        </el-table-column>
                        <el-table-column  label="操作" width="200">
                          <template slot-scope="scope">
                            <el-button @click="editRow(scope.row)" type="primary" size="mini" style="width:90px">编辑</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-col>
                </el-row>
                <edit-view ref="editView" :parent="this"></edit-view>
        </div>
        `,
    props:['parent'],
    components:{
        editView:pms_base_manage_add_edit_material
    },
    data:function(){
        return {
            loadingData:false,
            tableHeight: 336,
            rowData:null,
            tableData:[],
            searchForm:{
                materia_name:"",
                image_no:""
                }
            }
    },
    created: function() {
    },
    mounted:function(){
        this.show();
    },
   methods:{
       editRow:function(row){
           this.$refs.editView.show(row)
       },
       addMaterial:function(){
           this.$refs.editView.show(null)
       },
       sizeChange:function(size){
           this.tableHeight = size.height - 250;
       },
       search:function(){
           this.loadingData = true;
           let param ={"fun_name":"search_materia_attribute_list_for_manage", // 方法名
                "class_name":"pms_app",// 类名
                params:this.searchForm // 参数-要与调用的方法匹配
            }
           postAPI(
               "/api/app",
               param,
               (response)=>{
                   if(response.res){
                       this.tableData = response.res;
                   }
                   this.loadingData = false;
                }
            )
       },
        close:function(){
            this.showDialog = false;
        },
        show:function(){
            this.search();
        }
   }
};

var pms_base_manage_customer_table_list={
    //供应商管理列表
    template:`
        <div>
            <el-row>
                <el-col :span="24">
                <el-form :inline="true" :model="searchForm" class="demo-form-inline" size="mini">
                  <el-form-item label="供应商名称">
                    <el-input v-model="searchForm.customer_name" placeholder="请输入供应商名称"
                            size="mini" style="width:240px"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="search">查询</el-button>
                  </el-form-item>
                  <el-form-item style="float: right;">
                    <el-button type="success" @click="addCustomer">添加供应商</el-button>
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
                          prop="customer_name"
                          label="供应商名称"
                          width="180">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="customer_addr"
                          label="地址"
                          width="180">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="customer_phone"
                          label="电话">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="create_time"
                          label="创建时间">
                            <template slot-scope="scope">
                                {{convertMillisecondsToDateTime(scope.row.create_time)}}
                            </template>
                        </el-table-column>
                        <el-table-column  label="操作" width="200">
                          <template slot-scope="scope">
                            <el-button @click="showEdit(scope.row)" type="primary" size="mini" style="width:90px">编辑</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-col>
                </el-row>
            <edit-view ref="editView" :parent="this"></edit-view>
        </div>
        `,
    props:['parent'],
    components:{
        editView:pms_base_manage_add_edit_customer
    },
    data:function(){
        return {
            loadingData:false,
            rowData:null,
            tableData:[],
            tableHeight:336,
            searchForm:{
                materia_pk:"",
                customer_pk:"",
                create_user:""
                }
            }
    },
    created: function() {
    },
    mounted:function(){
        this.show();
    },
   methods:{
       showEdit:function(row){
           this.$refs.editView.show(row)
       },
       sizeChange:function(size){
           this.tableHeight = size.height - 250;
       },
       search:function(){
           this.loadingData = true;
           let param ={"fun_name":"search_customer_list", // 方法名
                "class_name":"pms_app",// 类名
                params:this.searchForm // 参数-要与调用的方法匹配
            }
           postAPI(
               "/api/app",
               param,
               (response)=>{
                   if(response.res){
                       this.tableData = response.res
                   }
                   this.loadingData = false;
                }
            )
       },
       addCustomer:function(){
           this.$refs.editView.show(null)
       },
        show:function(row){
            this.search();
        }
   }
};

var pms_app_base_manage_main_view= {
    //基础数据管理
    template:`
            <div style="height:100%;width:100%">
                <el-row style="height:100%;width:100%">
                <el-col :span="24" style="height:100%;width:100%">
                    <el-tabs type="border-card" v-model="activeName" @tab-click="ontabchange" style="height:100%;width:100%">
                        <el-tab-pane label="材料数据管理" name="material">
                            <material-view ref="materialView" :parent="this"></material-view>
                        </el-tab-pane>
                        <el-tab-pane label="供应商管理" name="customer">
                            <customer-view ref="customerView" :parent="this"></customer-view>
                        </el-tab-pane>
                     </el-tabs>
                </el-col>
                </el-row>
                
                
        </div>
        `,
    props:['parent'],
    components:{
        materialView:pms_base_manage_material_table_list,
        customerView:pms_base_manage_customer_table_list
    },
    data:function(){
        return {
            activeName:"material",
            tableHeight:590-170,
            loadingData:false,
            tableData:[],
            materialList:[],
            customerList:[],
            seachForm:{
                material_pk:"",
                customer_pk:""

            }
        }
    },
    created: function() {
    },
    mounted:function(){
       
    },
   methods:{
       init:function(){
//         this.onSubmitSearch()
           
       },
       ontabchange:function(){
           
       },
       sizeChange:function(size){
           this.$refs.materialView.sizeChange(size)
           this.$refs.customerView.sizeChange(size)
       },
       

   }
};