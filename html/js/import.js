function loadScript(url, callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  if (script.readyState) {  // 仅限IE
    script.onreadystatechange = function() {
      if (script.readyState == "loaded" || script.readyState == "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {  // 其他浏览器
    script.onload = function() {
      callback();
    };
  }
  // 设置脚本URL开始加载
  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
}
function loadCSS(url, callback) {
  var style = document.createElement("link");
  style.rel = "stylesheet"
  if (style.readyState) {  // 仅限IE
    style.onreadystatechange = function() {
      if (style.readyState == "loaded" || style.readyState == "complete") {
        style.onreadystatechange = null;
        callback();
      }
    };
  } else {  // 其他浏览器
    style.onload = function() {
      callback();
    };
  }
  // 设置脚本URL开始加载
  style.href = url;
  document.getElementsByTagName("head")[0].appendChild(style);
}
var scripts=[
        {url:"/js/md5.js",init:"",type:"js"},
        {url:"/js/jquery-3.7.1.min.js",init:"",type:"js"},
        {url:"/js/jquery-ui.min.js",init:"",type:"js"},
        {url:"/js/jQuery.print.min.js",init:"",type:"js"},
        {url:"/js/util.js",init:"",type:"js"},
        {url:"/js/echarts.min.js",init:"",type:"js"},
        {url:"/js/vue2.js",init:"",type:"js"},
        {url:"/js/index_element.js",init:"",type:"js"},
        {url:"/js/apps.js" + rand,init:"",type:"js"},
        {url:"/js/mainView.js" + rand,init:"",type:"js"},]

function load_init(loads,index){
    let item = loads[index]
    if(item.url){
        loadScript(item.url, function() {
          if(item.init){
            eval(item.init)
          }
          let rate = `${(((index+1)/loads.length)*100).toFixed(0)}%`
           document.getElementById("loading_main_rate").innerText = rate
           document.getElementById("loading_line").style.width = rate
          if(index+1 < loads.length){
               load_init(loads,index+1)
          }else{
            $("#loading_main").hide()
          }
        });
    }
}
//初始化系统
load_init(scripts,0)
function postAPI(url,param,back){
    $.ajax({
        url: url, // 替换为你的API端点
        type: 'POST', // 请求类型
        contentType: 'application/json', // 发送信息至服务器时内容编码类型
        data: JSON.stringify(param), // 将对象转换为JSON字符串
        processData: false, // 不要对data进行处理，因为数据已经是字符串
        dataType: 'json', // 期望从服务器返回的数据类型
        success: function(response) {
            // 请求成功时的回调函数
            back(response);
        },
        error: function(xhr, status, error) {
            // 请求失败时的回调函数
            console.error('Error:', error);
        }
    });
}

/**
scripts.forEach(item=>{
    if(item.url){
        if(item.type == "js"){
            if(item.delay){
                setTimeout(()=>{
                    loadScript(item.url, function() {
                      if(item.init){
                        eval(item.init)
                      }
                    });
                },item.delay)
            }else{
                loadScript(item.url, function() {
                  if(item.init){
                    eval(item.init)
                  }
                });
            }
        }
        if(item.type == "css"){
            loadScript(item.url, function() {
              if(item.init){
                eval(item.init)
              }
            });
        }

    }
})
**/