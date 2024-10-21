var productDetailEditView={
    //产品出库信息编辑
    template: `<div>
                <el-dialog title="产品出库编辑" width="500px"
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
                            <label>现有库存：{{currentStorage}}</label>
                        </el-form-item>
                        <el-form-item label="-提示-"  style="color:#f3a01b;">
                            <label>最多出库量: {{(rowSource && (rowSource.count + currentStorage)) || 0}}</label>
                        </el-form-item>
                        <el-form-item label="数量">
                            <el-input-number class="margin-left-10" :min="1" 
                                :max="rowSource?(rowSource.count + currentStorage):currentStorage"
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
           let param ={"fun_name":"search_product_manage", // 方法名
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
                       let dataList2 = response.res[1]
                       dataList1.forEach(item=>{
                           if(item.materia_pk == mpk){
                              let outData = dataList2.find((d2d)=>{
                                   return d2d.materia_pk == item.materia_pk
                               })
                              let out = 0;
                              if(outData && outData.count > 0){
                                  out = outData.count
                               }
                               this.currentStorage = item.count - out;
                           }
                       })
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
            let param ={"fun_name":"edit_product_out_namange", // 方法名
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

var productOutView={
//新增产品库出库信息
    template: `<div>
                <el-dialog title="产品出库" width="500px"
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
                            @change="getCurrentMaterialStorage"
                            clearable filterable size="mini"
                            v-model="form.material_pk" style="width:240px">
                                <el-option
                                    v-for="prd in materialList"
                                    :key="prd.pk"
                                    :label="prd.materia_name+' ['+prd.image_no+']'"
                                    :value="prd.pk">
                                </el-option>
                            </el-select>
                            <label>现有库存：{{currentStorage}}</label>
                        </el-form-item>
                        <el-form-item label="数量">
                            <el-input-number class="margin-left-10" :min="1" :max="currentStorage"
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
                customer_pk:null,
                material_pk:null,
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
           let param ={"fun_name":"search_product_manage", // 方法名
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
                       let dataList2 = response.res[1]
                       dataList1.forEach(item=>{
                           if(item.materia_pk == mpk){
                              let outData = dataList2.find((d2d)=>{
                                   return d2d.materia_pk == item.materia_pk
                               })
                              let out = 0;
                              if(outData && outData.count > 0){
                                  out = outData.count
                               }
                               this.currentStorage = item.count - out;
                           }
                       })
                   }
                }
            )
        },
        save:function(){
            if(!this.form.material_pk){
                this.$notify({
                  title: '提醒',
                  type: 'error',
                  message: '请选择材料'
                });
                return;
            }
            if(this.form.count > this.currentStorage){
                this.$notify({
                  title: '提醒',
                  type: 'error',
                  message: '产品库存不足，请补充产品库存'
                });
                return;
            }
            this.form.create_time= +new Date();
            this.form.create_user=globe_deviceInfo.login_name;
            this.saving = true;
            let param ={"fun_name":"add_product_out_namange", // 方法名
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
                              message: '产品出库成功'
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
        resetData(){
            this.currentStorage = 0;
            this.form.customer_pk=null;
            this.form.material_pk=null;
            this.form.count=null;
            this.form.create_time=null;
            this.form.create_user=null;
            this.form.processes_cz=0;
            this.form.processes_xc=0;
            this.form.processes_cc=0;
            this.form.processes_rcl=0;
            this.form.processes_mc=0;
            this.form.processes_mw=0;
       },
        show:function(row){
            this.resetData();
            this.rowData = row;
            this.showDialog = true;
            this.getMaterialList()
            this.getCustomerList()
        }
    }
}

