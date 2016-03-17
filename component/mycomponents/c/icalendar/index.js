require('./index.css');
var $ = require('jquery');

/*
 // 对Date的扩展，将 Date 转化为指定格式的String
 // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 // 例子：
 // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


var YEAR_AREA_ARRAY = ["1990-1999", "2000-2009", "2010-2019", "2020-2029", "2030-2039", "2040-2049", "2050-2059", "2060-2069", "2070-2079", "2080-2089", "2090-2099", "2100-2109"];
var MONTH_DAY_ARRAY = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var MONTH_ARRAY = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
var WEEK_NAME_ARRAY = ["日", "一", "二", "三", "四", "五", "六"];
// 当前面板的类型
var CALENDAR_TYPE = {
    CENTURY: 1,
    YEAR: 2,
    MONTH: 3,
    DAY: 4
};

/*
 由于传参比较多，改传对象形式：
 option = {
 container:element,日历面板存放的根元素
 time:String,用户传进来的时间
 supportChangeType:boolean,判断是否支持切换不同的日历
 mark:Array 表示日期有特殊标识
 };
 */
function ICalendar(option) {
    this.element = $(option.container);
    this.time = option.time || new Date().format("yyyy-MM-dd");
    this.isSupportChange = option.supportChangeType === false ? false : true;
    this.mark = option.mark || [];

    // 保存原始数据
    this.OriginalTime = this.time;
    // 头节点
    this.headerElement = null;
    // 内容节点
    this.contentElement = null;

    this.parentElement = null;
    // 每月1号是周几
    this.firstDayOfMonth = null;

    this.year = 0;
    this.month = 0;
    this.day = 0;
    // 面板类型
    this.timeType = null;
    // 只保存初始化的面板类型 用来判断用的，不会改变该值
    this.calendarType = null;

    this.animationTime = 400;

    this.loaded = false;

};
/*
 解析时间字符串,获取有用的数据
 */
ICalendar.prototype.parseTime = function (time) {
    time && (this.time = time);
    var timeArray = this.time.split("-");
    var yearStr = timeArray[0],
        monthStr = timeArray[1],
        dayStr = timeArray[2];

    if (!monthStr && !dayStr) {
        !this.loaded && (this.calendarType = CALENDAR_TYPE.YEAR);
        this.timeType = CALENDAR_TYPE.YEAR;
        this.year = parseInt(yearStr);
    } else if (!dayStr) {
        !this.loaded && (this.calendarType = CALENDAR_TYPE.MONTH);
        this.timeType = CALENDAR_TYPE.MONTH;
        this.year = parseInt(yearStr);
        this.month = parseInt(monthStr) - 1;

        if (this.timeType == CALENDAR_TYPE.MONTH && this.loaded) {
            var date = new Date(this.year, this.month, this.day);
            date.setDate(1);
            this.firstDayOfMonth = date.getDay();
        }
    } else {
        !this.loaded && (this.calendarType = CALENDAR_TYPE.DAY);
        this.timeType = CALENDAR_TYPE.DAY;
        this.year = parseInt(yearStr);
        this.month = parseInt(monthStr) - 1;
        this.day = parseInt(dayStr);
        var date = new Date(this.year, this.month, this.day);
        date.setDate(1);
        this.firstDayOfMonth = date.getDay();
    }
};
/*
 创建日历需要的节点元素
 */
ICalendar.prototype.createHTML = function () {
    this.parentElement && this.parentElement.remove();
    this.parentElement = $("<div>").addClass("u-icalendar-wrapper").appendTo(this.element);
    this.headerElement = $("<div>").addClass("header").appendTo(this.parentElement);
    this.contentElement = $("<div>").addClass("content").appendTo(this.parentElement);
    this.setStyle();
};
ICalendar.prototype.setStyle = function () {
    // var w = this.element.width() || 246;
    var h = this.element.height() || 200;

    this.headerElement.css({
        // width:w,
        height: h * 0.15
    });

    this.contentElement.css({
        // width:w,
        height: h * 0.85
    });
};
ICalendar.prototype.reset = function () {
    this.parseTime(this.OriginalTime);
    this.render();
};
ICalendar.prototype.getTime = function () {
    return this.contentElement.find("td.now").data("time");
};
/*
 渲染入口
 */
