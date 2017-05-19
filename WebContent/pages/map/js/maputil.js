var initCenterMarker; // 初始的中心点Marker
var map;// 地图
var owner = 'guest'; // 登录用户名
var centerImage = 'center.png'; // 中心点图标
var markerMap = new Map(); // 单用户marker信息map
var ipcMarkerMap = new Map(); // IPC marker信息map
var historyTrackMap = new Map(); // 用户轨迹信息
var dateMap = new Map();// 定位用户上报位置时间信息

// 圈选
var ClickCount; // 圈选点击次数
var beginlatlng; // 圈选点击开始坐标
var endlatlng; // 圈选点击结束坐标
var isCircleMap = false;
var overlayProjection;

String.prototype.trim = function() {
	return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

//记录操作日志
function log(log){
	$.ajax({
		type : "post",
		url : "/lbs/r/lbs/log",
		data : {"log" : log},
		dataType : 'json'
	});
}

function createXinWeiMap() {
	log('Begin create Map...');
	// 用来计算文字宽度
	var xwFontSpan = document.createElement("span");
	xwFontSpan.id = "xwFontSpan";
	document.body.appendChild(xwFontSpan);

	var centerLatLog = new google.maps.LatLng(initCenterLatitude,
			initCenterLongitude);
	var initMapTypeControlOptions = {
		position : google.maps.ControlPosition.BOTTOM_RIGHT,
		mapTypeIds : [ 'mySatellite', 'myRoadmap' ]
	};
	var initMapTypeControl = false;
	switch (mapType) {
	case 1:// 加入自定义roadmap地图类型
		initMapTypeControlOptions = {
			position : google.maps.ControlPosition.BOTTOM_RIGHT,
			mapTypeIds : [ 'myRoadmap' ]
		};
		initMapTypeControl = false;
		break;
	case 2:// 加入自定义卫星地图类型
		initMapTypeControlOptions = {
			position : google.maps.ControlPosition.BOTTOM_RIGHT,
			mapTypeIds : [ 'mySatellite' ]
		};
		initMapTypeControl = false;
		break;
	case 3:
		initMapTypeControlOptions = {
			position : google.maps.ControlPosition.BOTTOM_RIGHT,
			mapTypeIds : [ 'mySatellite', 'myRoadmap' ]
		};
		initMapTypeControl = true;
		break;
	default:
		break;
	}

	var mapOptions = {
		streetViewControl : false,
		scaleControl : true, // 比例尺控件
		mapTypeControl : initMapTypeControl,
		mapTypeControlOptions : initMapTypeControlOptions
	};
	// 创建地图
	this.map = new google.maps.Map(document.getElementById('map_canvas'),
			mapOptions);

	// 初始化map
	this.map.setZoom(initZoom);// 设置zoom
	this.map.setCenter(centerLatLog);// 设置center

	initCenterMarker = new google.maps.Marker({
		position : centerLatLog,
		map : this.map,
		icon : centerImage
	});

	// 屏蔽谷歌地图原有数据
	this.map.mapTypes.set(google.maps.MapTypeId.ROADMAP, null);
	this.map.mapTypes.set(google.maps.MapTypeId.SATELLITE, null);

	switch (mapType) {
	case 1:// 街道
		var roadMapType = new XinWeilMapType("roadmap", ".png",
				"images\\green.png");
		roadMapType.setMaxZoom(maxZoom);// 地图显示最大级别
		roadMapType.setMinZoom(minZoom);// 地图显示最小级别
		roadMapType.setName(roadMapName);
		map.mapTypes.set('myRoadmap', roadMapType); // 绑定本地普通地图类型
		map.setMapTypeId('myRoadmap'); // 指定显示本地普通地图
		break;
	case 2:// 卫星
		var satelliteType = new XinWeilMapType("satellite", ".jpg",
				"images\\green.png");
		satelliteType.setMaxZoom(maxZoom);// 地图显示最大级别
		satelliteType.setMinZoom(minZoom);// 地图显示最小级别
		satelliteType.setName(satelliteName);
		map.mapTypes.set('mySatellite', satelliteType); // 绑定本地地图类型
		map.setMapTypeId('mySatellite'); // 指定显示本地地图
		map.overlayMapTypes.insertAt(0, new XinWeilOverlayMapType("overlay",
				".png"));
		break;
	case 3:
		// 街道与卫星
		var roadMapType = new XinWeilMapType("roadmap", ".png",
				"images\\green.png");
		roadMapType.setMaxZoom(maxZoom);// 地图显示最大级别
		roadMapType.setMinZoom(minZoom);// 地图显示最小级别
		roadMapType.setName(roadMapName);
		map.mapTypes.set('myRoadmap', roadMapType); // 绑定本地普通地图类型
		map.setMapTypeId('myRoadmap'); // 指定显示本地普通地图

		// 加入自定义卫星地图类型
		var satelliteType = new XinWeilMapType("satellite", ".jpg",
				"images\\green.png");
		satelliteType.setMaxZoom(maxZoom);// 地图显示最大级别
		satelliteType.setMinZoom(minZoom);// 地图显示最小级别
		satelliteType.setName(satelliteName);
		map.mapTypes.set('mySatellite', satelliteType); // 绑定本地地图类型
		map.setMapTypeId('mySatellite'); // 指定显示本地地图
		map.overlayMapTypes.insertAt(0, new XinWeilOverlayMapType("overlay",
				".png"));

		// MapTypeId类型发现变化时发生
		google.maps.event.addListener(map, 'maptypeid_changed', function() {
			if (map.getMapTypeId() == 'mySatellite') { // 插入卫星本地地图地名
				map.overlayMapTypes.insertAt(0, new XinWeilOverlayMapType(
						"overlay", ".png"));
			} else {
				map.overlayMapTypes.clear();
			}
		});
		break;
	default:
		break;
	}
	map.enableKeyDragZoom({
		key : "shift",
		boxStyle : {
			border : "2px dashed black",
			backgroundColor : "red",
			opacity : 0.3
		},
		veilStyle : {
			backgroundColor : "gray",
			opacity : 0.2
		}
		//,是否显示虚拟的控件图标
		//visualEnabled : true 
	});
	google.maps.event.addListener(map.getDragZoomObject(), 'dragend', function(
			bnds) {
		endCircleSelect(bnds);
	});
	google.maps.event.addListener(map, 'click', circleMapListener);
	setInterval("dateCheck()", 5000);// 检查超时未上报的定位用户

	// 获取请求参数，登录用户名
	var requestOwner = GetQueryString("owner");
	if (null != requestOwner)
		owner = requestOwner;

	// 添加自定义工具菜单:测距、标记
	var myControlDiv = document.createElement('DIV');
	var measureControl = new MyControl(myControlDiv, map);
	myControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(myControlDiv);
	log('Map was created successfully.');
	// 加载用户自定义标记
	setTimeout(drawCustomMarkers, 500);
}
// 检查超时未上报的定位用户
function dateCheck() {
	var keySet = dateMap.keySet();
	var currentDate = new Date();
	for (var i = 0; i < keySet.length; i++) {
		var udn = keySet[i];
		var lastDate = dateMap.get(udn);
		if (lastDate == undefined || lastDate == null) {
			continue;
		}
		// 3分钟未上报新的位置，调度台GIS座标显示红色附上最后的上报时间
		if (currentDate.getTime() - lastDate.getTime() > (180 * 1000)) {
			var marker = markerMap.get(udn);
			var lastTime = date2str(lastDate, "hh:mm");
			marker.set("labelContent", udn + "(" + lastTime + ")");
			marker.set("icon", "images/track1.png");
		}
	}
}

// 自定义菜单：测距、标记
function MyControl(controlDiv, map) {
	controlDiv.style.padding = '8px';
	// 测距
	var measureControlUI = document.createElement('span');
	measureControlUI.style.backgroundColor = 'white';
	measureControlUI.style.float = 'left';
	measureControlUI.style.borderStyle = 'solid';
	measureControlUI.style.borderWidth = '1px';
	measureControlUI.style.cursor = 'pointer';
	measureControlUI.style.textAlign = 'center';
	measureControlUI.style.fontSize = '12px';
	measureControlUI.style.padding = '2px';
	measureControlUI.innerHTML = '<img style="vertical-align:middle;padding-left:2px;padding-right:2px;" src="measure.png" /><span style="padding-right:2px;">测距</span>';
	measureControlUI.title = '点击开始测距，单击鼠标右键结束测距';
	controlDiv.appendChild(measureControlUI);
	// 标记
	var markerControlUI = document.createElement('span');
	markerControlUI.style.backgroundColor = 'white';
	markerControlUI.style.float = 'left';
	markerControlUI.style.marginLeft = '4px';
	markerControlUI.style.borderStyle = 'solid';
	markerControlUI.style.borderWidth = '1px';
	markerControlUI.style.cursor = 'pointer';
	markerControlUI.style.textAlign = 'center';
	markerControlUI.style.fontSize = '12px';
	markerControlUI.style.padding = '2px';
	markerControlUI.innerHTML = '<img style="vertical-align:middle;padding-left:2px;padding-right:2px;" src="marker.png" /><span style="padding-right:2px;">标记</span>';
	markerControlUI.title = '点击开始添加标记';
	controlDiv.appendChild(markerControlUI);

	// 为自定义菜单添加事件监听
	google.maps.event.addDomListener(measureControlUI, 'click', function() {
		map.draggableCursor = 'help';
		measureIndex++;
		measureMarkerArray = new Array();

		var polyOptions = {
			strokeColor : 'blue',
			strokeOpacity : 1.0,
			strokeWeight : 1
		}
		poly = new google.maps.Polyline(polyOptions);
		poly.setMap(map);

		google.maps.event.addListener(map, 'click', addLatLng);
		google.maps.event.addListener(map, 'mousemove', delLatLng);
		// 必须给poly(线)添加点击事件，否则无法画第二个点(原因：线在地图的上一层，在线上的事件无法传到地图)
		google.maps.event.addListener(poly, 'click', addLatLng);
		google.maps.event.addListener(poly, 'rightclick', completeMeasure);
		google.maps.event.addListener(map, 'rightclick', completeMeasure);
	});
	google.maps.event.addDomListener(markerControlUI, 'click', function() {
		map.draggableCursor = 'help';
		google.maps.event.addListener(map, 'click', addInterestPoint);
		google.maps.event.addListener(map, 'rightclick', function() {
			map.draggableCursor = '';
			google.maps.event.clearListeners(map, "click");
		});
	});
}

/**
 * 格式化输出时间，x:待显示的时间，例new Date(); y:要格式化的格式，例：yyyy-MM-dd hh:mm:ss
 */
function date2str(x, y) {
	var z = {
		y : x.getFullYear(),
		M : x.getMonth() + 1,
		d : x.getDate(),
		h : x.getHours(),
		m : x.getMinutes(),
		s : x.getSeconds()
	};
	return y.replace(/(y+|M+|d+|h+|m+|s+)/g, function(v) {
		return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1)))
				.slice(-(v.length > 2 ? v.length : 2))
	});
}
/**
 * 设置用户定位中心
 */
