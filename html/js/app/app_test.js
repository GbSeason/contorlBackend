var app_test={
    template:`
        <div class="button-panel">
            <el-row>
                <el-col :span="24" class="center-v">
                    this is Test
                </el-col>
            </el-row>
        </div>
    `,
    props:['parent'],
    data(){
        return {
            loading : false
        }
    },
    methods:{
        }
    }