ICalendar.prototype.render = function () {
    this.createHTML();
    this.parseTime();

    if (this.timeType == CALENDAR_TYPE.YEAR) {
        this.drawYearPanel();
    } else if (this.timeType == CALENDAR_TYPE.MONTH) {
        this.drawMonthPanel();
    } else if (this.timeType == CALENDAR_TYPE.DAY) {
        this.drawDayPanel();
    }

    this.headerElement.find("td:eq(1)").attr("nowrap", "");

    this.loaded = true;
    return this;
};

/*
 根据时间渲染日历组件（提供外面调用）
 */
ICalendar.prototype.renderByDate = function (time) {
    this.time = time;
    this.render();
    return this;
};

/*
 绘制时间面板
 cellIndex 从月份面板传过来的下标
 */
ICalendar.prototype.drawDayPanel = function (cellIndex, direct) {
    var _this = this;
    // 判断是否是闰年
    ((this.year % 4 == 0 && this.year % 100 != 0) || this.year % 400 == 0) && (MONTH_DAY_ARRAY[1] = 29);

    /*
     获取行数和列数的函数
     */
    function getRowAndColumnNumber(totalDaysOfMonth) {
        // 根据每个月的一号是周几 计算出总共是多少天（以每行7天计算，方便下面计算行数）
        var tempTotalDays = 0;
        switch (_this.firstDayOfMonth) {
            case 1:
                tempTotalDays = totalDaysOfMonth + 1;
                break;
            case 2:
                tempTotalDays = totalDaysOfMonth + 2;
                break;
            case 3:
                tempTotalDays = totalDaysOfMonth + 3;
                break;
            case 4:
                tempTotalDays = totalDaysOfMonth + 4;
                break;
            case 5:
                tempTotalDays = totalDaysOfMonth + 5;
                break;
            case 6:
                tempTotalDays = totalDaysOfMonth + 6;
                break;
            case 0:
                tempTotalDays = totalDaysOfMonth;
                break;
            default:
                tempTotalDays = totalDaysOfMonth
                break;
        }
        return {
            row: Math.ceil(tempTotalDays / 7),
            column: 7
        }
    }


    /*
     初始化头部
     */
    var headerTime = this.year + "年" + ((this.month + 1) < 10 ? "0" + (this.month + 1) : this.month + 1) + "月";
    if (this.headerElement.children().length) {
        this.headerElement.find("td").each(function (idx) {
            $(this).off("click");
            if (idx == 0) {
                $(this).on("click", function () {
                    var month = _this.month;
                    var year = _this.year;
                    var day = _this.day;
                    if (month == 0) {
                        month = 12;
                        year--;
                    }
                    _this.parseTime(year + "-" + month + "-" + _this.day);
                    _this.drawDayPanel(cellIndex, "left");
                });
            } else if (idx == 1) {
                _this.headerAnimation($(this), headerTime);

                if (_this.isSupportChange) {
                    $(this).on("click", function () {
                        _this.drawMonthPanel();
                    });
                }
            } else if (idx == 2) {
                $(this).on("click", function () {
                    var month = _this.month;
                    var year = _this.year;
                    var day = _this.day;
                    if (month == 11) {
                        month = -1;
                        year++;
                    }

                    _this.parseTime(year + "-" + (month + 2) + "-" + _this.day);
                    _this.drawDayPanel(cellIndex, "right");
                });
            }
        });
    } else {
        var headerTable = $("<table>");
        var tr = $("<tr>");
        $("<td>").off("click").on("click", function () {
            var month = _this.month;
            var year = _this.year;
            if (month == 0) {
                month = 12;
                year--;
            }

            _this.parseTime(year + "-" + month + "-" + _this.day);
            _this.drawDayPanel(cellIndex, "left");
        }).appendTo(tr);

        if (this.isSupportChange) {
            $("<td>").text(headerTime).off("click").on("click", function () {
                _this.drawMonthPanel();
            }).appendTo(tr);
        } else {
            $("<td>").text(headerTime).appendTo(tr);
        }

        // $("<td>").text(headerTime).off("click").on("click", function() {
        // 	_this.drawMonthPanel();
        // }).appendTo(tr);

        $("<td>").off("click").on("click", function () {
            var month = _this.month;
            var year = _this.year;
            if (month == 11) {
                month = 0;
                year++;
            }

            _this.parseTime(year + "-" + (month + 2) + "-" + _this.day);
            _this.drawDayPanel(cellIndex, "right");
        }).appendTo(tr);

        headerTable.append(tr).appendTo(this.headerElement);
    }


    /*
     初始化日期内容部分
     */
    var totalDaysOfMonth = MONTH_DAY_ARRAY[_this.month];


    var rc = getRowAndColumnNumber(totalDaysOfMonth);

    // 初始化日期table
    var contentTable = $("<table>");
    var weekTr = $("<tr>");
    for (var i = 0; i < 7; i++) {
        $("<td>").text(WEEK_NAME_ARRAY[i]).appendTo(weekTr);
    }
    contentTable.append(weekTr);

    for (var i = 0; i < rc.row; i++) {
        var tr = $("<tr>");
        for (var j = 0; j < rc.column; j++) {
            tr.append($("<td>"));
        }
        contentTable.append(tr);
    }

    // 上个月的总天数
    var totalDaysOfPrevMonth = MONTH_DAY_ARRAY[_this.month == 0 ? 11 : _this.month - 1];
    // 计算开始日期之前空几个td
    var prevNullSize = 0;
    contentTable.find("tr:gt(0) td").each(function (index) {
        if (index < _this.firstDayOfMonth)
            prevNullSize++;
    });

    // 填充里面的日期数字
    contentTable.find("tr:gt(0) td").each(function (index) {
        if (index < _this.firstDayOfMonth) {
            $(this).text(totalDaysOfPrevMonth + 1 - prevNullSize + index);
        } else if (index + 1 > totalDaysOfMonth + prevNullSize) {
            $(this).text(index + 1 - (totalDaysOfMonth + prevNullSize));
        } else {
            $(this).addClass("hasDate").text(index + 1 - prevNullSize);
            // 单独标识当前的日期样式
//				var date = new Date().getDate();
//				if(_this.day != date && date == index + 1 - prevNullSize) {
//					$(this).css("outline","1px solid rgb(47, 92, 151)");
//				}
        }
    });


    // 填充里面的日期数字
//		contentTable.find("tr:gt(0) td").eq(this.firstDayOfMonth).addClass("hasDate").text(1);
//		contentTable.find("tr:gt(0) td:gt(" + this.firstDayOfMonth + ")").each(function(index) {
//			if (index >= totalDaysOfMonth - 1)
//				return;
//
//			$(this).addClass("hasDate").text(index + 2);
//		});


    // 处理有日期的td
    contentTable.find("td.hasDate").each(function (idx) {
        var _self = this;
        var time = _this.year + "-" + ((_this.month + 1) < 10 ? "0" + (_this.month + 1) : _this.month + 1) + "-" + ($(this).text() < 10 ? "0" + $(this).text() : $(this).text());
        // 保存每个td的时间
        $(this).data("time", time);

        // 突出显示当前时间
        if ($(this).text() == _this.day) {
            $(this).addClass("now");
        }

        // 判断有木有日期需要特出标识 mark
        _this.mark.forEach(function (dt) {
            if (dt == time) {
                $(_self).addClass('mark');
            }
        });


        // 判断到最后一个td的时候有木有日期被选中，没有则默认选中最后一天，（处理2月份的情况，如之前是31号，切换到2月份则没有日子被选中）
        if (idx == contentTable.find("td.hasDate").length - 1) {
            if (contentTable.find("td.now").length == 0) {
                $(this).addClass("now").text();
            }
        }
    });


    contentTable.find("td.hasDate").on("click", function () {
        contentTable.find("td.now").removeClass("now");
        $(this).addClass("now");
        _this.parseTime($(this).data("time"));
    });


    if (this.timeType == CALENDAR_TYPE.MONTH) {
        object = {
            source: this.contentElement.children().last(),
            target: contentTable,
            cellIndex: cellIndex
        };
        this.zoomOut(object);
    } else {
        if (this.contentElement.children().length == 0) {
            this.contentElement.append(contentTable);
        } else {
            // 切换箭头的时候会进入这个逻辑里面
            if (direct == "left") {
                this.moveLeft({
                    source: this.contentElement.children().last(),
                    target: contentTable
                });
            } else if (direct == "right") {
                this.moveRight({
                    source: this.contentElement.children().last(),
                    target: contentTable
                });
            }
        }
    }

    this.timeType = CALENDAR_TYPE.DAY;
};
/*
 绘制日期面板
 */