function setUserCenterImpl(udn) {
	var marker = markerMap.get(udn);
	if (marker == undefined || null == marker) {
		var historyTrack = historyTrackMap.get(udn);
		if (historyTrack != undefined && historyTrack != null) {
			marker = historyTrack.marker;
		}
	}
	if (undefined != marker && null != marker) {
		var obj = marker.getPosition();
		map.setCenter(obj);
	}
}

/**
 * 绘制SWT的marker 实时定位
 */
function addMarker(udn, uname, longitude, latitude, draggable, title) {
	var gpsPoint = GPS.transform2Mars(latitude, longitude);
	// alert(longitude+","+gpsPoint.lon+","+latitude+","+gpsPoint.lat);
	latitude = gpsPoint.lat;
	longitude = gpsPoint.lon;

	var $position = new google.maps.LatLng(latitude, longitude);
	var marker = markerMap.get(udn);
	if (marker == undefined || marker == null) {
		// 获得电话号码宽度
		var xwFontSpan = document.getElementById("xwFontSpan");
		var len = getStringLength(uname, xwFontSpan);
		marker = createMarker({
			icon : "images/marker.png",
			labelAnchor : new google.maps.Point(len / 2 + 6, 52),
			labelContent : uname
		});
		google.maps.event.addListener(marker, "click", function(e) {
			openUserActionDialog(udn);
		});
		// 保存用户定位信息
		markerMap.put(udn, marker);
	}
	// 重新设置一下icon与显示信息，超时未上报位置icon与显示都会变红
	marker.set("labelContent", uname);
	marker.set("icon", "images/marker.png");
	marker.setPosition($position);
	// 添加至缓存，定时检查此map的上报信息
	dateMap.put(udn, new Date());
	log('绘制用户标记成功, udn-->' + udn);
	return marker;
}

