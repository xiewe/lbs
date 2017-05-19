/** -------------------------------------全局变量，地图相关--------------------------------- */
/** 地图对象 */
var googlemap;
/** 地图初始默认中心点坐标，北京 */
var centerLatlng = new google.maps.LatLng(40.04023, 116.38366);
/** 中心点标记 */
var centerMarker;
/** -------------------------------------局部变量------------------------------------------ */
/** 圈选对象 */
var dragZoomObject;
/** 圈选类型,用来区分圈选结束后分发处理对应的事件 */
var dragZoomType;
/** 圈选操作类型，1-围栏，2-圈选; */
var DragZoomTypeEnum = {
	Fence : 1,
	CircleSelect : 2
};
/** 终端类型：1-手持机、2-监控摄像头、3-车载、4-单兵 */
var TerminalTypeEnum = {
	UE : 1,
	IPC : 2,
	AMT : 3,
	CPE : 4
};
/** 地图marker图标定义 */
var IconEnum = {
	CenterPoint : 'images/flags/red.gif',// 中心点图标
	Marker : 'images/track2.png',// 自定义标记图标
	UENormal : 'images/track-normal.png',// 终端图标
	UEChecked : 'images/track-checked.png',// 终端选中图标
	TrackStart : 'images/dd-start.png',// 轨迹开始图标
	TrackEnd : 'images/dd-end.png',// 轨迹结束图标
	IPCNormal : 'images/ipc-normal.png',// IPC监控图标
	IPCChecked : 'images/ipc-checked.png',// IPC监控选中图标
	URLError : 'images/green.png'// 地图路径错误图片
};
/** 终端用户marker信息map , key : udn ,value : google.maps.Marker */
var ueMarkers = new Map();
/** IPC监控摄像头 marker信息map ,key : udn ,value : google.maps.Marker */
var ipcMarkers = new Map();
/** 选中的UE终端数组 */
var checkedUEArray = new Array();
/** 选中的IPC监控数组 */
var checkedIPCArray = new Array();
/**
 * 缓存当前加载的围栏信息,key:Integer,value:Object
 * attributes(rectangle,infoWindow,fenceLabel): instanceof
 * google.maps.Rectangle,google.maps.InfoWindow,MapLabel
 */
var fenceMap = new Map();
/**
 * 缓存当前加载的轨迹信息,key:Integer,value:Object attributes(Polyline,Track marker
 * Array,MapLabel Array, InfoWindow Array): instanceof
 * google.maps.Polyline,google.maps.InfoWindow,MapLabel
 */
var trajectoryMap = new Map();
/** -------------------------------------CustomMapType--------------------------------------- */
/**
 * 自定义地图类型，必须实现 MapType 接口
 * 
 * @param imageFileDir地图文件路径
 * @param imageFileExtend图片文件扩展名
 *            e.g., png,jpg etc
 * @param errorImageUrl未能成功加载显示的图片
 */
function CustomMapType(imageFileDir, imageFileExtend, errorImageUrl) {
	this.imageFileDir = imageFileDir;
	this.imageFileExtend = imageFileExtend;
	this.errorImageUrl = errorImageUrl;
}
CustomMapType.prototype.tileSize = new google.maps.Size(256, 256);
CustomMapType.prototype.setMaxZoom = function(maxZoom) {
	this.maxZoom = maxZoom;
}
CustomMapType.prototype.setMinZoom = function(minZoom) {
	this.minZoom = minZoom;
}
CustomMapType.prototype.setName = function(name) {
	this.name = name;
}
CustomMapType.prototype.setAlt = function(alt) {
	this.alt = alt;
}
/**
 * 实现 MapType 接口getTile()方法, 每当 API 确定地图需要显示新的图块时调用此方法,API 会根据 MapType 的
 * tileSize、minZoom 和 maxZoom 属性以及地图的当前视区和缩放级别来决定是否需要调用
 * getTile()。在已传递坐标、缩放级别和要附加图块图像的 DOM 元素的情况下，此方法的处理程序应返回 HTML 元素。
 * 
 * @param coord
 * @param zoom
 * @param ownerDocument
 * @returns {HTML DOM}
 */
CustomMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
	var img = ownerDocument.createElement("img");
	img.style.width = this.tileSize.width + "px";
	img.style.height = this.tileSize.height + "px";
	// img.src =
	// "D:/mars/workspace/lbs/WebContent/pages/gis/googlemaps/roadmap/"
	// + zoom + "/" + coord.x + "/" + coord.y + this.imageFileExtend;
	img.src = this.imageFileDir + "/" + zoom + "/" + coord.x + "/" + coord.y
			+ this.imageFileExtend;
	var errorImage = this.errorImageUrl;
	img.onerror = function() {
		this.src = errorImage
	};
	return img;
}
/** -------------------------------------CustomMapType-END----------------------------------- */
/**
 * 创建地图
 */
