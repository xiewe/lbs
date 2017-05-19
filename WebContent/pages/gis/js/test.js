/**
 * 测试数据，创建终端定位，画一条轨迹
 */
function testData() {
	var contentString = '<div id="content">' + '<div id="siteNotice">'
			+ '</div>'
			+ '<h1 id="firstHeading" class="firstHeading">GDC2000</h1>'
			+ '<div id="bodyContent">' + '<p>终端类型：手持机、单兵、车载、监控摄像头。' + '</p>'
			+ '<p>信威集团 (last visited June 22, 2017).</p>' + '</div>' + '</div>';
	var infowindow = new google.maps.InfoWindow({
		content : contentString
	});
	var testMarker = new google.maps.Marker({
		icon : "images/marker2.png",
		draggable : true
	});
	var mapLabel = new MapLabel({
		text : 'Test',
		map : googlemap,
		fontSize : 15,
		fontColor : "#E33327",
		icon : "location.png",
		align : 'center'
	});
	mapLabel.set('position', new google.maps.LatLng(38.59111377614744,
			117.850341796875));

	testMarker.bindTo('map', mapLabel);
	testMarker.bindTo('position', mapLabel);
	testMarker.setDraggable(true);
	testMarker.addListener('click', function() {
		infowindow.open(googlemap, testMarker);
	});

	var infowindows = new google.maps.InfoWindow({
		content : '<img src="images/flowers.jpg"><br/><center>深圳信威</center>'
	});
	// defined icons
	var image = 'images/user.png';
	var myLatLng = new google.maps.LatLng(38.30718056188315, 115.521240234375);

	var marker = new google.maps.Marker({
		position : myLatLng,
		map : googlemap,
		draggable : true,
		title : '',
		icon : image
	});
	google.maps.event.addListener(marker, 'click', function() {
		infowindows.open(googlemap, marker);
	});
}

/**
 * 测试数据，绘制历史轨迹
 */
function testDrawTrajectory() {
	// 随机获取轨迹颜色
	var color = getColor();
	var trajectoryCoordinates = [
			new google.maps.LatLng(41.07106913080641, 114.224853515625),
			new google.maps.LatLng(40.069664523297774, 111.346435546875),
			new google.maps.LatLng(38.06539235133249, 110.85205078125),
			new google.maps.LatLng(37.33522435930639, 113.44482421875) ];
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

	for (var i = 0; i < trajectoryCoordinates.length; i++) {
		var path = trajectoryPolyline.getPath();
		var marker = new google.maps.Marker({
			position : trajectoryCoordinates[i],
			icon : {
				path : google.maps.SymbolPath.CIRCLE,
				strokeColor : color,
				scale : 4
			},
			title : '#' + path.getLength(),
			map : googlemap
		});

		var mapLabel = new MapLabel({
			text : ' 12:30',
			map : googlemap,
			fontSize : 12,
			strokeWeight : 1,
			strokeColor : color,
			fontColor : color,
			align : 'left'
		});

		if (i == 0) {
			marker.set("icon", IconEnum.TrackStart);
			mapLabel.set('text', 'UE889（12:03）');
			mapLabel.set('align', 'center');
		} else if (i == 3) {
			marker.set("icon", IconEnum.TrackEnd);
		}
		var contentString = '<div id="content">'
				+ '<h3 id="firstHeading" class="firstHeading">UE10086</h1>'
				+ '<div>'
				+ '<p><b>经度</b>'
				+ trajectoryCoordinates[i].lat()
				+ '<p><b>纬度</b>'
				+ trajectoryCoordinates[i].lng()
				+ '</p>'
				+ '<p><b>时间</b>2017-03-15 12:03:58</p>'
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