var productDetailView={
    //产品库明细表
    template:`
        <div>
            <el-dialog title="产品库明细" width="1200px"
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
                            <label style="color:#f3a01b;margin-left:100px;">
                                出库记录可编辑
                            </label>
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
                                      width="180">
                                        <template slot-scope="scope">
                                            {{scope.row.customer_name?scope.row.customer_name:"-"}}
                                        </template>
                                    </el-table-column>
                                    <el-table-column show-overflow-tooltip
                                      prop="create_time"
                                      label="入库时间"
                                      width="170">
                                        <template slot-scope="scope">
                                            {{convertMillisecondsToDateTime(scope.row.create_time)}}
                                        </template>
                                    </el-table-column>
                                    <el-table-column show-overflow-tooltip
                                      prop="create_user"
                                      label="入库人"
                                      width="120">
                                    </el-table-column>
                                    <!--<el-table-column show-overflow-tooltip
                                      label="工序"
                                      width="230">
                                        <template slot-scope="scope">
                                            车钻:{{scope.row.processes_cz}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            铣齿:{{scope.row.processes_xc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            插齿:{{scope.row.processes_cc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            <br>
                                            热处理:{{scope.row.processes_rcl}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            磨齿:{{scope.row.processes_mc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            磨外:{{scope.row.processes_mw}}
                                        </template>
                                    </el-table-column>-->
                                    <el-table-column show-overflow-tooltip
                                      prop="count"
                                      label="入库数量">
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
                                      width="180">
                                        <template slot-scope="scope">
                                            {{scope.row.customer_name?scope.row.customer_name:"-"}}
                                        </template>
                                    </el-table-column>
                                    <el-table-column show-overflow-tooltip
                                      prop="create_time"
                                      label="出库时间"
                                      width="170">
                                        <template slot-scope="scope">
                                            {{convertMillisecondsToDateTime(scope.row.create_time)}}
                                        </template>
                                    </el-table-column>
                                    <el-table-column show-overflow-tooltip
                                      prop="create_user"
                                      label="出库人"
                                      width="150">
                                    </el-table-column>
                                    <!--<el-table-column show-overflow-tooltip
                                      label="工序"
                                      width="230">
                                        <template slot-scope="scope">
                                            车钻:{{scope.row.processes_cz}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            铣齿:{{scope.row.processes_xc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            插齿:{{scope.row.processes_cc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            <br>
                                            热处理:{{scope.row.processes_rcl}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            磨齿:{{scope.row.processes_mc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            磨外:{{scope.row.processes_mw}}
                                        </template>
                                    </el-table-column> -->
                                    <el-table-column show-overflow-tooltip
                                      prop="count"
                                      label="出库数量">
                                    </el-table-column>
                                    <el-table-column show-overflow-tooltip
                                      label="操作"
                                      width="260">
                                        <template slot-scope="scope">
                                            <el-button style="width:70px" @click="editRow(scope.row)" 
                                                type="primary" size="mini">编辑</el-button>
                                            <el-button icon="el-icon-printer" @click="addToPrint(scope.row)" 
                                                type="warning" size="mini">添加打印</el-button>
                                        </template>
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
        editView:productDetailEditView
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
       addToPrint:function(row){
           let printListStr = localStorage.getItem(printList_pms)
           let printList = [];
           if(printListStr && printListStr.length > 20){
               printList = JSON.parse(printListStr)
            }
           let exist = printList.find((item)=>{return item.pk == row.pk;});
           if(exist){
               this.$notify({
                  title: '提醒',
                  type: 'warning',
                  message: '已在待打印队列中'
                });
               return;
           }
           printList.push(row)
           localStorage.setItem(printList_pms,JSON.stringify(printList))
           this.$notify({
              title: '提醒',
              type: 'success',
              message: '添加成功'
            });
       },
       editRow:function(row){
           this.$refs.editView.show(row)
       },
       search:function(){
           this.loadingData = true;
           let param ={"fun_name":"search_product_manage_detail", // 方法名
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

var addProductManageView = {
    //新增成品库信息--与材料入库类似
    template: `<div>
                <el-dialog title="成品入库" width="500px"
                :close-on-press-escape="false"
                :close-on-click-modal="false"
                :visible.sync="showDialog" :destroy-on-close="true" :modal="false">
                    <el-form ref="form" :model="form" label-width="80px" :inline="true" size="mini">
                        <el-form-item label="材料">
                            <el-select  class="margin-left-10"
                            placeholder="请选择材料"
                            @change="getCurrentMaterialStorage"
                            clearable filterable size="mini"
                            v-model="form.material_pk" style="width:240px">
                                <el-option
                                    v-for="prd in materialList"
                                    :key="prd.pk"
                                    :label="prd.materia_name+' ['+prd.image_no+']'"
                                    :value="prd.pk">
                                </el-option>
                            </el-select>
                            <label>产线现有库存：{{currentStorage}}</label>
                        </el-form-item>
                        <el-form-item label="数量">
                            <el-input-number class="margin-left-10" :min="1" :max="currentStorage"
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
                customer_pk:null,
                material_pk:null,
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
                       let dataList2 = response.res[1]
                       dataList1.forEach(item=>{
                           if(item.materia_pk == mpk){
                              let outData = dataList2.find((d2d)=>{
                                   return d2d.materia_pk == item.materia_pk
                               })
                              let out = 0;
                              if(outData && outData.count > 0){
                                  out = outData.count
                               }
                               this.currentStorage = item.count - out;
                           }
                       })
                   }
                }
            )
        },
        save:function(){
            if(!this.form.material_pk){
                this.$notify({
                  title: '提醒',
                  type: 'error',
                  message: '请选择材料'
                });
                return;
            }
            if(this.form.count > this.currentStorage){
                this.$notify({
                  title: '提醒',
                  type: 'error',
                  message: '产线库存不足，请补充产线库存'
                });
                return;
            }
            this.form.create_time= +new Date();
            this.form.create_user=globe_deviceInfo.login_name;
            this.saving = true;
            let param ={"fun_name":"add_product_namange", // 方法名
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
                              message: '成品入库成功'
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
        resetData(){
            this.currentStorage = 0;
            this.form.customer_pk=null;
            this.form.material_pk=null;
            this.form.count=null;
            this.form.create_time=null;
            this.form.create_user=null;
            this.form.processes_cz=0;
            this.form.processes_xc=0;
            this.form.processes_cc=0;
            this.form.processes_rcl=0;
            this.form.processes_mc=0;
            this.form.processes_mw=0;
       },
        show:function(){
            this.resetData();
            this.showDialog = true;
            this.getMaterialList()
        }
    }
};