// 添加IPC监控marker
function addIPCMarker(udn, longitude, latitude, title) {
	var position = new google.maps.LatLng(latitude, longitude);
	var marker = new MarkerWithLabel({
		position : position,
		draggable : false, // 不可移动
		icon : "marker-ipc.png",
		map : map,
		labelContent : title,
		labelAnchor : new google.maps.Point(22, 0),
		labelClass : "measure_labels"
	});
	google.maps.event.addListener(marker, "click", function(e) {
		openUserActionDialog(udn);
	});
	ipcMarkerMap.put(udn, marker);
	map.setCenter(position);// 设置center
	log('绘制IPC标记成功, udn-->' + udn);
}
// 删除标记
function removeMarker(udn) {
	var marker = markerMap.get(udn);
	if (marker != undefined && marker != null) {
		marker.setMap(null);
		markerMap.remove(udn);
	}
	removeMarkerIPC(udn);
	// 从定时检查缓存中删除
	dateMap.remove(udn);
}
// 删除IPC定位标记
function removeMarkerIPC(udn) {
	var marker = ipcMarkerMap.get(udn);
	if (marker != undefined && marker != null) {
		marker.setMap(null);
		ipcMarkerMap.remove(udn);
	}
}
// 新增轨迹
function addTrackLine(objArray) {
	if (objArray == null || objArray.length < 1)
		return;
	if (map == undefined)
		return;

	var first = objArray[0][1];
	var $udn = first.udn;
	var $uname = first.uname;

	var historyTrack = historyTrackMap.get($udn);
	if (historyTrack == undefined || historyTrack == null) {
		historyTrack = new Object();
		historyTrackMap.put($udn, historyTrack);
	}

	var lineCoordinates = historyTrack.lineCoordinates;
	if (lineCoordinates == undefined || lineCoordinates == null) {
		historyTrack.lineCoordinates = new Map();
	}

	for (var i = 0; i < objArray.length; i++) {
		var obj = objArray[i][1];
		var gpsPoint = GPS.transform2Mars(parseFloat(obj.latitue),
				parseFloat(obj.longitude));
		var latitue = gpsPoint.lat;
		var longitude = gpsPoint.lon;
		historyTrack.lineCoordinates.put(obj.time, new google.maps.LatLng(
				latitue, longitude));
	}

	// 按照时间排序
	historyTrack.lineCoordinates.ascCompare();

	// 创建marker
	var marker = historyTrack.marker;
	if (marker == undefined || marker == null) {
		var xwFontSpan = document.getElementById("xwFontSpan");

		var len = getStringLength($uname, xwFontSpan);

		historyTrack.marker = createMarker({
			icon : "images/track.png",
			labelAnchor : new google.maps.Point(-15, 35),
			labelContent : $uname
		});
		var firstPosition = historyTrack.lineCoordinates.getIndexValue(0);
		historyTrack.marker.setPosition(firstPosition);
		map.setCenter(firstPosition);
		google.maps.event.addListener(historyTrack.marker, "click",
				function(e) {
					openUserHistoryActionDialog($udn);
				});
	}

	setTimeout(function() {
		createPolyline(map, historyTrack, $udn);
	}, 100);

	historyTrack.index = 0;
	historyTrack.interval = 1000;
}