function createGoogleMap() {
	// 卫星
	var satelliteType = new CustomMapType(mapSettings.satellitePath, ".jpg",
			IconEnum.URLError);
	satelliteType.setMaxZoom(mapSettings.maxZoom);// 地图显示最大级别
	satelliteType.setMinZoom(mapSettings.minZoom);// 地图显示最小级别
	satelliteType.setName("卫星");
	// 街道
	var roadmapType = new CustomMapType(mapSettings.roadmapPath, ".png",
			IconEnum.URLError);
	roadmapType.setMaxZoom(mapSettings.maxZoom);// 地图显示最大级别
	roadmapType.setMinZoom(mapSettings.minZoom);// 地图显示最小级别
	roadmapType.setName("街道");
	switch (mapSettings.mapType) {
	case 2:// 卫星
		var initMapTypeControlOptions = {
			mapTypeIds : [ 'mySatellite' ]
		};
		var mapOptions = {
			zoom : mapSettings.initZoom,// 地图初始级别
			center : centerLatlng,// 中心点
			streetViewControl : false, // 街景控件
			scaleControl : true, // 比例尺控件
			mapTypeControl : false,
			mapTypeControlOptions : initMapTypeControlOptions
		};
		// 创建地图
		googlemap = new google.maps.Map(document.getElementById('googlemap'),
				mapOptions);
		googlemap.mapTypes.set('mySatellite', satelliteType); // 绑定本地地图类型
		googlemap.setMapTypeId('mySatellite'); // 指定显示本地地图
		roadmapType = null;
		break;
	case 3:// 街道+卫星
		var initMapTypeControlOptions = {
			position : google.maps.ControlPosition.BOTTOM_RIGHT,
			mapTypeIds : [ 'mySatellite', 'myRoadmap' ]
		};
		var mapOptions = {
			zoom : mapSettings.initZoom,// 地图初始级别
			center : centerLatlng,// 中心点
			streetViewControl : false, // 街景控件
			scaleControl : true, // 比例尺控件
			mapTypeControl : true,
			mapTypeControlOptions : initMapTypeControlOptions
		};
		// 创建地图
		googlemap = new google.maps.Map(document.getElementById('googlemap'),
				mapOptions);
		googlemap.mapTypes.set('myRoadmap', roadmapType); // 绑定本地普通地图类型
		googlemap.mapTypes.set('mySatellite', satelliteType); // 绑定本地地图类型
		googlemap.setMapTypeId('myRoadmap'); // 指定街道地图
		break;
	default:
		// 街道
		var initMapTypeControlOptions = {
			mapTypeIds : [ 'myRoadmap' ]
		};
		var mapOptions = {
			zoom : mapSettings.initZoom,// 地图初始级别
			center : centerLatlng,// 中心点
			streetViewControl : false, // 街景控件
			scaleControl : true, // 比例尺控件
			mapTypeControl : false,
			mapTypeControlOptions : initMapTypeControlOptions
		};
		// 创建地图
		googlemap = new google.maps.Map(document.getElementById('googlemap'),
				mapOptions);
		googlemap.mapTypes.set('myRoadmap', roadmapType); // 绑定本地普通地图类型
		googlemap.setMapTypeId('myRoadmap'); // 指定显示本地普通地图
		satelliteType = null;
		break;
	}

	// 初始化中心点标记，插个小红旗
	centerMarker = new google.maps.Marker({
		position : centerLatlng,
		map : googlemap,
		icon : IconEnum.CenterPoint
	});

	// 初始自定义控件
	initCustomControl();

	// 加载用户自定义标记
	setTimeout(drawCustomMarkers, 200);
}

/**
 * 初始化自定义控件
 */
