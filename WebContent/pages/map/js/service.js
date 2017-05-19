function setMapCenter() {
	if (this.map != null) {
		this.map.setCenter(new google.maps.LatLng(initCenterLatitude, initCenterLongitude));// 设置center
	}
}

function initMapCenter(arg) {
	var obj = JSON.parse(subArg(arg));
	initCenterLatitude = obj.latitude;
	initCenterLongitude = obj.longitude;
	if (this.map != null) {
		this.map.setCenter(new google.maps.LatLng(initCenterLatitude, initCenterLongitude));// 设置center
	}
}
function initMapZoom(arg) {
	var obj = JSON.parse(subArg(arg));
	maxZoom = obj.maxZoom;
	minZoom = obj.minZoom;
	initZoom = obj.initZoom;

	if (this.map != null) {
		this.map.setZoom(initZoom);// 设置zoom
	}
}
function setMapSize(arg) {
	var obj = JSON.parse(subArg(arg));
	document.getElementById('map_canvas').style.width = obj.width + 'px';
	document.getElementById('map_canvas').style.height = obj.height + "px";
}

/**
 * 单个用户定位
 */
function singalUserLocate(arg) {	
	log('收到单个用户定位singalUserLocate, arg-->' + arg);

	var obj = JSON.parse(subArg(arg));
	// 用户电话号码
	var udn = obj.udn;
	// 用户名
	var uname = obj.uname;
	// 精度
	var longitude = obj.longitude;
	// 纬度
	var latitude = obj.latitue;
	// 鼠标放上去显示的title信息
	var title = 'uname=' + uname + '\nudn=' + udn + '\nlatitude=' + latitude + ',longitude=' + longitude + '\nsrc=' + obj.src + "\n" + 'time=' + obj.time;
	//区分是监控还是终端
	var nodeType = obj.nodeType;
	if("monitor" == nodeType)
	{
		title = uname;
		if(title == undefined || title == "")
		{
			title = udn;
		}
		addIPCMarker(udn, longitude, latitude, title);
	}else
	{
		addMarker(udn, uname, longitude, latitude, false, title);		
	}
}

// 取消定位
function unsubscribeLocation(arg) {
	log('取消定位unsubscribeLocation, arg-->' + arg);
	var obj = JSON.parse(subArg(arg));
	// 用户电话号码
	var udn = obj.udn;
	removeMarker(udn);
}

/**
 * 实时定位用户中心点
 */
function setUserCenter(arg) {
	log('实时定位用户中心点setUserCenter, arg-->' + arg);
	var obj = JSON.parse(subArg(arg));
	// 用户电话号码
	var udn = obj.udn;
	setUserCenterImpl(udn);
}

/**
 * 增加轨迹信息
 */
function drawGpsPaths(arg) {
	log('增加轨迹信息drawGpsPaths, arg-->' + arg);
	var objArray = JSON.parse(subArg(arg));
	addTrackLine(objArray);
}

/**
 * 增加轨迹信息
 */
function drawGpsPathsHistoryService(arg) {
	log('增加轨迹信息drawGpsPathsHistoryService, arg-->' + arg);
	var objArray = JSON.parse(subArg(arg));
	if (objArray.udn == undefined || objArray.time == undefined || objArray.progress == undefined) {

	} else {
		var udn = objArray.udn;
		var time = objArray.time;
		var progress = objArray.progress;
		// alert("udn"+udn+"time"+time+"progress"+progress);
		drawGpsPathsHistory(udn, time, progress);
	}
}

function getTrackInfo(arg) {
	log('获取轨迹信息getTrackInfo, arg-->' + arg);
	var obj = JSON.parse(subArg(arg));
	// 用户电话号码
	var udn = obj.udn;
	returnTrackInfo(udn);
}

/**
 * 清除所有轨迹信息
 */
function clearAllGpsPath() {
	log('清除所有轨迹信息');
	clearAllTrackLine();
}

function clearGpsPath(arg) {
	log('clearGpsPath, arg-->' + arg);
	var obj = JSON.parse(subArg(arg));
	// 用户电话号码
	var udn = obj.udn;
	clearTrackLine(udn);
}

/**
 * 打开用户功能界面
 */
function userActionDialog(udn) {
	log('打开用户功能界面userActionDialog, udn-->' + udn);
	openUserActionDialog(udn);
}

/**
 * 本地测试 圈选用户功能列表展示
 */
function usersActionDialog(udnarray) {
	var udnList = JSON.stringify(udnarray);
	openUsersActionDialog(udnList);
}

function circleSelect() {
	initCircleSelect();
}

function circleSelect2() {
	startCircleSelect();
}

function subArg(arg) {
	var result;
	result = arg.substr(0, 1);
	if (result == '"') {
		result = arg.substring(1, arg.length - 1);
	} else {
		result = arg;
	}
	return result;
}