ICalendar.prototype.drawMonthPanel = function (cellIndex, direct) {
    var _this = this;
    /*
     头部部分
     */
    if (this.headerElement.children().length) {
        this.headerElement.find("td").each(function (idx) {
            $(this).off("click");
            if (idx == 0) {
                $(this).on("click", function () {
                    _this.parseTime((_this.year - 1) + "-" + (_this.month + 1));
                    _this.drawMonthPanel(cellIndex, "left");
                });
            } else if (idx == 1) {
                _this.headerAnimation($(this), _this.year);

                if (_this.isSupportChange) {
                    $(this).on("click", function () {
                        _this.drawYearPanel();
                    });
                }
            } else if (idx == 2) {
                $(this).on("click", function () {
                    _this.parseTime((_this.year + 1) + "-" + (_this.month + 1));
                    _this.drawMonthPanel(cellIndex, "right");
                });
            }
        });
    } else {
        var headerTable = $("<table>");
        var tr = $("<tr>");
        $("<td>").off("click").on("click", function () {
            _this.parseTime((_this.year - 1) + "-" + (_this.month + 1));
            _this.drawMonthPanel(_this.month, "left");
        }).appendTo(tr);

        if (this.isSupportChange) {
            $("<td>").text(this.year).off("click").on("click", function () {
                _this.drawYearPanel();
            }).appendTo(tr);
        } else {
            $("<td>").text(this.year).off("click").appendTo(tr);
        }

        $("<td>").off("click").on("click", function () {
            _this.parseTime((_this.year + 1) + "-" + (_this.month + 1));
            _this.drawMonthPanel(_this.month, "right");
        }).appendTo(tr);

        headerTable.append(tr).appendTo(this.headerElement);
    }


    /*
     内容部分
     */
    var contentTable = $("<table>");
    for (i = 0; i < 3; i++) {
        var tr = $("<tr>");
        for (var j = 0; j < 4; j++) {
            $("<td>").css({
                width: "25%"
            }).appendTo(tr);
        }
        tr.appendTo(contentTable);
    }

    // 保存当前选中的时间cell
    var nowCell = null;
    contentTable.find("td").each(function (index) {
        // 保存当前时间到td上面
        var time = _this.year + "-" + ((index + 1) < 10 ? "0" + (index + 1) : index + 1);

        $(this).data("time", time).addClass('hasDate').text(MONTH_ARRAY[index]).on("click", function () {
            /*
             td的事件是点击第一次选中，在选中的状态下再点击一次是进入
             */
            var selectTd = contentTable.find("td.now");
            _this.parseTime($(this).data("time"));

            if ($(this).text() == selectTd.text() && _this.calendarType != CALENDAR_TYPE.MONTH) {
                _this.drawDayPanel(index);
                $(this).off("click");
            } else {
                selectTd.removeClass("now");
                $(this).addClass("now");
            }
        });

        if (index == _this.month) {
            nowCell = $(this).addClass("now");
        }
    });


    if (this.timeType == CALENDAR_TYPE.DAY) {
        object = {
            source: this.contentElement.children().last(),
            target: contentTable,
            cellIndex: this.month
        };
        this.zoomIn(object);
    } else if (this.timeType == CALENDAR_TYPE.YEAR) {
        object = {
            source: this.contentElement.children().last(),
            target: contentTable,
            cellIndex: cellIndex
        };
        this.zoomOut(object);
    } else {
        if (this.contentElement.children().length == 0) {
            this.contentElement.append(contentTable);
        } else {
            // 切换箭头的时候会进入这个逻辑里面
            if (direct == "left") {
                this.moveLeft({
                    source: this.contentElement.children().last(),
                    target: contentTable
                });
            } else if (direct == "right") {
                this.moveRight({
                    source: this.contentElement.children().last(),
                    target: contentTable
                });
            }
        }
    }


    this.timeType = CALENDAR_TYPE.MONTH;
};
/*
 绘制年份面板
 */
