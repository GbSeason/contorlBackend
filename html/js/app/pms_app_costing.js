var productCostingDetailView={
    //成品库明细表
    template:`
        <div>
            <el-dialog title="成品库明细" width="1200px"
                    :close-on-press-escape="false"
                    :close-on-click-modal="false"
                    :visible.sync="showDialog" :destroy-on-close="false" :modal="false">
                    <div>
                    <el-row>
                        <el-col :span="24" style="color:#0c83ff;">
                            材料名称: [{{rowData?rowData.materia_name:""}}]
                            &nbsp;&nbsp;&nbsp;&nbsp; 
                            图号: [{{rowData?rowData.image_no:""}}]
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
                                    <!-- <el-table-column show-overflow-tooltip
                                      label="工序"
                                      width="400">
                                        <template slot-scope="scope">
                                            车钻:{{scope.row.processes_cz}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            铣齿:{{scope.row.processes_xc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            插齿:{{scope.row.processes_cc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            热处理:{{scope.row.processes_rcl}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            磨齿:{{scope.row.processes_mc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            磨外:{{scope.row.processes_mw}}
                                        </template>
                                    </el-table-column> -->
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
                                    <!-- <el-table-column show-overflow-tooltip
                                      label="工序"
                                      width="400">
                                        <template slot-scope="scope">
                                            车钻:{{scope.row.processes_cz}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            铣齿:{{scope.row.processes_xc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            插齿:{{scope.row.processes_cc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            热处理:{{scope.row.processes_rcl}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            磨齿:{{scope.row.processes_mc}}&nbsp;&nbsp;&nbsp;&nbsp;
                                            磨外:{{scope.row.processes_mw}}
                                        </template>
                                    </el-table-column> -->
                                    <el-table-column show-overflow-tooltip
                                      prop="count"
                                      label="出库数量">
                                    </el-table-column>
                                    <!-- <el-table-column show-overflow-tooltip
                                      label="操作"
                                      width="260">
                                        <template slot-scope="scope">
                                            <el-button style="width:70px" @click="editRow(scope.row)" 
                                                type="primary" size="mini">编辑</el-button>
                                            <el-button icon="el-icon-printer" @click="addToPrint(scope.row)" 
                                                type="warning" size="mini">添加打印</el-button>
                                        </template>
                                    </el-table-column> -->
                                  </el-table>
                                </el-tab-pane>
                              </el-tabs>
                        </el-col>
                    </el-row>
                </div>
            </el-dialog>
        </div>
        `,
    props:['parent'],
    components:{
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

var pms_product_costing_view= {
    //成本核算主页
    template:`
            <div>
                <el-row>
                <el-col :span="24">
                <el-form :inline="true" :model="seachForm" class="demo-form-inline" size="mini" style="line-height: 30px;">
                  <el-form-item label="图号">
                    <el-select v-model="seachForm.material_pk" placeholder="图号" @visible-change="showImageSelect" clearable filterable>
                      <el-option v-for="item in materialList" :key="item.pk" :label="item.image_no" :value="item.pk"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="时间">
                    <el-date-picker
                      v-model="createTimeRange"
                      type="daterange"
                      align="right"
                      unlink-panels
                      value-format="timestamp"  
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      :picker-options="pickerOptions">
                    </el-date-picker>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="onSubmitSearch">查询</el-button>
                  </el-form-item>
                  <!--<el-form-item>
                    <el-button type="warning" style="width:150px" @click="switchCostingType">
                        切换为{{seachForm.costing_type==2?" [入库]":" [出库]"}}
                    </el-button>
                  </el-form-item>-->
                    <label style="color:#f3a01b;">
                        计算公式: (工序合 + 单价) * 单重 * 数量
                    </label>
                    <!--<label style="color:#f3a01b;float:right;color: #21cc00;float: right;font-size: 18px;font-weight: bold;">
                        {{seachForm.costing_type==2?" 出":" 入"}}</label>
                    <label style="color:#f3a01b;float:right;color: #21cc00;float: right;font-size: 14px;font-weight: bold;">
                        当前 : </label>-->
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
                          width="120">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="price"
                          label="单价">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="weight"
                          label="单重(Kg)">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="unit"
                          label="单位">
                        </el-table-column>
                        <!--<el-table-column show-overflow-tooltip
                          prop="count"
                          :label="seachForm.costing_type==2?'成品出库小计':'成品库存小计'">-->
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="material_remainder"
                          label="材料小计">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="produce_remainder"
                          label="产线小计">
                        </el-table-column>
                        <el-table-column show-overflow-tooltip
                          prop="product_remainder"
                          label="成品小计">
                        </el-table-column>
                        <!-- <el-table-column  label="操作" width="130">
                          <template slot-scope="scope">
                            <el-button @click="showDetail(scope.row)" type="primary"
                        size="mini" style="width:90px">查看详情</el-button>
                          </template>
                        </el-table-column> -->
                      </el-table>
                    <el-row>
                        <el-col :span="24" style="display: flex;justify-content: flex-end;margin-top:10px;">
                           <!--<div>
                            {{seachForm.costing_type==2?'成品出库量合计':'成品入库量合计'}} : {{storage_count_all}}
                           </div>-->
                           <div style="margin-left:30px;">
                            材料库合计 : {{storage_material_total_all}}
                           </div>
                           <div style="margin-left:30px;">
                            产线库合计 : {{storage_produce_total_all}}
                           </div>
                           <div style="margin-left:30px;">
                            成品库合计 : {{storage_product_total_all}}
                           </div>
                        </el-col>
                    </el-row>
                    </el-col>
                </el-row>
                <product-detail-view ref="productDetailView" :parent="this"></product-detail-view>
        </div>
        `,
    props:['parent'],
    components:{
        productDetailView:productCostingDetailView
    },
    data:function(){
        return {
            tableHeight:590-239,
            loadingData:false,
            tableData:[],
            materialList:[],
            customerList:[],
            createTimeRange:[],
            seachForm:{
                material_pk:"",
                customer_pk:"",
                costing_type:2,//true出库 false入库
                create_time_start:null,
                create_time_end:null,
                
            },
            storage_count_all:0,
            storage_total_all:0,
            storage_material_total_all:0,
            storage_produce_total_all:0,
            storage_product_total_all:0,
            pickerOptions: {
              shortcuts: [{
                text: '最近一周',
                onClick(picker) {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                  picker.$emit('pick', [start, end]);
                }
              }, {
                text: '最近一个月',
                onClick(picker) {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                  picker.$emit('pick', [start, end]);
                }
              }, {
                text: '最近三个月',
                onClick(picker) {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                  picker.$emit('pick', [start, end]);
                }
              }]
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
       switchCostingType(){
        this.seachForm.costing_type = this.seachForm.costing_type == 2?1:2;
        this.onSubmitSearch();
       },
       showImageSelect:function(show){
           if(show && this.materialList.length == 0){
            this.getMaterialList() 
           }
       },
       sizeChange:function(size){
                  this.tableHeight = size.height - 239
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
       checkMaterialCost:function(dataList1,dataList2,costList){
           dataList1.forEach(item=>{
              let outData = dataList2.find((d2d)=>{
                   return d2d.materia_pk == item.materia_pk
               })
              let out = 0;
              if(outData && outData.count > 0){
                  out = outData.count
               }
               costList.forEach(costItem=>{
                   if(costItem.pk == item.materia_pk){
                       //计算材料库存小计
                       let mr = costItem.weight * (item.count - out) * (costItem.gongxu_total + costItem.price);
                       costItem["material_remainder"] = mr?mr.toFixed(2):0;
                       this.storage_material_total_all += Number(costItem["material_remainder"]);//合计
                   }
               })
               
           })
       },
       checkProduceCost:function(dataList1,dataList2,costList){
           dataList1.forEach(item=>{
              let outData = dataList2.find((d2d)=>{
                   return d2d.materia_pk == item.materia_pk
               })
              let out = 0;
              if(outData && outData.count > 0){
                  out = outData.count
               }
               costList.forEach(costItem=>{
                   if(costItem.pk == item.materia_pk){
                       //计算产线库存小计
                       let pr = costItem.weight * (item.count - out) * (costItem.gongxu_total + costItem.price);
                       costItem["produce_remainder"] = pr?pr.toFixed(2):0
                       this.storage_produce_total_all += Number(costItem["produce_remainder"]);//合计
                   }
               }) 
           })
       },
       checkProductCost:function(dataList1,dataList2,costList){
           dataList1.forEach(item=>{
              let outData = dataList2.find((d2d)=>{
                   return d2d.materia_pk == item.materia_pk
               })
              let out = 0;
              if(outData && outData.count > 0){
                  out = outData.count
               }
               costList.forEach(costItem=>{
                   if(costItem.pk == item.materia_pk){
                       //计算成品库存小计
                       let pr = costItem.weight * (item.count - out) * (costItem.gongxu_total + costItem.price);
                       costItem["product_remainder"] = pr?pr.toFixed(2):0
                       this.storage_product_total_all += Number(costItem["product_remainder"]);//合计
                   }
               }) 
           })
       },
       onSubmitSearch:function(){
           this.loadingData = true;
//            search_materia_manage
           this.tableData = []
           if(this.createTimeRange && this.createTimeRange.length == 2){
               this.seachForm.create_time_start = this.createTimeRange[0]
               this.seachForm.create_time_end = this.createTimeRange[1]
           }else{
               this.seachForm.create_time_start = null
               this.seachForm.create_time_end = null
           }
           let params = cloneData(this.seachForm);
           if(params.create_time_start && params.create_time_start == params.create_time_end){
               params.create_time_end += 3600 * 1000 * 24
           }
           let param ={"fun_name":"search_product_manage_costing", // 方法名
                "class_name":"pms_app",// 类名
                params:params // 参数-要与调用的方法匹配
            }
           this.storage_count_all = 0;
           this.storage_total_all = 0;
           this.storage_material_total_all = 0;
           this.storage_produce_total_all = 0;
           this.storage_product_total_all = 0;
           postAPI(
               "/api/app",
               param,
               (response)=>{
                   if(response.res){
                       console.log(response.res)
                       let allList = cloneData(response.res);
                       let allMaterial = allList[0]//所有的材料
                       this.checkProductCost(allList[1],allList[2],allMaterial)
                       this.checkMaterialCost(allList[3],allList[4],allMaterial)
                       this.checkProduceCost(allList[5],allList[6],allMaterial)
                       this.tableData = allMaterial
                   }
                   this.loadingData = false;
                }
            )
       },
       showDetail:function(row){
            this.$refs.productDetailView.show(row)
       },
       onCreate:function(){
           this.$refs.addProductView.show()
       }

   }
};