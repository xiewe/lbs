/**
 * @fileoverview 自定义标记兴趣点管理
 * @version 1.0
 * @author dengyong
 */
var customMarkerMap = new Map(); // 保存自定义标注，限制每个用户只能设置20个标记
var currentInfoBubble; // 点击标记弹出的信息框，目前设计界面只显示一个
var tempObj; // 临时的标记，尚未保存的

/**
 * 在地图上标记用户的兴趣点
 * 
 */
function drawCustomMarkers() {
	$.ajax({
		type : "post",
		url : (mapSettings.useLocalResources ? lbsHost : '')
				+ "/lbs/r/marker/list",
		data : {
			"owner" : owner
		},
		// 本地加载与服务端加载，需要区分ajax调用方式，不能跨协议、跨域调用
		dataType : mapSettings.useLocalResources ? 'jsonp' : 'json',
		beforeSend : function() {

		},
		success : function(result) {
			createDomElement(result.rows);
		},
		error : function(result) {
			alert('[drawCustomMarkers]statusText is ' + result.statusText);
		},
		complete : function() {

		}
	});
}
/**
 * 创建自定义标记DOM元素
 * 
 * @param markerEntitys
 */
function createDomElement(markerEntitys) {
	for ( var i in markerEntitys) {
		var marker = new google.maps.Marker({
			icon : markerEntitys[i].centerFlag == 0 ? IconEnum.Marker
					: IconEnum.CenterPoint
		});
		var markerLabel = new MapLabel({
			text : markerEntitys[i].name,
			map : googlemap,
			position : new google.maps.LatLng(markerEntitys[i].latitude,
					markerEntitys[i].longitude),
			fontSize : FontSize.L,
			fontColor : FontColor.NormalMarker,
			align : 'center'
		});
		marker.bindTo('map', markerLabel);
		marker.bindTo('position', markerLabel);

		var customMarker = new Object();
		customMarker.marker = marker;
		customMarker.entity = markerEntitys[i];
		initMarkerEvent(customMarker);
		// 保存至Map
		customMarkerMap.put(markerEntitys[i].id, customMarker);
		// 设置中心点， 1 是选中
		if (markerEntitys[i].centerFlag == 1) {
			centerLatlng = new google.maps.LatLng(markerEntitys[i].latitude,
					markerEntitys[i].longitude);
			setCenter(centerLatlng);
			if (centerMarker) {
				centerMarker.setMap(null);
				centerMarker = null;
			}
		}
	}

}
/**
 * 绑定自定义标记点击事件
 * 
 * @param obj
 */
function initMarkerEvent(obj) {
	google.maps.event
			.addListener(
					obj.marker,
					'click',
					function(e) {
						var checked = (obj.entity.centerFlag == 1) ? "checked"
								: "";
						var contentString = '<div style="width: 220px; height:200px;">'
								+ '纬度 '
								+ obj.entity.latitude
								+ ' <br/>经度 '
								+ obj.entity.longitude
								+ '<br/><input type="hidden" id="longitude" value="'
								+ obj.entity.longitude
								+ '" />'
								+ '<input type="hidden" id="latitude" value="'
								+ obj.entity.latitude
								+ '" />'
								+ '<input type="hidden" id="owner" value="'
								+ obj.entity.owner
								+ '" />'
								+ '<input type="hidden" id="markerId" value="'
								+ obj.entity.id
								+ '" />'
								+ '<br/><label>名称 </label><input type="text" maxlength="10" style="width:150px;" id="markerName" value="'
								+ obj.entity.name
								+ '" /><font color="red">*</font>'
								+ '<br/><label>备注 </label><textarea style="width:150px;height:50px;margin-top:3px;overflow:hidden;" maxlength="30" id="markerRemark" >'
								+ obj.entity.remark
								+ '</textarea>'
								+ '<br/><input type="checkbox" style="margin-left:30px;" id="centerFlag" '
								+ checked
								+ '/>设为中心点<br/>'
								+ '<span id="errorTips" style="color: red;font-size: 12px;margin-left:36px;"></span>'
								+ '<br/><span style="margin-left:10px;"><input type="button" class="button_ok" value="保存" onclick="javascript:saveMyMarker('
								+ obj.entity.id
								+ ');"/>'
								+ '<input type="button" class="button_ok" value="删除" onclick="javascript:delMyMarker('
								+ obj.entity.id
								+ ');"/>'
								+ '<input type="button" class="button_ok" value="关闭" onclick="javascript:closeMyInfoBubble();" /></span></div>';
						if (currentInfoBubble) {
							closeMyInfoBubble();
						}
						currentInfoBubble = new InfoBubble({});
						currentInfoBubble.addTab('兴趣点', contentString);
						currentInfoBubble.hideCloseButton();
						currentInfoBubble.open(googlemap, obj.marker);
						// 要删除新增未保存的Marker
						if (tempObj) {
							tempObj.marker.setMap(null);
							tempObj = null;
						}
					});
}

