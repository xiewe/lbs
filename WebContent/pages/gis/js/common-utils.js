/**
 * JS常用工具类
 */

/**
 * 方法作用：【格式化时间】 使用方法 示例： 使用方式一： var now = new Date(); var nowStr =
 * now.dateFormat("yyyy-MM-dd hh:mm:ss"); 使用方式二： new
 * Date().dateFormat("yyyy年MM月dd日"); new Date().dateFormat("MM/dd/yyyy"); new
 * Date().dateFormat("yyyyMMdd"); new Date().dateFormat("yyyy-MM-dd hh:mm:ss");
 * 
 * @param format
 *            {date} 传入要格式化的日期类型
 * @returns {2015-01-31 16:30:00}
 */
Date.prototype.dateFormat = function(fmt) {
	var o = {
		"M+" : this.getMonth() + 1, // 月份
		"d+" : this.getDate(), // 日
		"h+" : this.getHours(), // 小时
		"m+" : this.getMinutes(), // 分
		"s+" : this.getSeconds(), // 秒
		"q+" : Math.floor((this.getMonth() + 3) / 3), // 季度
		"S" : this.getMilliseconds()
	// 毫秒
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	for ( var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
					: (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}
/*******************************************************************************
 * 日期时间工具类 * 注：调用方式，DeteUtil.方法名 *
 ******************************************************************************/
var DateUtil = {
	/*
	 * 方法作用：【取传入日期是星期几】 使用方法：DateUtil.nowFewWeeks(new Date()); @param date{date}
	 * 传入日期类型 @returns {星期四，...}
	 */
	nowFewWeeks : function(date) {
		if (date instanceof Date) {
			var dayNames = new Array("星期天", "星期一", "星期二", "星期三", "星期四", "星期五",
					"星期六");
			return dayNames[date.getDay()];
		} else {
			return "Param error,date type!";
		}
	},
	/*
	 * 方法作用：【字符串转换成日期】 使用方法：DateUtil.strTurnDate("2010-01-01"); @param str
	 * {String}字符串格式的日期，传入格式：yyyy-mm-dd(2015-01-31) @return {Date}由字符串转换成的日期
	 */
	stringToDate : function(dateString) {
		if (dateString) {
			var arr1 = dateString.split(" ");
			var sdate = arr1[0].split('-');
			var date = new Date(sdate[0], sdate[1] - 1, sdate[2]);
			return date;
		}
		return '';
	},
	/*
	 * 方法作用：【计算2个日期之间的天数】 传入格式：yyyy-mm-dd(2015-01-31)
	 * 使用方法：DateUtil.dayMinus(startDate,endDate); @startDate {Date}起始日期 @endDate
	 * {Date}结束日期 @return endDate - startDate的天数差
	 */
	dayMinus : function(startDate, endDate) {
		if (startDate instanceof Date && endDate instanceof Date) {
			var days = Math
					.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
			return days;
		} else {
			return "Param error,date type!";
		}
	}
};

/*******************************************************************************
 * 加载工具类 * 注：调用方式，loadUtil.方法名 *
 ******************************************************************************/
var LoadUtil = {
	/*
	 * 方法说明：【动态加载js文件css文件】
	 * 使用方法：LoadUtil.loadjscssfile("http://libs.baidu.com/jquery/1.9.1/jquery.js","js")
	 * @param fileurl 文件路径， @param filetype 文件类型，支持传入类型，js、css
	 */
	loadjscssfile : function(fileurl, filetype) {
		if (filetype == "js") {
			var fileref = document.createElement('script');
			fileref.setAttribute("type", "text/javascript");
			fileref.setAttribute("src", fileurl);
		} else if (filetype == "css") {

			var fileref = document.createElement('link');
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", fileurl);
		}
		if (typeof fileref != "undefined") {
			document.getElementsByTagName("head")[0].appendChild(fileref);
		} else {
			alert("loadjscssfile method error!");
		}
	}
};

/*******************************************************************************
 * 字符串操作工具类 * 注：调用方式，StrUtil.方法名 *
 ******************************************************************************/
var StrUtil = {
	/*
	 * 判断字符串是否为空 @param str 传入的字符串 @returns {}
	 */
	isEmpty : function(str) {
		if (str != null && str.length > 0) {
			return true;
		} else {
			return false;
		}
	},
	/*
	 * 判断两个字符串子否相同 @param str1 @param str2 @returns {Boolean}
	 */
	isEquals : function(str1, str2) {
		if (str1 == str2) {
			return true;
		} else {
			return false;
		}
	},
	/*
	 * 忽略大小写判断字符串是否相同 @param str1 @param str2 @returns {Boolean}
	 */
	isEqualsIgnorecase : function(str1, str2) {
		if (str1.toUpperCase() == str2.toUpperCase()) {
			return true;
		} else {
			return false;
		}
	},
	/**
	 * 判断是否是数字
	 * 
	 * @param value
	 * @returns {Boolean}
	 */
	isNum : function(value) {
		if (value != null && value.length > 0 && isNaN(value) == false) {
			return true;
		} else {
			return false;
		}
	},
	/**
	 * 判断是否是中文
	 * 
	 * @param str
	 * @returns {Boolean}
	 */
	isChine : function(str) {
		var reg = /^([u4E00-u9FA5]|[uFE30-uFFA0])*$/;
		if (reg.test(str)) {
			return false;
		}
		return true;
	}
};

/**
 * 随机数UUID:全局唯一标识符（GUID，Globally Unique Identifier）也称作 UUID(Universally Unique
 * IDentifier)
 */
function uuid() {
	var S4 = function() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
	// return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() +
	// S4() + S4());
	return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
}