var pms_product_view= {
    //生产管理
    template:`
            <div>
                <el-row>
                <el-col :span="24">
                <el-form :inline="true" :model="seachForm" class="demo-form-inline" size="mini">
                  <el-form-item label="图号">
                    <el-select v-model="seachForm.material_pk" placeholder="图号" @visible-change="showImageSelect" clearable filterable>
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
                  <el-form-item>
                    <label style="color:#f3a01b;margin-left:100px;">
                        【打印】【编辑】出库记录请点击【查看详情】的出库记录
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
                        <el-table-column  label="操作" width="300">
                          <template slot-scope="scope">
                            <el-button @click="showDetail(scope.row)" type="primary" size="mini" style="width:80px">查看详情</el-button>
                            <el-button v-if="scope.row.count_storage && scope.row.count_storage > 0" @click="showOutView(scope.row)" 
                                type="primary" size="mini" style="width:60px">出库</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-col>
                </el-row>
                <add-product-view ref="addProductView" :parent="this"></add-product-view>
                <product-detail-view ref="productDetailView" :parent="this"></product-detail-view>
                <product-out-view ref="productOutView" :parent="this"></product-out-view>
        </div>
        `,
    props:['parent'],
    components:{
        addProductView:addProductManageView,
        productDetailView:productDetailView,
        productOutView:productOutView
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
           let param ={"fun_name":"search_product_manage", // 方法名
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
            this.$refs.productDetailView.show(row)
       },
       showOutView:function(row){
            this.$refs.productOutView.show(row)
       },
       onCreate:function(){
           this.$refs.addProductView.show()
       }

   }
};