ICalendar.prototype.drawYearPanel = function (cellIndex, direct) {
    var _this = this;


    /*
     生成内容部分
     */
    var contentTable = $("<table>");
    for (i = 0; i < 3; i++) {
        var tr = $("<tr>");
        for (var j = 0; j < 4; j++) {
            $("<td>").css({
                width: "25%"
            }).appendTo(tr);
        }
        tr.appendTo(contentTable);
    }


    var number = cellIndex == undefined ? parseInt((this.year - 1990) / 10) : cellIndex;


    var yearArr = YEAR_AREA_ARRAY[number].split("-");
    // 组装YEAR_ARRAY
    var index = 0;
    var array = [];
    for (var i = parseInt(yearArr[0]) - 1; i <= parseInt(yearArr[1]) + 1; i++) {
        array.push(i);
    }

    var tempIndex = 0;
    contentTable.find("td").each(function (idx) {
        $(this).text(array[idx]);

        // 置灰第一个和最后一个
        if (idx == 0 || idx == array.length - 1) {
            $(this).css({
                color: "#999",
                cursor: "no-drop"
            });
        } else {
            if ($(this).text() == _this.year) {
                $(this).addClass("now");
                tempIndex = idx;
            }

            $(this).addClass("hasDate").data("time", $(this).text()).on("click", function () {
                _this.parseTime($(this).text());
                var select = contentTable.find("td.now");
                if ($(this).text() == select.text() && _this.calendarType != CALENDAR_TYPE.YEAR) {
                    _this.drawMonthPanel(idx);
                    $(this).off("click");
                } else {
                    select.removeClass("now");
                    $(this).addClass("now");
                }
            });
        }
    });


    /*
     头部部分事件处理
     */
    if (this.headerElement.children().length > 0) {
        this.headerElement.find("td").each(function (idx) {
            if (idx == 0) {
                $(this).off("click").removeClass("hide").on("click", function () {
                    if (number < 1)
                        return;

                    _this.drawYearPanel(number - 1, "left");
                });
            } else if (idx == 1) {
                _this.headerAnimation($(this), YEAR_AREA_ARRAY[number]);

                if (_this.isSupportChange) {
                    $(this).off("click").on("click", function () {
                        _this.drawCenturyPanel(number);
                    });
                }
            } else if (idx == 2) {
                $(this).off("click").removeClass("hide").on("click", function () {
                    if (number > YEAR_AREA_ARRAY.length - 2)
                        return;

                    _this.drawYearPanel(number + 1, "right");
                });
            }
        });

    } else {
        var headerTable = $("<table>");
        var tr = $("<tr>");
        $("<td>").off("click").on("click", function () {
            // _this.parseTime((_this.year - 1) + "-" + (_this.month + 1));
            _this.drawYearPanel(number - 1, "left");
        }).appendTo(tr);

        // 支持头部切换日历面板
        if (this.isSupportChange) {
            $("<td>").text(YEAR_AREA_ARRAY[number]).off("click").on("click", function () {
                _this.drawCenturyPanel(number);
            }).appendTo(tr);
        } else {
            $("<td>").text(YEAR_AREA_ARRAY[number]).appendTo(tr);
        }


        $("<td>").off("click").on("click", function () {
            // _this.parseTime((_this.year + 1) + "-" + (_this.month + 1));
            _this.drawYearPanel(number - 1, "right");
        }).appendTo(tr);

        headerTable.append(tr).appendTo(this.headerElement);
    }


    if (this.timeType == CALENDAR_TYPE.MONTH) {
        object = {
            source: this.contentElement.children().last(),
            target: contentTable,
            cellIndex: tempIndex
        };
        this.zoomIn(object);
    } else if (this.timeType == CALENDAR_TYPE.CENTURY) {
        object = {
            source: this.contentElement.children().last(),
            target: contentTable,
            cellIndex: cellIndex
        };
        this.zoomOut(object);
    } else {
        if (this.contentElement.children().length == 0) {
            this.contentElement.append(contentTable);
        } else {
            // 切换箭头的时候会进入这个逻辑里面
            if (direct == "left") {
                this.moveLeft({
                    source: this.contentElement.children().last(),
                    target: contentTable
                });
            } else if (direct == "right") {
                this.moveRight({
                    source: this.contentElement.children().last(),
                    target: contentTable
                });
            }
        }
    }


    this.timeType = CALENDAR_TYPE.YEAR;
};
/*
 绘制世纪面板
 */