function createPolyline(map, historyTrack, udn) {
	var lineSymbol = historyTrack.lineSymbol;
	if (lineSymbol == undefined || lineSymbol == null) {
		var color = getColor();
		historyTrack.lineSymbol = {
			// path : 'M 0,-1,0,1',
			path : google.maps.SymbolPath.FORWARD_OPEN_ARROW,
			// path : google.maps.SymbolPath.CIRCLE,
			scale : 1.2,
			strokeOpacity : 1,
			strokeWeight : 1,
			strokeColor : color,
			polylineColor : color
		};
	}
	// 清空之前的轨迹
	var polylines = historyTrack.polylines;
	if (polylines != undefined && polylines != null) {
		for (var i = 0; i < polylines.length; i++) {
			polylines[i].setMap(null);
		}
	}
	historyTrack.polylines = [];
	// 分析轨迹：超过5分钟或5000米的分为一段。
	var polylinePoint = [];
	var polylinesPoint = [];
	var lastLatLng;
	var lastTime = 0;
	var pointSize = historyTrack.lineCoordinates.size();

	for (var i = 0; i < pointSize; i++) {
		var entry = historyTrack.lineCoordinates.getIndex(i);
		var latLng = entry.value;
		var date = getDate(entry.key);
		if (lastLatLng == null) {
			polylinePoint.push(latLng);
			polylinesPoint.push(polylinePoint);
		} else {
			var tr = distance(lastLatLng.lat(), lastLatLng.lng(), latLng.lat(),
					latLng.lng())
			if (date.getTime() - lastTime > history_time_max * 1000
					|| tr > history_distance_max) {
				// 新起一个 轨迹
				polylinePoint = [];
				polylinePoint.push(latLng);
				polylinesPoint.push(polylinePoint);
			} else {
				polylinePoint.push(latLng);
			}
		}
		lastLatLng = latLng;
		lastTime = date.getTime();
	}

	for (var i = 0; i < polylinesPoint.length; i++) {
		var polyline = new google.maps.Polyline({
			path : polylinesPoint[i],
			strokeColor : historyTrack.lineSymbol.polylineColor,
			strokeOpacity : 1.0,
			strokeWeight : 2,
			icons : [ {
				icon : historyTrack.lineSymbol,
				offset : '0',
				repeat : '20px'
			} ],
			map : map
		});
		google.maps.event.addListener(polyline, "click", function(e) {
			openUserHistoryActionDialog(udn);
		});

		historyTrack.polylines.push(polyline);
	}
	return historyTrack.polylines;
}
// 轨迹回放
function drawGpsPathsHistory(udn, time, progress) {
	var historyTrack = historyTrackMap.get(udn);
	if (historyTrack == undefined || historyTrack == null) {
		return;
	}
	var lineCoordinates = historyTrack.lineCoordinates;
	window.clearInterval(historyTrack.timer);
	var flag = false;
	if (time == 0 && progress == -1) {// 暂停
		flag = false;
	} else if (time == -1 && progress == -1) {// 继续
		flag = true;
	} else {// 调整速度或调整进度
		flag = true;
		if (time != -1) {// 调整速度
			historyTrack.interval = time;
		}
		if (progress != -1) {// 调整进度
			historyTrack.index = parseInt((lineCoordinates.size() * progress) / 100);
		}
	}

	if (flag && historyTrack.index < lineCoordinates.size()) {
		createHistoryTrackTimer(historyTrack);
	}

}
// 创建定时器刷新坐标位置
function createHistoryTrackTimer(historyTrack) {
	historyTrack.timer = window.setInterval(function() {
		if (historyTrack.index < historyTrack.lineCoordinates.size()) {
			var position = historyTrack.lineCoordinates
					.getIndexValue(historyTrack.index);
			historyTrack.marker.setPosition(position);
			// map.setCenter(position);
			historyTrack.index++;
		} else {
			window.clearInterval(historyTrack.timer);
		}
	}, historyTrack.interval);// end timer
}