function initCustomControl() {
	// 创建自定义控件--测距
	var measureControlDiv = document.createElement('div');
	var innerHTML = '<img style="vertical-align:middle;padding-left:2px;padding-right:2px;" src="images/measure.png" /><span style="padding-right:2px;font-size: 14px;vertical-align:middle;">测距</span>';
	var measureControl = new CustomControl(measureControlDiv, innerHTML,
			"button_control", "点击开始测距，单击右键结束测距");
	// 添加测距事件监听
	google.maps.event.addDomListener(measureControl, 'click',
			function() {
				googlemap.setOptions({
					draggableCursor : 'help'
				});
				measureIndex++;
				measureMarkerArray = new Array();
				var polyOptions = {
					strokeColor : 'blue',
					strokeOpacity : 1.0,
					strokeWeight : 1
				}
				poly = new google.maps.Polyline(polyOptions);
				poly.setMap(googlemap);

				google.maps.event.addListener(googlemap, 'click', addLatLng);
				google.maps.event
						.addListener(googlemap, 'mousemove', delLatLng);
				// 必须给poly(线)添加点击事件，否则无法画第二个点(原因：线在地图的上一层，在线上的事件无法传到地图)
				google.maps.event.addListener(poly, 'click', addLatLng);
				google.maps.event.addListener(poly, 'rightclick',
						completeMeasure);
				google.maps.event.addListener(googlemap, 'rightclick',
						completeMeasure);
			});
	measureControlDiv.index = 1;
	googlemap.controls[google.maps.ControlPosition.RIGHT_TOP]
			.push(measureControlDiv);
	// 创建自定义控件--标记
	var markerControlDiv = document.createElement('div');
	innerHTML = '<img style="vertical-align:middle;padding-left:2px;padding-right:2px;" src="images/location-mini.png" /><span style="padding-right:2px;font-size: 14px;vertical-align:middle;">标记</span>'
	var markerControl = new CustomControl(markerControlDiv, innerHTML,
			"button_control", "点击开始添加标记");
	google.maps.event.addDomListener(markerControlDiv, 'click', function() {
		googlemap.setOptions({
			draggableCursor : 'help'
		});
		google.maps.event.addListener(googlemap, 'click', addInterestPoint);
		google.maps.event.addListener(googlemap, 'rightclick', function() {
			googlemap.setOptions({
				draggableCursor : null
			});
			google.maps.event.clearListeners(googlemap, "click");
		});
	});
	markerControlDiv.index = 2;
	googlemap.controls[google.maps.ControlPosition.RIGHT_TOP]
			.push(markerControlDiv);
	// 创建自定义控件--圈选
	var circleSelectControlDiv = document.createElement('div');
	innerHTML = '<img style="vertical-align:middle;padding-left:2px;padding-right:2px;" src="images/circle_select2.png" /><span style="padding-right:2px;font-size: 14px;vertical-align:middle;">圈选</span>'
	var circleSelectControl = new CustomControl(circleSelectControlDiv,
			innerHTML, "button_control", "点击，拖曳选择区域");
	// 圈选热键
	googlemap.enableKeyDragZoom({
		key : "shift",
		boxStyle : {
			border : "3px dashed black",
			backgroundColor : "red",
			opacity : 0.3
		},
		veilStyle : {
			backgroundColor : "gray",
			opacity : 0.2
		}
	});
	// 获得圈选对象
	dragZoomObject = googlemap.getDragZoomObject();
	// 添加事件--开始圈选
	google.maps.event.addDomListener(circleSelectControlDiv, 'click',
			function() {
				dragZoomDrag(DragZoomTypeEnum.CircleSelect);
			});
	// 圈选结束事件
	google.maps.event.addListener(dragZoomObject, 'dragend', function(bnds) {
		dragZoomDragend(bnds);
	});
	circleSelectControlDiv.index = 3;
	googlemap.controls[google.maps.ControlPosition.RIGHT_TOP]
			.push(circleSelectControlDiv);
	// 创建自定义控件--电子围栏
	var fenceControlDiv = document.createElement('div');
	innerHTML = '<img style="vertical-align:middle;padding-left:2px;padding-right:2px;" src="images/fence.png" /><span style="padding-right:2px;font-size: 14px;vertical-align:middle;">围栏</span>'
	var fenceControl = new CustomControl(fenceControlDiv, innerHTML,
			"button_control", "点击绘制");
	// 添加事件--开始圈选围栏
	google.maps.event.addDomListener(fenceControlDiv, 'click', function() {
		dragZoomDrag(DragZoomTypeEnum.Fence);
	});
	fenceControlDiv.index = 4;
	googlemap.controls[google.maps.ControlPosition.RIGHT_TOP]
			.push(fenceControlDiv);

	// 创建自定义控件--设置
	var settingsControlDiv = document.createElement('div');
	innerHTML = '<img style="vertical-align:middle;padding-left:2px;padding-right:2px;" src="images/settings.png" /><span style="padding-right:2px;font-size: 14px;vertical-align:middle;">设置</span>'
	var settingsControl = new CustomControl(settingsControlDiv, innerHTML,
			"button_control", "地图参数设置");
	google.maps.event.addDomListener(settingsControlDiv, 'click', function() {
		self.location = "settings.html?organization=" + organization
				+ "&owner=" + owner + "&lbsHost=" + lbsHost + "&settings="
				+ JSON.stringify(mapSettings);
	});
	settingsControlDiv.index = 5;
	googlemap.controls[google.maps.ControlPosition.RIGHT_TOP]
			.push(settingsControlDiv);

	// 创建自定义控件--定位中心点
	var locationControlDiv = document.createElement('div');
	innerHTML = '<img style="vertical-align:middle;padding-left:2px;padding-right:2px;" src="images/location-arrow.png" /><span style="padding-right:2px;"></span>'
	var locationControl = new CustomControl(locationControlDiv, innerHTML,
			"button_control", "定位至地图中心");
	google.maps.event.addDomListener(locationControlDiv, 'click', setCenter);// 若传参是方法名，则默认参为MouseEvent
	locationControlDiv.index = 6;
	googlemap.controls[google.maps.ControlPosition.RIGHT_TOP]
			.push(locationControlDiv);
}
/**
 * 根据终端类型显示可用的功能操作
 * 
 * @param terminalType终端类型：1-手持机、2-单兵、3-车载、4-监控摄像头
 */