ICalendar.prototype.drawCenturyPanel = function (cellIndex) {
    var _this = this;

    var contentTable = $("<table>");
    for (var i = 0; i < 3; i++) {
        tr = $("<tr>");
        for (var j = 0; j < 4; j++) {
            $("<td>").css({
                width: "25%"
            }).appendTo(tr);
        }
        tr.appendTo(contentTable);
    }

    var tempIndex = 0;
    contentTable.find("td").each(function (i) {
        $(this).data("time", YEAR_AREA_ARRAY[i]).addClass('hasDate').html(function () {
            var text = YEAR_AREA_ARRAY[i].split("-");
            return "<span>" + text[0] + "-<br/>" + text[1] + "</span>";
        }).on("click", function () {
            _this.drawYearPanel(i);
            contentTable.find("td.now").removeClass("now");
            $(this).addClass("now").off("click");
        });


        if (cellIndex) {
            cellIndex == i && $(this).addClass("now");
        } else {
            var yearArr = $(this).text().split("-");
            if (yearArr[0] < _this.year && _this.year < yearArr[1]) {
                $(this).addClass("now");
                tempIndex = i;
            }
        }
    });


    if (this.headerElement.children().length) {
        _this.headerElement.find("td").off("click");
        _this.headerElement.find("td:first,td:last").addClass("hide");
        var yearArea = YEAR_AREA_ARRAY[0].split("-")[0] + "-" + YEAR_AREA_ARRAY[YEAR_AREA_ARRAY.length - 1].split("-")[1];
        var linkElement = this.headerElement.find("td:eq(1)");
        linkElement.off("click");
        this.headerAnimation(linkElement, yearArea);
    }


    if (this.timeType == CALENDAR_TYPE.YEAR) {
        object = {
            source: this.contentElement.children().last(),
            target: contentTable,
            cellIndex: cellIndex || tempIndex
        };
        this.zoomIn(object);
    }

    this.timeType = CALENDAR_TYPE.CENTURY;
};
/*
 包装动画所需要的数据
 */
