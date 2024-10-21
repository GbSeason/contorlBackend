var pms_app_print = {
    template: `<div>
                <el-dialog title="打印出库单" width="1000px" 
                :close-on-press-escape="false"
                :close-on-click-modal="false"
                :visible.sync="showDialog" :destroy-on-close="true" :modal="false">
                <div  style="height: 400px;overflow-y: auto;">
                <div id="printElementId">
                    <div v-for="(custom,index_cu) in customers" 
                       :key="index_cu+'index_cu'" style="display:flex;flex-direction:column;justify-content:center;
                    border-top:1px dashed #000000;margin:20px 0 20px 0;padding:20px 0 20px 0;">
                        <div style="width:100%;text-align: center;font-size:20px;font-weight:bold;">
                        陕西恒誉矿山机械制造有限公司                     
                        </div>
                        <div style="width:100%;text-align: center;font-size:20px;font-weight:bold;">
                        物资出库单
                        </div>
                        <div style="width:100%;text-align: left;font-size:14px;
                                display:flex;flex-direction:row;justify-content:space-between">
                            <div>客户名称:
                                <input type="text" :value="custom[0].customer_name"
                                    style="border:0px;width:300px;font-size: 16px;">
                            </div>
                            <div>时间: {{new Date().Format()}}</div>
                        </div>
                        <table border="1" cellspacing="0" width="100%" style="font-size: 16px;">
                            <tr style="text-align: center;height:40px">
                                <th>序号</th>
                                <th>名称</th>
                                <th>图号</th>
                                <th>单位</th>
                                <th>发货数量</th>
                                <th>收货数量</th>
                                <th>备注</th>
                            </tr>
                            <tr v-for="(item,index) in custom" :key="index" style="text-align: center;height:40px">
                                <td style="min-width: 50px;">{{index+1}}</td>
                                <td style="min-width: 120px;">{{item.materia_name}}</td>
                                <td style="min-width: 120px;">{{item.image_no}}</td>
                                <td style="min-width: 60px;">{{item.unit}}</td>
                                <td><input type="text" :value="item.count" style="border:0px;width: 60px;font-size: 16px;"></td>
                                <td><input type="text" :value="item.count" style="border:0px;width: 60px;font-size: 16px;"></td>
                                <td><input type="text" style="border:0px;min-width:50px;"></td>
                            </tr>                   
                        </table>
                        <div style="width:100%;text-align: left;font-size:14px;display:flex;
                            flex-direction:row;justify-content:space-between">
                            <div>发货主管:</div>
                            <div>发货人:</div>
                            <div>收货主管:</div>
                            <div>收货人:</div>
                            <div></div>
                        </div>
                        <div style="width:100%;text-align: left;font-size:14px;display:flex;
                            flex-direction:row;justify-content:space-between">
                            <div>一联仓储组；二联财务部；三、四联客户；</div>
                        </div>
                    </div>
                </div>
            </div>
                <span slot="footer" class="dialog-footer">
                    <el-button type="warning" @click="mergeAll" size="mini" style="float:left;">
                        {{isMerge?"取消合并":"全部合并"}}
                    </el-button>
                    <el-button type="primary" @click="printView" size="mini">打印</el-button>
                    <el-button  @click="showDialog = false" size="mini">关闭</el-button>
                </span>
                </el-dialog>
            </div>`,
    props: ['parent'],
    data: function() {
        return {
            isMerge:false,
            showDialog: false,
            rowDatas: [],
            customers: [] //以企业为单位
        }
    },
    created: function() {

    },
    methods: {
        mergeAll(){
            this.isMerge = !this.isMerge;
            if(this.isMerge){
                this.merge();
            }else{
                this.noMerge();
            }
        },
        merge(){
            if (this.rowDatas.length > 0) {
                let newCases = [];
                let imageNos = [];
                this.rowDatas.forEach(bill => {
                    imageNos.push(bill.image_no);
                });
                imageNos = imageNos.delRepeat();
                imageNos.forEach(im=>{
                  let newE = null;
                  this.rowDatas.forEach(oo => {
                    if(oo.image_no == im){
                       if(!newE){
                        newE = JSON.parse(JSON.stringify(oo))
                        }else{
                        newE.count+=oo.count
                        }
                        }
                      });
                    newCases.push(newE);
                })
                this.customers=[newCases];
            }
        },
        noMerge(){
            this.customers = [];
            if (Array.isArray(this.rowDatas) && this.rowDatas.length > 0) {
                let cusNames = [];
                this.rowDatas.forEach(element => {
                    cusNames.push(element.customer_pk);
                });
                cusNames = cusNames.delRepeat();
                cusNames.forEach(cuname => {
                    let cuOne = [];
                    this.rowDatas.forEach(element => {
                        if (String(element.customer_pk) == cuname) {
                            cuOne.push(element);
                        }
                    });
                    if (cuOne.length > 0) {
                        let newCases = [];
                        let imageNos = [];
                        cuOne.forEach(bill => {
                            imageNos.push(bill.image_no);
                        });
                        imageNos = imageNos.delRepeat();
                        imageNos.forEach(im=>{
                          let newE = null;
                          cuOne.forEach(oo => {
                            if(oo.image_no == im){
                               if(!newE){
                                newE = JSON.parse(JSON.stringify(oo))
                                }else{
                                newE.count+=oo.count
                                }
                                }
                              });
                            newCases.push(newE);
                        })
                        this.customers.push(newCases);
                    }
                });
            } else {
             this.customers.push([this.rowDatas]);
            }
        },
        printView() {
            $("#printElementId").print({
                globalStyles: true, //是否包含父文档的样式，默认为true
                mediaPrint: false, //是否包含media='print'的链接标签。会被globalStyles选项覆盖，默认为false
                stylesheet: null, //外部样式表的URL地址，默认为null

                noPrintSelector: ".no-print", //不想打印的元素的jQuery选择器，默认为".no-print"
                iframe: true, //是否使用一个iframe来替代打印表单的弹出窗口，true为在本页面进行打印，false就是说新开一个页面打印，默认为true
                append: null, //将内容添加到打印内容的后面
                prepend: null, //将内容添加到打印内容的前面，可以用来作为要打印内容
                deferred: $.Deferred() //回调函数
            });
           localStorage.setItem(printList_pms,null)
        },
        show(rowDatas) {
            this.rowDatas = rowDatas;
            this.showDialog = true;
            this.noMerge();
            // console.log(rowDatas.material_pk)
            // this.$nextTick(() => {
            //     new QRCode('qrcodediv', {
            //         text: rowDatas.material_pk,
            //         width: 72,
            //         height: 72,
            //         colorDark: '#000000',
            //         colorLight: '#ffffff',
            //         correctLevel: QRCode.CorrectLevel.H
            //     });
            // });

        }
    }
}