function showUsableHandlers(terminalType) {
	// 若同时选中了终端与监控，不能混合操作，给出提示
	if (checkedIPCArray.length > 0 && checkedUEArray.length > 0) {
		googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();
		// 错误提示
		var errorTipsControlDiv = document.createElement('div');
		new CustomControl(errorTipsControlDiv, '不能同时选中监控与终端，无可用操作',
				"button_error", "");
		googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
				.push(errorTipsControlDiv);
		// 清空选中
		var uncheckAllControlDiv = document.createElement('div');
		new CustomControl(uncheckAllControlDiv, '清空选中', "button_action", "");
		googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
				.push(uncheckAllControlDiv);
		google.maps.event.addDomListener(uncheckAllControlDiv, 'click',
				function() {
					clearAllCheckedMarker();
				});
		return;
	}

	switch (terminalType) {
	case TerminalTypeEnum.UE:
		if (checkedUEArray.length == 0) {
			showIPCUsableHandlers();
		} else {
			if (checkedUEArray.length == 1) {
				showSingleUEUsableHandlers();
			} else {
				showMultipleUEUsableHandlers();
			}
		}
		break;
	case TerminalTypeEnum.IPC:
		if (checkedIPCArray.length == 0) {
			if (checkedUEArray.length > 1) {
				showMultipleUEUsableHandlers();
			}
			showSingleUEUsableHandlers();
			return;
		}
		showIPCUsableHandlers();
		break;
	default:
		break;
	}
}
/**
 * 清空选中所有的标记（终端与监控）
 */
function clearAllCheckedMarker() {
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();
	// 清除所有选中，并重置ICON
	while (checkedUEArray.length > 0) {
		var udn = checkedUEArray.shift();
		var marker = ueMarkers.get(udn + '');
		if (undefined != marker) {
			marker.set("icon", IconEnum.UENormal);
		}
	}
	while (checkedIPCArray.length > 0) {
		var udn = checkedIPCArray.shift();
		var marker = ipcMarkers.get(udn + '');
		if (undefined != marker) {
			marker.set("icon", IconEnum.IPCNormal);
		}
	}
}

/**
 * UE终端，单选时可用的操作
 */
