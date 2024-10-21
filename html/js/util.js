function isEmpty(a){
    return  a == undefined || a==null || a.length == 0 || !a
}

function cloneData(data){
    return JSON.parse(JSON.stringify(data))
}

function startMove(e){ // 鼠标按下
    if(e.button === 0){ // 鼠标左键按下
        let x =  e.pageX - e.target.offsetLeft; // 鼠标与窗口边框距离
        let y =  e.pageY - e.target.offsetTop;
        let maxW = window.innerWidth; // 最大拖动位置（不能拖离页面可视区）
        let maxH = window.innerHeight;
        document.onmousemove = (e)=>{ // 鼠标移动
            let loginX = e.pageX;
            let loginY = e.pageY;
            if(loginX < 0) loginX = 0;
            if(loginX > maxW) loginX = maxW;
            if(loginY < 0) loginY = 0;
            if(loginY > maxH) loginY = maxH;
            e.target.style.left = loginX - x + 'px'; // 设置窗口位置，跟随鼠标移动
            e.target.style.top = loginY - y + 'px';
        }
        document.onmouseup = (el) => { // 鼠标抬起，清除鼠标移动事件
            document.onmousemove = null;
        }
    }
}

function convertMillisecondsToDateTime(milliseconds) {
  let date = new Date(milliseconds);
 
  let year = date.getFullYear();
  let month = date.getMonth() + 1; // 月份从0开始计算
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();
 
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
}

Date.prototype.Format = function(fmts) { //author: meizz 
    let fmt = fmts || "yyyy-MM-dd hh:mm:ss"
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

Array.prototype.delRepeat = function() {
    var temp = {},
        len = this.length;
    for (var i = 0; i < len; i++) {
        var tmp = this[i];
        if (!temp.hasOwnProperty(tmp)) { //hasOwnProperty用来判断一个对象是否有你给出名称的属性或对象
            temp[this[i]] = "yes";
        }
    }

    len = 0;
    var tempArr = [];
    for (var i in temp) {
        tempArr[len++] = i;
    }
    return tempArr;
}