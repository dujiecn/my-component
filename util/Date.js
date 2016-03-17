Date.prototype.format = function(fmt) {
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
}

// 获取每个月多少天
Date.prototype.getDays = function() {
  return new Date(this.getFullYear(),this.getMonth() + 1,0).getDate()
}

// 是否是闰年
Date.prototype.isLeapYear = function() {
  var year = this.getFullYear()
  return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}

/*
    获取每个月第一天星期几
*/
Date.prototype.getFirstDay = function() {
    return new Date(this.getFullYear(),this.getMonth(),1).getDay();
}