// 返回某一用户快慢情况及进度
function returnTrackInfo(udn) {
	var historyTrack = historyTrackMap.get(udn);

	if (historyTrack != undefined && historyTrack != null) {
		setTrackInfo(udn, historyTrack.interval, (historyTrack.index * 100)
				/ historyTrack.lineCoordinates.size());
	}
}

// 删除所有轨迹
function clearAllTrackLine() {
	var keySet = historyTrackMap.keySet();
	for (var i = 0; i < keySet.length; i++) {
		var udn = keySet[i];
		clearTrackLine(udn);
	}

}
// 删除某一用户轨迹
function clearTrackLine(udn) {
	var historyTrack = historyTrackMap.get(udn);

	if (historyTrack != undefined) {
		if (historyTrack.marker != undefined) {
			historyTrack.marker.setMap(null);
		}
		if (historyTrack.polylines != undefined) {
			var polylines = historyTrack.polylines;
			for (var i = 0; i < polylines.length; i++) {
				polylines[i].setMap(null);
			}
		}
		if (historyTrack.timer != undefined) {
			window.clearInterval(historyTrack.timer);
		}
	}
	historyTrackMap.remove(udn);
}

function startCircleSelect() {
	map.getDragZoomObject().gdcDrag();
}

function endCircleSelect(bnds) {
	// 东北坐标
	var beginlatlng = bnds.getNorthEast();
	// 西南坐标
	var endlatlng = bnds.getSouthWest();
	handleCircleSelect(beginlatlng, endlatlng);
}
function initCircleSelect() {
	isCircleMap = true;
	ClickCount = 0; // 点击次数
}
function circleMapListener(e) {
	if (!isCircleMap) {
		return;
	}
	if (ClickCount == 0) {
		beginlatlng = e.latLng;
		ClickCount++;
	} else {
		endlatlng = e.latLng;
		ClickCount = 0
		isCircleMap = false;
		handleCircleSelect(beginlatlng, endlatlng);
	}
}
function handleCircleSelect(beginlatlng, endlatlng) {
	if (overlayProjection == null) {
		var overlay = new MyOverlay();
		overlay.setMap(map);
		overlayProjection = overlay.getProjection();
	}
	// 将地理坐标转换成屏幕坐标
	var beginPosition = overlayProjection
			.fromLatLngToContainerPixel(beginlatlng);
	var endPosition = overlayProjection.fromLatLngToContainerPixel(endlatlng);
	var begin1X;
	var begin1Y;
	var end1X;
	var end1Y;

	if (beginPosition.x < endPosition.x) {
		begin1X = beginPosition.x;
		end1X = endPosition.x;
	} else {
		begin1X = endPosition.x;
		end1X = beginPosition.x;
	}
	if (beginPosition.y < endPosition.y) {
		begin1Y = beginPosition.y;
		end1Y = endPosition.y;
	} else {
		begin1Y = endPosition.y;
		end1Y = beginPosition.y;
	}

	// 遍历圈选区域内的用户
	var circleUserArray = []; // 圈选用户udn;
	var keyset = markerMap.keySet();
	for (var j = 0; j < keyset.length; j++) {
		var tudn = keyset[j];
		var locationMarker = markerMap.get(keyset[j]);

		if (isCircleContainUser(locationMarker, begin1X, begin1Y, end1X, end1Y)) {
			circleUserArray.push(tudn);
		}
	}

	// 查找历史轨迹中的用户
	keyset = historyTrackMap.keySet();
	for (var j = 0; j < keyset.length; j++) {
		var tudn = keyset[j];
		if (arrayContains(circleUserArray, tudn)) {
			continue;
		}

		var historyTrack = historyTrackMap.get(tudn);
		if (historyTrack == undefined || historyTrack == null) {
			continue;
		}
		var historyMarker = historyTrack.marker;

		if (isCircleContainUser(historyMarker, begin1X, begin1Y, end1X, end1Y)) {
			circleUserArray.push(tudn);
		}
	}
	usersActionDialog(circleUserArray);
}