/**
 * 添加标注（兴趣点）
 */
function addInterestPoint(event) {
	var interestPointMarker = new google.maps.Marker({
		icon : IconEnum.Marker
	});
	var interestPointMarkerLabel = new MapLabel({
		text : '我的标记',
		map : googlemap,
		position : event.latLng,
		fontSize : FontSize.L,
		fontColor : FontColor.NormalMarker,
		align : 'center'
	});
	interestPointMarker.bindTo('map', interestPointMarkerLabel);
	interestPointMarker.bindTo('position', interestPointMarkerLabel);

	var contentString = '<div style="width: 200px; height:200px;">'
			+ '纬度 '
			+ event.latLng.lat()
			+ '<br/>经度 '
			+ event.latLng.lng()
			+ '<br/><input type="hidden" id="longitude" value="'
			+ event.latLng.lng()
			+ '" />'
			+ '<input type="hidden" id="latitude" value="'
			+ event.latLng.lat()
			+ '" />'
			+ '<input type="hidden" id="owner" value="'
			+ owner
			+ '" />'
			+ '<input type="hidden" id="markerId" value="0" />'
			+ '<br/><label>名称 </label><input type="text" style="width:150px;" id="markerName" maxlength="10"/><font color="red">*</font>'
			+ '<br/><label>备注 </label><textarea id="markerRemark" style="width:150px;height:50px;margin-top:3px;overflow:hidden" maxlength="30"></textarea>'
			+ '<br/><input type="checkbox" id="centerFlag" style="margin-left:34px;"/>设为中心点<br/>'
			+ '<span id="errorTips" style="color: red;font-size: 12px;margin-left:36px;"></span>'
			+ '<br/><span style="margin-left:36px;"><input type="button" class="button_ok" value="保存" onclick="javascript:saveMyMarker();"/>'
			+ '&nbsp;<input type="button" class="button_ok" value="放弃" onclick="javascript:delMyMarker(-1);" /></span>'
			+ '</div>';
	closeMyInfoBubble();
	currentInfoBubble = new InfoBubble({});
	currentInfoBubble.addTab('兴趣点', contentString);
	currentInfoBubble.hideCloseButton();
	currentInfoBubble.open(googlemap, interestPointMarker);

	// 添加至缓存，新建的
	tempObj = new Object();
	tempObj.marker = interestPointMarker;
	googlemap.setOptions({
		draggableCursor : null
	});
	google.maps.event.clearListeners(googlemap, "click");
}

/**
 * 保存兴趣点
 * 
 * @private
 */
