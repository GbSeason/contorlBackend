var getMaterialList = function(type,back){
            let param ={"fun_name":"search_materia_attribute_list", // 方法名
                    "class_name":"pms_app",// 类名
                    params:{"type":type} // 参数-要与调用的方法匹配
                }
               postAPI(
                   "/api/app",
                   param,
                   (response)=>{
                       back(response.res)
                    }
                )
        };
var getCustomerList = function(back){
            let param ={"fun_name":"search_customer_list", // 方法名
                    "class_name":"pms_app",// 类名
                    params:"" // 参数-要与调用的方法匹配
                }
               postAPI(
                   "/api/app",
                   param,
                   (response)=>{
                       back(response.res)
                    }
                )
        };

var setCurrentStorage = function(dataList1,dataList2){
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
    }
var pms_dashboard={
    template:`
        <div :style="{'height':tableHeight+'px'}">
            <el-row style="width:100%">
                <el-col :span="24" class="center-v center-h" style="height:100%;width:100%">
                    <label style="color:#f3a01b;">小贴士：当前阶段的 [累计库存] 减去 [当前库存] 等于下一阶段的 [累计库存]</label>
                </el-col>
            </el-row>
            <el-row style="width:100%">
                <el-col :span="24" class="center-v center-h" style="height:100%;width:100%">
                    <div>
                    <el-tag class="tag-board-pms">材料库存
                        <div style="margin-top: -5px;margin-right: -25px;float: right;
                        position: relative;"><el-button type="text" @click="showTab('material')" style="float: right;color:#0053a9;">更多>></el-button></div>
                        <div v-for="(item,index) in storages[0]" :key="index+'_x'">
                            <div v-if="index < 3">
                                {{item.materia_name+' ['+item.image_no+']'}}
                                累计：{{item.count}}
                                当前：{{item.count_storage}}
                            </div>
                        </div>
                        
                    </el-tag>
                    </div>
                    <div>
                    <el-tag class="tag-board-pms" type="success">产线库存
                        <div style="margin-top: -5px;margin-right: -25px;float: right;position: relative;"><el-button type="text" @click="showTab('produce')" style="float: right;color:#0053a9;">更多>></el-button></div>
                        <div v-for="(item,index) in storages[2]" :key="index+'_x'">
                            <div v-if="index < 3">
                                {{item.materia_name+' ['+item.image_no+']'}}
                                累计：{{item.count}}
                                当前：{{item.count_storage}}
                            </div>
                        </div>
                        
                    </el-tag>
                    </div>
                    <div>
                    <el-tag class="tag-board-pms" type="info">产品库存
                        <div style="margin-top: -5px;margin-right: -25px;float: right;position: relative;"><el-button type="text" @click="showTab('product')" style="float: right;color:#0053a9;">更多>></el-button></div>
                        <div v-for="(item,index) in storages[4]" :key="index+'_x'">
                            <div v-if="index < 3">
                                {{item.materia_name+' ['+item.image_no+']'}}
                                累计：{{item.count}}
                                当前：{{item.count_storage}}
                            </div>
                        </div>
                        
                    </el-tag>
                    </div>
                </el-col>
            </el-row>
            <el-row style="width:100%">
                <el-col :span="24" class="center-v" style="height:100%;width:100%">
                   <div id="dashboard_charts"></div>
                </el-col>
            </el-row>
        </div>
    `,
    components:{
    
    },
    props:['parent'],
    data:function(){
        return {
            tableHeight:600 - 170,
            barCharts:null,
            storages:[0,0,0]
        }
    },
    created: function() {
        
    },
    mounted:function(){
        this.init()
    },
    methods:{
      init:function(tabName){
         this.getDashboardData() 
      },
      showTab:function(tabName){
          this.parent.showTab(tabName)
      },
      startCharts:function(){
          setInterval(()=>{
              this.getDashboardData();
          },10000)
      },
      renderCharts:function(datas){
          let chartsData = datas[1];
          if(this.barCharts==null){
              let dom = byId('dashboard_charts');
                this.barCharts = echarts.init(dom, null, {
                  renderer: 'canvas',
                  useDirtyRect: true
                });
          }
          this.setChartsData(chartsData[0],chartsData[1]);
      },
      setChartsData:function(xData,yData){
        let option = {
              tooltip:{
                    show:true
                },
              title: {
                text: '内存占用',
                textStyle:{
                    color:"#FFFFFF"
                },
                padding:[10,0,0,10]
              },
              xAxis: {
                type: 'category',
                data: xData,
                axisLabel:{
                    color:"#FFFFFF"
                }
              },
              yAxis: {
                type: 'value',
                axisLabel:{
                    color:"#FFFFFF"
                }
              },
              series: [
                {
                  data: yData,
                  type: 'bar',
                  lineStyle:{
                    color:"#FDF04E"
                  },
                  itemStyle: {
                    normal: {
                        // 点的颜色
                        color: '#FFF',
                        // 点的大小
                        borderWidth: 5,
                        borderColor: '#FDF04E'
                    }
                }
                }
              ]
            };
        this.barCharts.setOption(option);
        },
      getDashboardData:function(){
           let param ={"fun_name":"search_dashboard_data", // 方法名
                "class_name":"pms_app",// 类名
                params:{
                    materia_pk:"",
                    customer_pk:""
                    }// 参数-要与调用的方法匹配
            }
           postAPI("/api/app",param,
               (response)=>{
                   if(response.res){
//                        console.log(response.res)
                       this.storages = response.res;
                       setCurrentStorage(this.storages[0],this.storages[1])
                       setCurrentStorage(this.storages[2],this.storages[3])
                       setCurrentStorage(this.storages[4],this.storages[5])
//                        this.renderCharts(response.res);
                   }
                }
            )
      },
      sizeChange:function(size){
          this.tableHeight = size.height - 170
       },     
    }
};