function showSingleUEUsableHandlers() {
	// google.maps.MVCArray , This class extends MVCObject.
	// Reference-->https://developers.google.com/maps/documentation/javascript/3.exp/reference
	// 删除自定义菜单控件
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();
	if (checkedUEArray.length == 0) {
		return;
	}
	// 语音单呼
	var voiceCallControlDiv = document.createElement('div');
	new CustomControl(voiceCallControlDiv, '语音', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(voiceCallControlDiv);
	// 视频单呼
	var videoCallControlDiv = document.createElement('div');
	new CustomControl(videoCallControlDiv, '视频', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(videoCallControlDiv);
	// 历史轨迹
	var trackControlDiv = document.createElement('div');
	new CustomControl(trackControlDiv, '历史轨迹', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(trackControlDiv);
	google.maps.event.addDomListener(trackControlDiv, 'click', function() {
		nativeOpenQueryHistoryTrack(checkedUEArray.slice(0) + '');
	});
	// 停止定位
	var stopPositioningControlDiv = document.createElement('div');
	new CustomControl(stopPositioningControlDiv, '停止定位', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(stopPositioningControlDiv);
	// 停止所有定位
	var stopAllPositioningControlDiv = document.createElement('div');
	new CustomControl(stopAllPositioningControlDiv, '停止所有', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(stopAllPositioningControlDiv);
	// 清空选中
	var uncheckAllControlDiv = document.createElement('div');
	new CustomControl(uncheckAllControlDiv, '清空选中', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(uncheckAllControlDiv);
	google.maps.event.addDomListener(uncheckAllControlDiv, 'click', function() {
		clearAllCheckedMarker();
	});
}

/**
 * UE终端，多选时可用的操作
 */
function showMultipleUEUsableHandlers() {
	// google.maps.MVCArray , This class extends MVCObject.
	// Reference-->https://developers.google.com/maps/documentation/javascript/3.exp/reference
	// 删除自定义菜单控件
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();
	if (checkedUEArray.length == 0) {
		return;
	}
	// 语音单呼
	var voiceCallControlDiv = document.createElement('div');
	new CustomControl(voiceCallControlDiv, '语音', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(voiceCallControlDiv);
	// 视频单呼
	var videoCallControlDiv = document.createElement('div');
	new CustomControl(videoCallControlDiv, '视频', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(videoCallControlDiv);
	// 历史轨迹
	var trackControlDiv = document.createElement('div');
	new CustomControl(trackControlDiv, '历史轨迹', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(trackControlDiv);
	// 停止定位
	var stopPositioningControlDiv = document.createElement('div');
	new CustomControl(stopPositioningControlDiv, '停止定位', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(stopPositioningControlDiv);
	// 停止所有定位
	var stopAllPositioningControlDiv = document.createElement('div');
	new CustomControl(stopAllPositioningControlDiv, '停止所有', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(stopAllPositioningControlDiv);
	// 清空选中
	var uncheckAllControlDiv = document.createElement('div');
	new CustomControl(uncheckAllControlDiv, '清空选中', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(uncheckAllControlDiv);
	google.maps.event.addDomListener(uncheckAllControlDiv, 'click', function() {
		clearAllCheckedMarker();
	});
}

/**
 * IPC监控，可用的操作
 */
function showIPCUsableHandlers() {
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();
	if (checkedIPCArray.length == 0) {
		return;
	}
	// 监控
	var monitorControlDiv = document.createElement('div');
	new CustomControl(monitorControlDiv, '监控', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(monitorControlDiv);
	// 清空选中
	var uncheckAllControlDiv = document.createElement('div');
	new CustomControl(uncheckAllControlDiv, '清空选中', "button_action", "");
	googlemap.controls[google.maps.ControlPosition.BOTTOM_CENTER]
			.push(uncheckAllControlDiv);
	google.maps.event.addDomListener(uncheckAllControlDiv, 'click', function() {
		clearAllCheckedMarker();
	});
}

/**
 * 开始圈选
 * 
 */
function dragZoomDrag(drageType) {
	dragZoomType = drageType;
	dragZoomObject.hotKeyDown_ = !dragZoomObject.hotKeyDown_;
	if (dragZoomObject.hotKeyDown_) {
		dragZoomObject.buttonDiv_.firstChild.style.left = -(dragZoomObject.visualSize_.width * 0)
				+ "px";
		dragZoomObject.buttonDiv_.title = dragZoomObject.visualTips_.on;
		dragZoomObject.activatedByControl_ = true;
		google.maps.event.trigger(dragZoomObject, "activate");
	} else {
		dragZoomObject.buttonDiv_.firstChild.style.left = -(dragZoomObject.visualSize_.width * 2)
				+ "px";
		dragZoomObject.buttonDiv_.title = dragZoomObject.visualTips_.off;
		google.maps.event.trigger(dragZoomObject, "deactivate");
	}
}
/**
 * 结束圈选
 * 
 * @param bnds
 */
function dragZoomDragend(bnds) {
	// 东北坐标
	var beginlatlng = bnds.getNorthEast();
	// 西南坐标
	var endlatlng = bnds.getSouthWest();
	// 选中的UE终端
	var selectedUEArray = new Array();
	// 选中的IPC监控
	var selectedIPCArray = new Array();
	// 先检查终端是否有选中
	var keyset = ueMarkers.keySet();
	for (var i = 0; i < keyset.length; i++) {
		var latLng = ueMarkers.get(keyset[i]).getPosition();
		// 判断圈选区域内是否有成员选中
		if (latLng.lat() < beginlatlng.lat()
				&& latLng.lng() < beginlatlng.lng()
				&& latLng.lat() > endlatlng.lat()
				&& latLng.lng() > endlatlng.lng()) {
			selectedUEArray.push(keyset[i]);
			// 设置选中，加入选中列表
			ueMarkers.get(keyset[i]).set("icon", IconEnum.UEChecked);
			checkedUEArray.push(keyset[i]);
		}
	}
	keyset = ipcMarkers.keySet();
	for (var i = 0; i < keyset.length; i++) {
		var latLng = ipcMarkers.get(keyset[i]).getPosition();
		if (latLng.lat() < beginlatlng.lat()
				&& latLng.lng() < beginlatlng.lng()
				&& latLng.lat() > endlatlng.lat()
				&& latLng.lng() > endlatlng.lng()) {
			selectedIPCArray.push(keyset[i]);
			ipcMarkers.get(keyset[i]).set("icon", IconEnum.IPCChecked);
			checkedIPCArray.push(keyset[i]);
		}
	}

	// 如果圈选动作是围栏
	if (dragZoomType == DragZoomTypeEnum.Fence) {
		dragZoomDragendFence(beginlatlng, endlatlng);
	} else if (dragZoomType == DragZoomTypeEnum.CircleSelect) {
		if (selectedUEArray.length == 0 && selectedIPCArray.length == 0) {
			alert("圈选成员为空");
		} else {
			if (selectedUEArray.length > 0) {
				showUsableHandlers(TerminalTypeEnum.UE);
			} else {
				showUsableHandlers(TerminalTypeEnum.IPC);
			}
		}
	}
}

/**
 * 根据圈选范围，画围栏
 * 
 * @param beginlatlng
 * @param endlatlng
 */
function dragZoomDragendFence(beginlatlng, endlatlng) {
	// 画围栏矩形
	var latLngBounds = new google.maps.LatLngBounds(endlatlng, beginlatlng);
	var rectangle = new google.maps.Rectangle({
		strokeColor : '#FF0000',
		strokeOpacity : 0.2,// The stroke opacity between 0.0 and 1.0
		strokeWeight : 2,
		fillColor : '#FF0000',
		fillOpacity : 0.2,
		map : googlemap,
		bounds : latLngBounds
	});
	// 创建提示信息框，点击围栏弹出
	var fenceLabel = new MapLabel({
		text : '我的围栏',
		fontSize : FontSize.Normal,
		align : 'right',
		map : googlemap
	});
	fenceLabel.set('position', beginlatlng);
	var key = uuid();
	var contentString = '<div id="content">'
			+ '<h3 id="firstHeading" class="firstHeading">围栏设置</h1>'
			+ '<div>'
			+ '<p><b>触发条件</b><input type="checkbox" id="longitude" value="1" checked/>进入围栏<input type="checkbox" id="longitude" value="2"/>移出围栏</p>'
			+ '<p><b>触发动作</b><input type="checkbox" id="longitude" value="1" checked/>短信通知<input type="checkbox" id="longitude" value="2"/>电话通知</p>'
			+ '<p><b>号码<input type="text" id="alarmNumber" value="" placeholder="接收围栏告警的号码"/></b></p>'
			+ '<p><b>名称<input type="text" id="fenceName" value="" placeholder="2-10个字符"/></b></p>'
			+ '<p><div class="">'
			+ '<button type="button" class="button_ok" onclick="removeFence(\''
			+ key + '\');"> 删除</button>'
			+ '<button type="button" class="button_ok" onclick="addFence(\''
			+ key + '\');"> 保存</button></div></p>' + '</div>';
	var infowindow = new google.maps.InfoWindow({
		content : contentString
	});
	google.maps.event.addListener(rectangle, 'click', function() {
		infowindow.open(googlemap, fenceLabel);
	});
	var fenceInfo = new Object();
	fenceInfo.rectangle = rectangle;
	fenceInfo.infoWindow = infowindow;
	fenceInfo.fenceLabel = fenceLabel;
	fenceMap.put(key, fenceInfo);
	infowindow.open(googlemap, fenceLabel);
}

/**
 * 创建围栏
 */
function addFence(key) {
	var obj = fenceMap.get(key);
	if (obj) {
		var text = $("#fenceName").val();
		if (text)
			obj.fenceLabel.set("text", text);
		obj.infoWindow.close();
	}
}

/**
 * 删除围栏
 */
function removeFence(key) {
	var obj = fenceMap.get(key);
	if (obj) {
		obj.rectangle.setMap(null);
		obj.infoWindow.setMap(null);
		obj.fenceLabel.setMap(null);
		obj = null;
		fenceMap.remove(key);
	}
}

/**
 * 绘制历史轨迹
 * 
 * @param trackInfo轨迹信息，为json串，属性参考DcsGps对象
 */
function drawTrajectory(json) {
	var trackInfoArray = $.parseJSON(json);
	if (undefined == trackInfoArray || trackInfoArray == null) {
		alert('轨迹信息缺失');
		return;
	}
	// 随机获取轨迹颜色
	var color = getColor();
	var trajectoryCoordinates = new Array();
	for (var i = 0; i < trackInfoArray.length; i++) {
		trajectoryCoordinates[i] = new google.maps.LatLng(
				trackInfoArray[i].latitue, trackInfoArray[i].longitude);
	}

	var lineSymbol = {
		path : google.maps.SymbolPath.FORWARD_OPEN_ARROW,
		scale : 1,// 设置符号的尺寸缩放大小
		strokeOpacity : 1,// 决定符号描边的相对不透明度（即缺乏透明度）。取值范围是 0.0（全透明）至 1.0（全不透明）
		strokeWeight : 1,// 定义符号轮廓的粗细
		strokeColor : color,// 符号轮廓的颜色
		polylineColor : color
	};
	var trajectoryPolyline = new google.maps.Polyline({
		path : trajectoryCoordinates,
		strokeColor : color,
		strokeOpacity : 1.0,
		strokeWeight : 1,
		icons : [ {
			icon : lineSymbol,// （必填项）是要在线上渲染的符号
			offset : '100%',// 决定与线起点的距离，将在该距离处渲染图标。可以线长度百分比（例如“50%”）形式或使用像素（例如“50px”）表示该距离。默认值为“100%”
			repeat : '20px'// 决定线上连续图标的间距。可以线长度百分比（例如“50%”）形式或使用像素（例如“50px”）表示该距离。如需禁用图标重复，请指定“0”。默认值为“0”
		} ],
		map : googlemap
	});

	var key = uuid();
	var trajectoryMarkers = new Array([ trajectoryCoordinates.length ]);
	var trajectoryLabels = new Array([ trajectoryCoordinates.length ]);
	var trajectoryInfoWindows = new Array([ trajectoryCoordinates.length ]);

	for (var i = 0; i < trackInfoArray.length; i++) {
		var path = trajectoryPolyline.getPath();
		var marker = new google.maps.Marker({
			position : new google.maps.LatLng(trackInfoArray[i].latitue,
					trackInfoArray[i].longitude),
			icon : {
				path : google.maps.SymbolPath.CIRCLE,
				strokeColor : color,
				scale : 4
			},
			title : '#' + path.getLength(),
			map : googlemap
		});

		var mapLabel = new MapLabel({
			text : ' ' + moment(trackInfoArray[i].time).format('HH:mm:ss'),
			map : googlemap,
			fontSize : FontSize.Normal,
			strokeWeight : 1,
			strokeColor : color,
			fontColor : color,
			align : 'left'
		});

		if (i == 0) {
			marker.set("icon", IconEnum.TrackStart);
			mapLabel.set('text', trackInfoArray[i].time);
			mapLabel.set('align', 'center');
		} else if (i == (trackInfoArray.length - 1)) {
			marker.set("icon", IconEnum.TrackEnd);
			mapLabel.set('text', trackInfoArray[i].time);
		}
		var contentString = '<div id="content">'
				+ '<h3 id="firstHeading" class="firstHeading">'
				+ (StrUtil.isEmpty(trackInfoArray[i].uname) ? trackInfoArray[i].udn
						: trackInfoArray[i].uname)
				+ '</h1>'
				+ '<div>'
				+ '<p><b>经度</b>'
				+ trackInfoArray[i].latitue
				+ '<p><b>纬度</b>'
				+ trackInfoArray[i].longitude
				+ '</p>'
				+ '<p><b>时间</b>'
				+ trackInfoArray[i].time
				+ '</p>'
				+ '<p><div class="">'
				+ '<button type="button" class="button_ok" onclick="removeTrajectory(\''
				+ key + '\');"> 删除</button></div></p>' + '</div>';
		var infowindow = new google.maps.InfoWindow({
			content : contentString
		});
		registerMarkerEvent(marker, infowindow);
		mapLabel.set('position', trajectoryCoordinates[i]);
		trajectoryMarkers[i] = marker;
		trajectoryLabels[i] = mapLabel;
		trajectoryInfoWindows[i] = infowindow;
	}
	var obj = new Object();
	obj.polyline = trajectoryPolyline;
	obj.markers = trajectoryMarkers;
	obj.labels = trajectoryLabels;
	obj.infoWindows = trajectoryInfoWindows;
	trajectoryMap.put(key, obj);
}

/**
 * 给轨迹添加点击事件
 * 
 * @param marker
 * @param infowindow
 */
function registerMarkerEvent(marker, infowindow) {
	marker.addListener('click', function() {
		infowindow.open(googlemap, marker);
	});
}

/**
 * 删除轨迹
 */
function removeTrajectory(key) {
	var obj = trajectoryMap.get(key);
	if (obj) {
		obj.polyline.setMap(null);
		var markers = obj.markers;
		if (markers) {
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
				markers[i] = null;
			}
		}
		var labels = obj.labels;
		if (labels) {
			for (var i = 0; i < labels.length; i++) {
				labels[i].setMap(null);
				labels[i] = null;
			}
		}
		var infowindows = obj.infowindows;
		if (infowindows) {
			for (var i = 0; i < infowindows.length; i++) {
				infowindows[i].setMap(null);
				infowindows[i] = null;
			}
		}
		obj.polyline = null;
		trajectoryMap.remove(key);
	}
}

/*******************************************************************************
 * 构建自定义控件
 * 
 */
function CustomControl(controlDiv, innerHTML, className, alt) {
	var controlUI = document.createElement('div');
	controlUI.className = className;
	controlDiv.appendChild(controlUI);
	controlUI.innerHTML = innerHTML;
	controlUI.title = alt;
	return controlUI;
}

/**
 * 设置中心点
 * 
 * @param latlng
 *            instanceof google.maps.LatLng
 */
function setCenter(latlng) {
	if (undefined != latlng && latlng instanceof google.maps.LatLng)
		googlemap.setCenter(latlng);
	else
		googlemap.setCenter(centerLatlng);
}

/**
 * 绘制终端实时定位marker
 * 
 * @param udn
 * @param longitude经度
 * @param latitude纬度
 * @param title显示文本
 * @param draggable是否可拖拽
 * @returns
 */
function addUEMarker(udn, longitude, latitude, title, draggable) {
	var position = new google.maps.LatLng(latitude, longitude);
	var mapLabel = new MapLabel({
		text : title,
		map : googlemap,
		position : position,
		fontSize : FontSize.Normal,
		fontColor : FontColor.UEMarker,
		align : 'center'
	});
	var marker = ueMarkers.get(udn);
	if (marker == undefined || marker == null) {
		marker = new google.maps.Marker({
			icon : IconEnum.UENormal,
			draggable : draggable
		});
		// 保存终端用户定位信息
		ueMarkers.put(udn, marker);
	}

	marker.bindTo('map', mapLabel);
	marker.bindTo('position', mapLabel);
	marker.addListener('click', function() {
		if (marker.get("icon") == IconEnum.UEChecked) {
			marker.set("icon", IconEnum.UENormal);
			// 从已选中的列表删除
			for (var i = 0; i < checkedUEArray.length; i++) {
				if (checkedUEArray[i] == udn) {
					checkedUEArray.splice(i, 1);
				}
			}
		} else {
			marker.set("icon", IconEnum.UEChecked);
			// 添加至选中列表
			checkedUEArray.push(udn);
		}
		showUsableHandlers(TerminalTypeEnum.UE);
	});

	// 重新设置一下icon与显示信息，超时未上报位置icon与显示都会变红
	mapLabel.set("text", title);
	marker.set("icon", IconEnum.UENormal);
	marker.setPosition(position);
	log('绘制终端用户标记成功, udn-->' + udn);
	return marker;
}

/**
 * 添加IPC监控marker
 * 
 * @param udn
 * @param longitude
 * @param latitude
 * @param title
 * @param draggable
 */
function addIPCMarker(udn, longitude, latitude, title, draggable) {
	var position = new google.maps.LatLng(latitude, longitude);
	var mapLabel = new MapLabel({
		text : title,
		map : googlemap,
		position : position,
		fontSize : FontSize.Normal,
		fontColor : FontColor.IPCMarker,
		align : 'center'
	});
	var marker = ipcMarkers.get(udn);
	if (marker == undefined || marker == null) {
		marker = new google.maps.Marker({
			icon : IconEnum.IPCNormal,
			draggable : draggable
		});
		// 保存终端用户定位信息
		ipcMarkers.put(udn, marker);
	}

	marker.bindTo('map', mapLabel);
	marker.bindTo('position', mapLabel);
	marker.addListener('click', function() {
		if (marker.get("icon") == IconEnum.IPCChecked) {
			marker.set("icon", IconEnum.IPCNormal);
			for (var i = 0; i < checkedIPCArray.length; i++) {
				if (checkedIPCArray[i] == udn) {
					checkedIPCArray.splice(i, 1);
				}
			}
		} else {
			marker.set("icon", IconEnum.IPCChecked);
			checkedIPCArray.push(udn);
		}
		showUsableHandlers(TerminalTypeEnum.IPC);
	});

	// 重新设置一下icon与显示信息，超时未上报位置icon与显示都会变红
	mapLabel.set("text", title);
	marker.set("icon", IconEnum.IPCNormal);
	marker.setPosition(position);
	log('绘制IPC标记成功, udn-->' + udn);
}
/**
 * 删除终端定位marker
 * 
 * @param udn
 */
function removeUEMarker(udn) {
	var marker = markerMap.get(udn);
	if (marker != undefined && marker != null) {
		marker.setMap(null);
		markerMap.remove(udn);
	}
	removeMarkerIPC(udn);
	// 从定时检查缓存中删除
	dateMap.remove(udn);
}
/**
 * 删除IPC定位marker
 * 
 * @param udn
 */
function removeIPCMarker(udn) {
	var marker = ipcMarkerMap.get(udn);
	if (marker != undefined && marker != null) {
		marker.setMap(null);
		ipcMarkerMap.remove(udn);
	}
}
