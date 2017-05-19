/**
 * 公共通用全局JS
 */
/** 全局字体 */
var FontSize = {
	Normal : 12,
	L : 16,
	XL : 18,
	XXL : 20
};
/**
 * 字体颜色
 */
var FontColor = {
	UEMarker : "#033472",
	IPCMarker : "#005B74",
	NormalMarker : "#1841C1"
};
/** 地图偏好调置 */
var mapSettings = {
	useLocalResources : 0, // 1-从本地加载网页,0-服务端，本地加载网页js与服务端交互会有跨协议、跨域问题，需要特殊处理
	roadmapPath : "googlemaps/roadmap", // 街道图，地图资源路径
	satellitePath : "googlemaps/satellite", // 卫星图，地图资源路径
	mapType : 3,// 地图类型, 1-街道roadmap 2-卫星satellite 3-街道和卫星
	maxZoom : 7,// 地图缩放最大级别
	minZoom : 2,// 地图缩放最小级别
	// 地图缩放初始级别
	initZoom : 7
};
/** 本地加载网页时，此处配置LBS服务的IP与端口，例 http://localhost:8080 */
var lbsHost = "";
/** 登录用户名 */
var owner = 'guest';
/** 登录用户所属组织 */
var organization = 'szxw';

/**
 * 记录操作日志
 * 
 * @param log
 */
function log(log) {
	$
			.ajax({
				type : "post",
				url : (mapSettings.useLocalResources ? lbsHost : '')
						+ "/lbs/r/lbs/log",
				data : {
					"log" : log
				},
				dataType : mapSettings.useLocalResources ? 'jsonp' : 'json'
			});
}
/**
 * 采用正则表达式获取地址栏参数
 * 
 * @param name
 * @returns
 */
function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var param = window.location.search.substr(1).match(reg);
	if (param != null)
		return unescape(param[2]);
	return '';
}

/**
 * 获取请求参数
 */
function getRequestParam() {
	var requestOrganization = getQueryString("organization");
	if ('' != requestOrganization)
		organization = requestOrganization;
	var requestOwner = getQueryString("owner");
	if ('' != requestOwner)
		owner = requestOwner;
	var requestLbsHost = getQueryString("lbsHost");
	if ('' != requestLbsHost)
		lbsHost = requestLbsHost;
	var requestSettings = getQueryString("settings");
	if ('' != requestSettings)
		mapSettings = JSON.parse(requestSettings);
	log('获取的请求参数，organization:' + requestOrganization + ',owner:'
			+ requestOwner + ',lbsHost:' + requestLbsHost + ',Settings:'
			+ requestSettings);
}

/**
 * 创建地图前获取用户的偏好设置
 */
function preCreateGoogleMap() {
	getRequestParam();
	createGoogleMap();

	testData();
	testDrawTrajectory();

	// 测试代码
	addUEMarker('9', '114.971923828125', '37.39634613318923', 'Franco', false);
	addUEMarker('10', '109.072265625', '40.212440718286466', 'DengYong', false);
	addIPCMarker('11', '111.807861328125', '36.421282443649495', '摄像头11', false);
	addIPCMarker('12', '116.817626953125', '37.900865092570065', '摄像头22', false);
}

var hexa = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f' ];
/*******************************************************************************
 * 随机获取颜色
 * 
 */
function getColor() {
	while (true) {
		var r = Math.floor(Math.random() * 255);
		var g = Math.floor(Math.random() * 255);
		var b = Math.floor(Math.random() * 255);
		var color = r * 0.299 + g * 0.587 + b * 0.114;
		if (color < 192) {
			return '#' + hex(r) + hex(g) + hex(b);
		}
	}
}
function hex(i) {
	if (i < 0) {
		return '00';
	} else if (i > 255) {
		return 'ff';
	} else {
		return "" + hexa[Math.floor(i / 16)] + hexa[i % 16];
	}
}
/*******************************************************************************
 * 自定义Map集合对象
 */
function Map() {
	var struct = function(key, value) {
		this.key = key;
		this.value = value;
	}
	var put = function(key, value) {
		for (var i = 0; i < this.arr.length; i++) {
			if (this.arr[i].key === key) {
				this.arr[i].value = value;
				return;
			}
		}
		this.arr[this.arr.length] = new struct(key, value);
	}
	var put1 = function(key, value) {
		for (var i = 0; i < this.arr.length; i++) {
			if (this.arr[i].key === key) {
				return;
			}
		}
		this.arr[this.arr.length] = new struct(key, value);
	}
	var get = function(key) {
		for (var i = 0; i < this.arr.length; i++) {
			if (this.arr[i].key === key) {
				return this.arr[i].value;
			}
		}
		return null;
	}
	var getIndex = function(i) {
		if (i < this.arr.length) {
			return this.arr[i];
		}
		return null;
	}
	var getIndexValue = function(i) {
		if (i < this.arr.length) {
			return this.arr[i].value;
		}
		return null;
	}
	var getIndexKey = function(i) {
		if (i < this.arr.length) {
			return this.arr[i].key;
		}
		return null;
	}

	var keySet = function() {
		var keys = new Array();
		for (var i = 0; i < this.arr.length; i++) {
			keys[i] = this.arr[i].key;
		}
		return keys;
	}
	var values = function() {
		var valueList = new Array();
		for (var i = 0; i < this.arr.length; i++) {
			valueList[i] = this.arr[i].value;
		}
		return valueList;
	}
	var entrySet = function() {
		var entrys = new Array();
		for (var i = 0; i < this.arr.length; i++) {
			entrys[i] = this.arr[i];
		}
		return entrys;
	}
	var remove = function(key) {
		var v;
		for (var i = 0; i < this.arr.length; i++) {
			v = this.arr.pop();
			if (v.key === key) {
				continue;
			}
			this.arr.unshift(v);
		}
	}
	var size = function() {
		return this.arr.length;
	}

	var isEmpty = function() {
		return this.arr.length <= 0;
	}
	var ascCompare = function() {
		this.arr.sort(compareX("key", true));
	}
	var descCompare = function() {
		this.arr.sort(compareX("key", false));
	}
	this.arr = new Array();
	this.get = get;
	this.put = put;
	this.remove = remove;
	this.size = size;
	this.isEmpty = isEmpty;
	this.values = values;
	this.keySet = keySet;
	this.entrySet = entrySet;
	this.getIndex = getIndex;
	this.getIndexValue = getIndexValue;
	this.getIndexKey = getIndexKey;
	this.ascCompare = ascCompare;
	this.descCompare = descCompare;
}