function saveMyMarker() {
	var id = $("#markerId").val();
	var name = $("#markerName").val().trim();
	var remark = $("#markerRemark").val();
	var centerFlag = $("#centerFlag").is(':checked') ? 1 : 0;
	var longitude = $("#longitude").val();
	var latitude = $("#latitude").val();
	var owner = $("#owner").val();

	if (name.length < 2) {
		$("#errorTips").html("名称最少二个字符");
		return;
	}

	$
			.ajax({
				type : "post",
				url : (mapSettings.useLocalResources ? lbsHost : '')
						+ "/lbs/r/marker/save",
				data : {
					"id" : id,
					"name" : name,
					"remark" : remark,
					"centerFlag" : centerFlag,
					"longitude" : longitude,
					"latitude" : latitude,
					"owner" : owner
				},
				dataType : mapSettings.useLocalResources ? 'jsonp' : 'json', // 若为jsonp，jQuery会自动生成一个回调涵数名
				beforeSend : function() {

				},
				success : function(result) {
					// 请求响应结果码，1 成功
					if (result.result == 1) {
						var obj = customMarkerMap.get(result.rows.id);
						// 若找到则是修改操作
						if (obj) {
							// 更新缓存中的记录
							obj.entity.id = result.rows.id;
							obj.entity.name = result.rows.name;
							obj.entity.remark = result.rows.remark;
							obj.entity.longitude = result.rows.longitude;
							obj.entity.latitude = result.rows.latitude;
							obj.entity.owner = result.rows.owner;
							obj.entity.centerFlag = result.rows.centerFlag;
							// 更新显示的标记标题
							var markerLabel = new MapLabel({
								text : result.rows.name,
								map : googlemap,
								position : obj.marker.getPosition(),
								fontSize : FontSize.L,
								fontColor : FontColor.NormalMarker,
								align : 'center'
							});
							obj.marker.bindTo('map', markerLabel);
						} else {
							// 新增操作，创建标记，同时删除临时的标记
							var interestPointMarker = new google.maps.Marker({
								icon : IconEnum.Marker
							});
							var interestPointMarkerLabel = new MapLabel({
								text : result.rows.name,
								map : googlemap,
								position : tempObj.marker.getPosition(),
								fontSize : FontSize.L,
								fontColor : "#1841C1",
								align : 'center'
							});
							interestPointMarker.bindTo('map',
									interestPointMarkerLabel);
							interestPointMarker.bindTo('position',
									interestPointMarkerLabel);
							// 将标记
							obj = new Object();
							obj.marker = interestPointMarker;
							obj.entity = result.rows;
							customMarkerMap.put(result.rows.id, obj);
							initMarkerEvent(obj);
							// 销毁临时标记对象
							tempObj.marker.setMap(null);
							tempObj = null;
						}
						closeMyInfoBubble();
						updateMyMarkerCenter(result.rows.id,
								result.rows.centerFlag);
					} else {
						$("#errorTips").html(result.msg);
					}
				},
				error : function(result) {
					$("#errorTips").html(
							'[saveMyMarker]statusText is ' + result.statusText);
				},
				complete : function() {

				}
			});
}

/**
 * 删除兴趣点
 * 
 * @private
 */
function delMyMarker(key) {
	closeMyInfoBubble();
	if (key > 0) {
		var obj = customMarkerMap.get(key);
		if (obj) {
			obj.marker.setMap(null);
			customMarkerMap.remove(key);
			$.ajax({
				type : "post",
				url : (mapSettings.useLocalResources ? lbsHost : '')
						+ "/lbs/r/marker/del/" + key,
				data : {},
				dataType : mapSettings.useLocalResources ? 'jsonp' : 'json',
				beforeSend : function() {

				},
				success : function(result) {

				},
				error : function(result) {
					alert('[delMyMarker]statusText is ' + result.statusText);
				},
				complete : function() {

				}
			});
		}
	} else {
		if (tempObj) {
			tempObj.marker.setMap(null);
			tempObj = null;
		}
	}
}

/**
 * 关闭信息窗口
 */
function closeMyInfoBubble() {
	if (currentInfoBubble) {
		currentInfoBubble.setMap(null);
		currentInfoBubble.setContent("");
		currentInfoBubble.updateContent_();
		currentInfoBubble.close();
	}
}

/**
 * 用户只能有一个中心点，所以如果设了某个标记为中心点，则要将其它标记为中心点的重置
 */
function updateMyMarkerCenter(id, centerFlag) {
	if (centerFlag == 1) {
		var keySet = customMarkerMap.keySet();
		for (var i = 0; i < keySet.length; i++) {
			var key = keySet[i];
			var obj = customMarkerMap.get(key);
			if (obj) {
				obj.marker.set("icon", IconEnum.Marker);
				obj.entity.centerFlag = 0;
			}
		}
		customMarkerMap.get(id).marker.set("icon", centerImage);
		customMarkerMap.get(id).entity.centerFlag = 1;
		centerLatlng = new google.maps.LatLng(
				customMarkerMap.get(id).entity.latitude, customMarkerMap
						.get(id).entity.longitude); // 中心点坐标
		if (centerMarker) {
			centerMarker.setMap(null);
			centerMarker = null;
		}
	} else {
		customMarkerMap.get(id).marker.set("icon", IconEnum.Marker);
	}
}