function isCircleContainUser(marker, begin1X, begin1Y, end1X, end1Y) {
	// 将地理坐标转换成屏幕坐标
	var xposition = overlayProjection.fromLatLngToContainerPixel(marker
			.getPosition());
	var begin2X = xposition.x;
	var begin2Y = xposition.y;
	var end2X = xposition.x;
	var end2Y = xposition.y;
	if (isInArea2(begin1X, begin1Y, end1X, end1Y, begin2X, begin2Y, end2X,
			end2Y)) {
		return true;
	}
}

function createMarker(arg) {
	var marker = new MarkerWithLabel({
		draggable : false,
		map : map,
		icon : {
			url : arg.icon,
			size : new google.maps.Size(20, 34)
		},
		labelContent : arg.labelContent,
		labelAnchor : arg.labelAnchor,
		labelClass : "xwMarkerLabel", // the CSS class for the label
		labelStyle : {
			opacity : 0.75
		}
	});
	return marker;
}

function isInArea2(minRect1X, minRect1Y, maxRect1X, maxRect1Y, minRect2X,
		minRect2Y, maxRect2X, maxRect2Y) {
	var minx = Math.max(minRect1X, minRect2X);
	var miny = Math.max(minRect1Y, minRect2Y);
	var maxx = Math.min(maxRect1X, maxRect2X);
	var maxy = Math.min(maxRect1Y, maxRect2Y);
	return !(minx > maxx || miny > maxy);
}

var hexa = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f' ];
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

function arrayContains(ary, a) {
	for (var j = 0; j < ary.length; j++) {
		if (ary[j] == a) {
			return true;
		}
	}
	return false;
}
// 采用正则表达式获取地址栏参数
function GetQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
		return unescape(r[2]);
	return null;
}