ICalendar.prototype.getLayoutInfo = function (index) {
    var contentWidth = this.contentElement.width();
    var contentHeight = this.contentElement.height();
    var row = parseInt(index / 4);
    var col = index - row * 4;
    var top = contentHeight / 3 * row;
    var left = contentWidth / 4 * col;
    var cellWidth = contentWidth / 4;
    var cellHeight = contentHeight / 3;
    var ratioW = cellWidth / contentWidth;
    var ratioH = cellHeight / contentHeight;
    return {
        contentWidth: contentWidth,
        contentHeight: contentHeight,
        cellWidth: cellWidth,
        cellHeight: cellHeight,
        ratioW: ratioW,
        ratioH: ratioH,
        top: top,
        left: left
    }
};
/*
 缩小的动画
 */
ICalendar.prototype.zoomIn = function (object) {
    var _this = this;
    /*
     object:source,target,cellIndex
     */
    var info = this.getLayoutInfo(object.cellIndex);
    var left = info.left;
    var top = info.top;
    var ratioW = info.ratioW;
    var ratioH = info.ratioH;
    var cellHeight = info.cellHeight;
    var cellWidth = info.cellWidth;

    object.target.css({
        opacity: "0",
        transform: "translate(" + -left * 1 / ratioW + "px," + -top * 1 / ratioH + "px) scale(" + 1 / ratioW + "," + 1 / ratioH + ")",
        webkitTransform: "translate(" + -left * 1 / ratioW + "px," + -top * 1 / ratioH + "px) scale(" + 1 / ratioW + "," + 1 / ratioH + ")"
    }).appendTo(this.contentElement);

    setTimeout(function () {
        object.target.css({
            opacity: "1",
            zIndex: "1",
            transform: "scale(1,1)",
            webkitTransform: "scale(1,1)"
        });

        object.source.css({
            opacity: "0",
            zIndex: "2",
            transform: "translate(" + left + "px," + top + "px) scale(" + ratioW + "," + ratioH + ")",
            webkitTransform: "translate(" + left + "px," + top + "px) scale(" + ratioW + "," + ratioH + ")"
        });

        setTimeout(function () {
            object.target.prevAll().remove();
        }, _this.animationTime);
    }, 0);
};
/*
 放大的动画
 */
