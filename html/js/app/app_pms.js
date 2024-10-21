var checkPrintIntervalId = null;
var printList_pms = "printList_pms";
var materialDetailEditView={
    //产品出库信息编辑
    template: `<div>
                <el-dialog title="材料入库编辑" width="500px"
                :close-on-press-escape="false"
                :close-on-click-modal="false"
                :visible.sync="showDialog" :destroy-on-close="true" :modal="false">
                    <el-form ref="form" :model="form" label-width="80px" :inline="true" size="mini">
                        <el-form-item label="供应商">
                            <el-select  class="margin-left-10"
                            placeholder="请选择供应商" disabled
                            clearable filterable size="mini"
                            v-model="form.customer_pk" style="width:240px">
                                <el-option
                                    v-for="prd in customerList"
                                    :key="prd.pk"
                                    :label="prd.customer_name"
                                    :value="prd.pk">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="材料">
                            <el-select  class="margin-left-10"
                            disabled
                            placeholder="请选择材料"
                            clearable filterable size="mini"
                            v-model="form.materia_pk" style="width:240px">
                                <el-option
                                    v-for="prd in materialList"
                                    :key="prd.pk"
                                    :label="prd.materia_name+' ['+prd.image_no+']'"
                                    :value="prd.pk">
                                </el-option>
                            </el-select>
                            <label>产线累计库存：{{currentStorage}}</label>
                        </el-form-item>
                        <el-form-item label="-提示-"  style="color:#f3a01b;">
                            <label>最少入库量: {{(currentStorage) || 0}}</label>
                        </el-form-item>
                        <el-form-item label="数量">
                            <el-input-number class="margin-left-10" :min="currentStorage" 
                              v-model="form.count" placeholder="请输入数量"
                            size="mini" style="width:240px"></el-input-number>
                        </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                        <el-button type="primary" @click="save" size="mini" :loading="saving">保存</el-button>
                        <el-button  @click="showDialog = false" size="mini">关闭</el-button>
                    </span>
                </el-dialog>
            </div>`,
    props: ['parent'],
    data: function() {
        return {
            saving:false,
            title: "",
            currentStorage:0,
            customerList:[],
            productList:[],
            materialList:[],
            imgList:[],
            showDialog: false,
            form:{
                pk:null,
                customer_pk:null,
                materia_pk:null,
                count:null,
                create_time:null,
                create_user:null,
                processes_cz:0,
                processes_xc:0,
                processes_cc:0,
                processes_rcl:0,
                processes_mc:0,
                processes_mw:0
            },
            rowData: null,
            rowSource:null,
            stock_current:null,
            loading_stock:false,
            customers: [] //以企业为单位
        }
    },
    created: function() {

    },
    mounted:function(){


    },
    methods: {
        getMaterialList:function(){
            getMaterialList(1,(data)=>{
                       this.materialList = data
                        if(this.rowData){
                           this.form.material_pk = this.rowData.materia_pk;
                           this.getCurrentMaterialStorage(this.rowData.materia_pk)
                        }
                    }
                )
        },
        getCustomerList:function(){
            getCustomerList(
                   (data)=>{
                       this.customerList = data
                    }
                )
        },
        getCurrentMaterialStorage(mpk){
           this.currentStorage = 0;
        //查询当前材料的现有库存
           if(!mpk){
               return;
           }
           let param ={"fun_name":"search_produce_manage", // 方法名
                "class_name":"pms_app",// 类名
                params:{
                    material_pk:mpk,
                    customer_pk:""
                    } // 参数-要与调用的方法匹配
            }
           postAPI(
               "/api/app",
               param,
               (response)=>{
                   if(response.res){
                       let dataList1 = response.res[0]
                       console.log(dataList1)
                       if(dataList1 && dataList1.length > 0){
                           this.currentStorage = dataList1[0].count;
                       }
                       
//                        let dataList2 = response.res[1]
//                        dataList1.forEach(item=>{
//                            if(item.materia_pk == mpk){
//                               let outData = dataList2.find((d2d)=>{
//                                    return d2d.materia_pk == item.materia_pk
//                                })
//                               let out = 0;
//                               if(outData && outData.count > 0){
//                                   out = outData.count
//                                }
//                                this.currentStorage = item.count - out;
//                            }
//                        })
                   }
                }
            )
        },
        save:function(){
            if(!this.form.materia_pk){
                this.$notify({
                  title: '提醒',
                  type: 'error',
                  message: '请选择材料'
                });
                return;
            }
            if(this.form.count > this.rowSource.count + this.currentStorage){
                this.$notify({
                  title: '提醒',
                  type: 'error',
                  message: '产品库存不足，请补充产品库存'
                });
                return;
            }
            this.saving = true;
            let param ={"fun_name":"edit_material_in_namange", // 方法名 
                    "class_name":"pms_app",// 类名
                    params:this.form // 参数-要与调用的方法匹配
                }
               postAPI(
                   "/api/app",
                   param,
                   (response)=>{
                       this.saving = false;
                       if(response.res){
                           this.$notify({
                              title: '提醒',
                              type: 'success',
                              message: '修改成功'
                            });
                           this.parent.search()
                           this.parent.parent.onSubmitSearch()
                           this.close()
                       }
                    }
                )
        },
        close:function(){
            this.showDialog = false;
        },
        resetData(){
            this.form.customer_pk=null;
            this.form.materia_pk=null;
            this.form.count=null;
            this.form.create_time=null;
            this.form.create_user=null;
            this.form.processes_cz=0;
            this.form.processes_xc=0;
            this.form.processes_cc=0;
            this.form.processes_rcl=0;
            this.form.processes_mc=0;
            this.form.processes_mw=0;
            this.currentStorage = 0;
       },
        show:function(row){
            this.resetData();
            this.rowSource = row;
            let rowClone = cloneData(row)
            this.form = rowClone;
            this.showDialog = true;
            this.getMaterialList()
            this.getCustomerList()
            this.getCurrentMaterialStorage(rowClone.materia_pk);
        }
    }
}
var materialInDetailView = {
    //原材料入库明细表
    template:`
        <div>
            <el-dialog title="材料入库明细" width="800px"
                    :close-on-press-escape="false"
                    :close-on-click-modal="false"
                    :visible.sync="showDialog" :destroy-on-close="false" :modal="false">
                    <div>
                    <el-row>
                        <el-col :span="24" style="color:#0c83ff;">
                            材料名称: [{{rowData?rowData.materia_name:""}}]
                            &nbsp;&nbsp;&nbsp;&nbsp; 
                            图号: [{{rowData?rowData.image_no:""}}]
                            &nbsp;&nbsp;&nbsp;&nbsp; 
                            累计库存: <label style="color: #000;
                                    background-color: #fff9b0;
                                    padding: 3px;
                                    border: 1px solid #c3a0a0;
                                    border-radius: 3px;
                                    font-size: 18px;">{{rowData?rowData.count:""}}</label>
                            &nbsp;&nbsp;&nbsp;&nbsp; 
                            现库存: <label style="color: #000;
                                    background-color: #b3f3a8;
                                    padding: 3px;
                                    border: 1px solid #c3a0a0;
                                    border-radius: 3px;
                                    font-size: 18px;">{{rowData?rowData.count_storage:""}}</label>
                        </el-col :span="24">
                    </el-row>
                    <el-row style="margin-top:10px">
                        <el-col :span="24">
                            <el-tabs type="border-card" v-model="activeName" style="height:100%;width:100%">
                                <el-tab-pane label="入库记录" name="in">
                                    <el-table border v-loading="loadingData" :height="350"
                                    :data="tableDataIn"
                                    style="width: 100%">
                                    <el-table-column show-overflow-tooltip
                                      prop="customer_name"
                                      label="供应商"
                                      width="200">
                                        <template slot-scope="scope">
                                            {{scope.row.customer_name?scope.row.customer_name:"-"}}
                                        </template>
                                    </el-table-column>
                                    <el-table-column show-overflow-tooltip
                                      prop="create_time"
                                      label="入库时间"
                                      width="200">
                                        <template slot-scope="scope">
                                            {{convertMillisecondsToDateTime(scope.row.create_time)}}
                                        </template>
                                    </el-table-column>
                                    <el-table-column show-overflow-tooltip
                                      prop="create_user"
                                      label="入库人"
                                      width="100">
                                    </el-table-column>
                                    <el-table-column show-overflow-tooltip
                                      prop="count"
                                      label="入库数量">
                                    </el-table-column>
                                    <el-table-column show-overflow-tooltip
                                      prop="count"
                                      label="操作">
                                        <template slot-scope="scope">
                                            <el-button style="width:70px" @click="editRow(scope.row)" 
                                            type="primary" size="mini">编辑</el-button>
                                        </template>
                                    </el-table-column>
                                  </el-table>
                                </el-tab-pane>
                                <el-tab-pane label="出库记录" name="out">
                                    <el-table border v-loading="loadingData" :height="350"
                                    :data="tableDataOut"
                                    style="width: 100%">
                                    <el-table-column show-overflow-tooltip
                                      prop="customer_name"
                                      label="供应商"
                                      width="200">
                                        <template slot-scope="scope">
                                            {{scope.row.customer_name?scope.row.customer_name:"-"}}
                                        </template>
                                    </el-table-column>
                                    <el-table-column show-overflow-tooltip
                                      prop="create_time"
                                      label="出库时间"
                                      width="200">
                                        <template slot-scope="scope">
                                            {{convertMillisecondsToDateTime(scope.row.create_time)}}
                                        </template>
                                    </el-table-column>
                                    <el-table-column show-overflow-tooltip
                                      prop="create_user"
                                      label="出库人"
                                      width="200">
                                    </el-table-column>
                                    <el-table-column show-overflow-tooltip
                                      prop="count"
                                      label="出库数量">
                                    </el-table-column>
                                  </el-table>
                                </el-tab-pane>
                              </el-tabs>
                        </el-col>
                    </el-row>
                </div>
            </el-dialog>
            <edit-view ref="editView" :parent="this"></edit-view>
        </div>
        `,
    props:['parent'],
    components:{
        editView: materialDetailEditView
    },
    data:function(){
        return {
            activeName:"in",
            showDialog: false,
            loadingData:false,
            rowData:null,
            tableDataIn:[],
            tableDataOut:[],
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
    },
   methods:{
       search:function(){
           this.loadingData = true;
           let param ={"fun_name":"search_materia_manage_detail", // 方法名
                "class_name":"pms_app",// 类名
                params:this.searchForm // 参数-要与调用的方法匹配
            }
           postAPI(
               "/api/app",
               param,
               (response)=>{
                   if(response.res){
                       this.tableDataIn = response.res[0];
                       this.tableDataOut = response.res[1];
                   }
                   this.loadingData = false;
                }
            )
       },
       editRow:function(row){
           this.$refs.editView.show(row)
       },
        close:function(){
            this.showDialog = false;
        },
        show:function(row){
            this.rowData = row;
            this.searchForm.materia_pk = row.materia_pk;
            this.showDialog = true;
            this.search();
        }
   }
};
var addCustomerView = {
    //新增供应商
    template: `<div>
                <el-dialog title="添加供应商" width="400px"
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
                              message: '供应商添加成功'
                            });
                           this.close();
                       }
                    }
                )
        },
        close:function(){
            this.showDialog = false;
        },
        show:function(){
            this.showDialog = true;
        }
    }
};

var addMaterialAttrView = {
    //新增材料元数据
    template: `<div>
                <el-dialog title="添加材料" width="400px"
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
                materia_name:null,
                image_no:null,
                unit:null,
                weight:null,
                price:null
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
                              message: '新增材料成功'
                            });
//                        console.log(response);
//                        this.parent.onSubmitSearch();
                           this.close();
                       }
                    }
                )
        },
        close:function(){
            this.showDialog = false;
        },
        show:function(){
            this.showDialog = true;
        }
    }
};
var addMaterialManageView = {
    //新增材料入库信息
    template: `<div>
                <el-dialog title="材料入库" width="500px"
                :close-on-press-escape="false"
                :close-on-click-modal="false"
                :visible.sync="showDialog" :destroy-on-close="true" :modal="false">
                    <el-form ref="form" :model="form" label-width="80px" :inline="true" size="mini">
                        <el-form-item label="供应商">
                            <el-select  class="margin-left-10"
                            placeholder="请选择供应商"
                            clearable filterable size="mini"
                            v-model="form.customer_pk" style="width:240px">
                                <el-option
                                    v-for="prd in customerList"
                                    :key="prd.pk"
                                    :label="prd.customer_name"
                                    :value="prd.pk">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="材料">
                            <el-select  class="margin-left-10"
                            placeholder="请选择材料"
                            clearable filterable size="mini"
                            v-model="form.material_pk" style="width:240px">
                                <el-option
                                    v-for="prd in materialList"
                                    :key="prd.pk"
                                    :label="prd.materia_name+' ['+prd.image_no+']'"
                                    :value="prd.pk">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="数量">
                            <el-input-number class="margin-left-10" :min="1" v-model="form.count" placeholder="请输入数量"
                            size="mini" style="width:240px"></el-input-number>
                        </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                        <el-button type="primary" @click="save" size="mini" :loading="saving">保存</el-button>
                        <el-button  @click="showDialog = false" size="mini">关闭</el-button>
                    </span>
                </el-dialog>
            </div>`,
    props: ['parent'],
    data: function() {
        return {
            saving:false,
            title: "",
            customerList:[],
            productList:[],
            materialList:[],
            imgList:[],
            showDialog: false,
            form:{
                customer_pk:null,
                material_pk:null,
                count:null,
                create_time:null,
                create_user:null
            },
            rowDatas: [],
            stock_current:null,
            loading_stock:false,
            customers: [] //以企业为单位
        }
    },
    created: function() {

    },
    mounted:function(){


    },
    methods: {
        getMaterialList:function(){
            getMaterialList(1,(data)=>{
                       this.materialList = data
                    }
                )
        },
        getCustomerList:function(){
            getCustomerList(
                   (data)=>{
                       this.customerList = data
                    }
                )
        },
        save:function(){
            if(!this.form.material_pk || !this.form.count){
                this.$notify({
                  title: '提醒',
                  type: 'error',
                  message: '须填写材料和入库数量'
                });
                return;
            }
            this.form.create_time= +new Date();
            this.form.create_user=globe_deviceInfo.login_name;
            this.saving = true;
            let param ={"fun_name":"add_materia_namange", // 方法名
                    "class_name":"pms_app",// 类名
                    params:this.form // 参数-要与调用的方法匹配
                }
               postAPI(
                   "/api/app",
                   param,
                   (response)=>{
                       this.saving = false;
                       if(response.res){
                           this.$notify({
                              title: '提醒',
                              type: 'success',
                              message: '材料入库成功'
                            });
                           this.parent.onSubmitSearch()
                           this.close()
                       }
                    }
                )
        },
        close:function(){
            this.showDialog = false;
        },
        show:function(){
            this.showDialog = true;
            this.getMaterialList()
            this.getCustomerList()
        }
    }
};