ICalendar.prototype.zoomOut = function (object) {
    var _this = this;

    var info = this.getLayoutInfo(object.cellIndex);
    var left = info.left;
    var top = info.top;
    var ratioW = info.ratioW;
    var ratioH = info.ratioH;
    var cellHeight = info.cellHeight;

    object.target.css({
        opacity: "0",
        transform: "translate(" + left + "px," + top + "px) scale(" + ratioW + "," + ratioH + ")",
        webkitTransform: "translate(" + left + "px," + top + "px) scale(" + ratioW + "," + ratioH + ")"
    }).appendTo(this.contentElement);

    setTimeout(function () {
        object.target.css({
            opacity: "1",
            zIndex: "1",
            transform: "scale(1,1)",
            webkitTransform: "scale(1,1)",
            top: 0,
            left: 0
        });

        object.source.css({
            opacity: "0",
            zIndex: "2",
            transform: "translate(" + -left * 1 / ratioW + "px," + -top * 1 / ratioH + "px) scale(" + 1 / ratioW + "," + 1 / ratioH + ")",
            webkitTransform: "translate(" + -left * 1 / ratioW + "px," + -top * 1 / ratioH + "px) scale(" + 1 / ratioW + "," + 1 / ratioH + ")"
        });

        setTimeout(function () {
            object.target.prevAll().remove();
        }, _this.animationTime);
    }, 0);
};
/*
 往左的动画
 */
ICalendar.prototype.moveRight = function (object) {
    var _this = this;


    /*
     source target
     */
    object.target.css({
        transform: "translate(100%)",
        webkitTransform: "translate(100%)",
    });

    object.target.appendTo(this.contentElement);
    setTimeout(function () {
        object.target.css({
            transform: "translate(0)",
            webkitTransform: "translate(0)",
        });

        object.source.css({
            transform: "translate(-100%)",
            webkitTransform: "translate(-100%)",
        });

        setTimeout(function () {
            object.target.prevAll().remove();
        }, _this.animationTime);
    }, 100);
};
/*
 往右的动画
 */
ICalendar.prototype.moveLeft = function (object) {
    var _this = this;

    object.target.css({
        transform: "translate(-100%)",
        webkitTransform: "translate(-100%)",
    });

    object.target.appendTo(this.contentElement);
    setTimeout(function () {
        object.target.css({
            transform: "translate(0)",
            webkitTransform: "translate(0)",
        });

        object.source.css({
            transform: "translate(100%)",
            webkitTransform: "translate(100%)",
        });

        setTimeout(function () {
            object.target.prevAll().remove();
        }, _this.animationTime);
    }, 100);
};
ICalendar.prototype.headerAnimation = function (linkElement, text) {
    linkElement.css("opacity", "0.1");
    setTimeout(function () {
        linkElement.css("opacity", "1").text(text);
    }, 300);
}

module.exports.ICalendar = ICalendar;


// test code
var ic = new ICalendar({
    container: ".u-icalendar",
//	time:"2015-5-3",
    supportChangeType: true,
    mark: ["2012-1-1", "2015-01-01", "2012-2-1"]
}).render();