var app_pms_material={
    //原材料管理
    template:`
            <div>
                <el-row>
                <el-col :span="24">
                <el-form :inline="true" :model="seachForm" class="demo-form-inline" size="mini">
                  <el-form-item label="图号">
                    <el-select v-model="seachForm.material_pk" @visible-change="showImageSelect" placeholder="图号" clearable filterable>
                      <el-option v-for="item in materialList" :key="item.pk" :label="item.image_no" :value="item.pk"></el-option>
                    </el-select>
                  </el-form-item>
                  <!-- <el-form-item label="供应商">
                    <el-select v-model="seachForm.customer_pk" placeholder="供应商" clearable filterable>
                      <el-option v-for="item in customerList" :key="item.pk" :label="item.customer_name" :value="item.pk"></el-option>
                    </el-select>
                  </el-form-item> -->
                  <el-form-item>
                    <el-button type="primary" @click="onSubmitSearch">查询</el-button>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="onCreate">入库</el-button>
                  </el-form-item>
                   <!-- <el-form-item style="float: right;">
                    <el-button type="success" @click="onMateriaManage">添加材料</el-button>
                  </el-form-item>
                    <el-form-item style="float: right;">
                    <el-button type="success" @click="onCustomerManage">添加供应商</el-button>
                  </el-form-item> -->
                  <el-form-item >
                    <label style="color:#f3a01b;margin-left:100px;">
                        材料入库记录可编辑
                    </label>
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
                          prop="count"
                          label="累计库存">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="count_storage"
                          label="现库存">
                        </el-table-column>
                        <!-- <el-table-column show-overflow-tooltip
                          prop="total"
                          label="总价">
                        </el-table-column> -->
                        <el-table-column  label="操作" width="200">
                          <template slot-scope="scope">
                            <el-button @click="showDetail(scope.row)" type="primary" size="mini" style="width:90px">查看详情</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-col>
                </el-row>
                <add-material-manage-view ref="addMaterialView" :parent="this"></add-material-manage-view>
                <add-material-attr-view ref="addMaterialAttrView" :parent="this"></add-material-attr-view>
                <add-customer-view ref="addCustomerView" :parent="this"></add-customer-view>
                <material-detail-view ref="materialDetailView" :parent="this"></material-detail-view>
        </div>
        `,
    props:['parent'],
    components:{
        "addMaterialManageView": addMaterialManageView,
        "addMaterialAttrView": addMaterialAttrView,
        "addCustomerView": addCustomerView,
        "materialDetailView" : materialInDetailView,
    },
    data:function(){
        return {
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
        this.onSubmitSearch()
       },
       showImageSelect:function(show){
           if(show && this.materialList.length == 0){
            this.getMaterialList() 
           }
       },
       sizeChange:function(size){
                  this.tableHeight = size.height - 170
               },
       getMaterialList:function(){
            getMaterialList(1,(data)=>{
                       this.materialList = data
                    }
                )
        },
        getCustomerList:function(){
            getCustomerList(
                   (data)=>{
                       this.customerList = data
                    }
                )
        },
       onSubmitSearch:function(){
           this.loadingData = true;
//            search_materia_manage
           let param ={"fun_name":"search_materia_manage", // 方法名
                "class_name":"pms_app",// 类名
                params:this.seachForm // 参数-要与调用的方法匹配
            }
           postAPI(
               "/api/app",
               param,
               (response)=>{
                   if(response.res){
                       let dataList1 = response.res[0]
                       let dataList2 = response.res[1]
                       dataList1.forEach(item=>{
                          let outData = dataList2.find((d2d)=>{
                               return d2d.materia_pk == item.materia_pk
                           })
                          let out = 0;
                          if(outData && outData.count > 0){
                              out = outData.count
                           }
                           item["count_storage"] = item.count - out;
                       })
                       this.tableData=dataList1
                   }
                   this.loadingData = false;
                }
            )
       },
       showDetail:function(row){
            this.$refs.materialDetailView.show(row)
       },
       onCreate:function(){
           this.$refs.addMaterialView.show()
           //pk,customer_pk,materia_pk,count,create_time,create_user,type_io,type_produce
           //add_materia_namange
       },
       onMateriaManage:function(){
          this.$refs.addMaterialAttrView.show()
       },
       onCustomerManage:function(){
           this.$refs.addCustomerView.show()
       },

   }
};
//主页
var app_pms={
    template:`
        <div style="height:100%;width:100%">
            <div style="position: absolute;top:10px;right: 20px;z-index: 10;
                    background-color:#d2d2d2;padding: 3px 10px;border-radius:3px;
                    display: flex;align-items: center;font-size: 14px;">
                <div style="width:120px;" class="ellipsis">待打印：{{printList.length}}</div>
                <el-button :disabled="printList.length == 0" icon="el-icon-printer" round @click="showPrint" type="primary" size="mini" style="width:80px;height: 30px;">打印</el-button>
                <el-button :disabled="printList.length == 0" icon="el-icon-delete" round @click="clearPrint" type="danger" size="mini" style="width:80px;height: 30px;">清除</el-button>
            </div>
            <el-row style="height:100%;width:100%">
                <el-col :span="24" class="center-v" style="height:100%;width:100%">
                   <el-tabs type="border-card" v-model="activeName" @tab-click="ontabchange" style="height:100%;width:100%">
                    <el-tab-pane label="总览" name="dashboard">
                        <pms-dashboard ref="pmsDashboard" :parent="this"></pms-dashboard>
                    </el-tab-pane>
                    <el-tab-pane label="材料管理" name="material">
                        <app-material ref="appMaterial" :parent="this"></app-material>
                    </el-tab-pane>
                    <el-tab-pane label="生产管理" name="produce">
                        <app-produce ref="appProduce" :parent="this"></app-produce>
                    </el-tab-pane>
                    <el-tab-pane label="成品管理" name="product">
                        <app-product ref="appProduct" :parent="this"></app-product>
                    </el-tab-pane>
                    <el-tab-pane v-if="parent.permission_check('costing')" label="成本核算" name="costing">
                        <product-costing ref="productCosting" :parent="this"></product-costing>
                    </el-tab-pane>
                    <el-tab-pane v-if="parent.permission_check('baseManage')" label="基础数据管理" name="baseManage">
                        <base-manage ref="baseManage" :parent="this"></base-manage>
                    </el-tab-pane>
                    
                  </el-tabs>
                </el-col>
            </el-row>
            <app-print ref="appPrint" :parent="this"></app-print>
        </div>
    `,
    components:{
    appMaterial:app_pms_material,
    appProduce:pms_produce_view,
    appProduct:pms_product_view,
    appPrint:pms_app_print,
    pmsDashboard:pms_dashboard,
    productCosting:pms_product_costing_view,
    baseManage:pms_app_base_manage_main_view
    },
    props:['parent'],
    data:function(){
        return {
            responseStr:null,
            activeName:"dashboard",
            printList:[]
        }
    },
    created: function() {
        this.checkPrint();
    },
    mounted:function(){
        
    },
    methods:{
           onClose:function(){
            if(checkPrintIntervalId){
                clearInterval(checkPrintIntervalId)
               }
            },
           clearPrint:function(){
               this.$confirm('此操作将清除待打印的列表, 是否继续?<br>清除后可在产品管理-查看详情-出库记录中再次添加', '清除提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  dangerouslyUseHTMLString:true,
                  type: 'warning'
                }).then(() => {
                  localStorage.setItem(printList_pms,null)
                }).catch(() => {
                           
                });
            },
           checkPrint:function(){
               if(checkPrintIntervalId){
                   clearInterval(checkPrintIntervalId)
               }
               checkPrintIntervalId = setInterval(()=>{
                let printListStr = localStorage.getItem(printList_pms)
                if(printListStr && printListStr.length > 20){
                    this.printList = JSON.parse(printListStr)
                 }else{
                     this.printList = []
                 }
               },1000)   
            },
            showPrint:function(){
                this.$refs.appPrint.show(this.printList)
//                printList 
            },
            sizeChange:function(size){
                this.$refs["appMaterial"].sizeChange(size)
                this.$refs["appProduce"].sizeChange(size)
                this.$refs["appProduct"].sizeChange(size)
                this.$refs["pmsDashboard"].sizeChange(size)
                this.$refs["productCosting"].sizeChange(size)
                this.$refs["baseManage"].sizeChange(size)
               },
            ontabchange:function(){
                if(this.activeName=="material"){
                    this.$refs.appMaterial.init();
                }
                if(this.activeName=="produce"){
                    this.$refs.appProduce.init();
                }
                if(this.activeName=="product"){
                    this.$refs.appProduct.init();
                }
                if(this.activeName=="dashboard"){
                    this.$refs.pmsDashboard.init();
                }
                if(this.activeName=="costing"){
                    this.$refs.productCosting.init();
                }
                
                
             },
            showTab:function(tabName){
                this.activeName = tabName
                this.ontabchange()
            },
            getData:function(){
                let param ={"fun_name":"get_something", // 方法名
                    "class_name":"pms_app",// 类名
                    params:"test api" // 参数-要与调用的方法匹配
                }
                postAPI(
                "/api/app",
                param,
                (response)=>{
                console.log(response)
                    this.responseStr = response.res
                })
            }
        }
    };