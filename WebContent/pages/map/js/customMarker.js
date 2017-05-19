/**
 * @fileoverview 自定义标记兴趣点管理
 * @version 1.0
 * @author dengyong
 */
var customMarkerMap = new Map(); // 保存自定义标注，限制每个用户只能设置20个标记
var currentInfoBubble; // 点击标记弹出的信息框，目前设计界面只显示一个
var markerImage = 'marker1.png'; // 自定义标记图标
var tempObj; // 临时的标记，尚未保存的

// 在地图上标记用户的兴趣点
function drawCustomMarkers() {
	$.ajax({
		type : "post",
		url : "/lbs/r/marker/list",
		data : {
			"owner" : owner
		},
		dataType : 'json',
		beforeSend : function() {

		},
		success : function(result) {
			createDomElement(result.rows);
		},
		error : function(result) {
			alert(result.msg);
		},
		complete : function() {

		}
	});
}
// 创建DOM元素
function createDomElement(markerEntitys) {
	for ( var i in markerEntitys) {
		var marker = new MarkerWithLabel(
				{
					position : new google.maps.LatLng(
							markerEntitys[i].latitude,
							markerEntitys[i].longitude),
					draggable : false, // 不可移动
					icon : markerEntitys[i].centerFlag == 0 ? markerImage
							: centerImage,
					map : map,
					labelContent : markerEntitys[i].name,
					labelAnchor : new google.maps.Point(22, 0),
					labelClass : "measure_labels"
				});

		var customMarker = new Object();
		customMarker.marker = marker;
		customMarker.entity = markerEntitys[i];
		initMarkerEvent(customMarker);
		// 保存至Map
		customMarkerMap.put(markerEntitys[i].id, customMarker);
		// 设置中心点
		if (markerEntitys[i].centerFlag == 1) {
			initCenterLatitude = markerEntitys[i].latitude;
			initCenterLongitude = markerEntitys[i].longitude;
			setMapCenter();
			if (initCenterMarker) {
				initCenterMarker.setMap(null);
			}
		}
	}

}
// 初始化自定义标记兴趣点
function initMarkerEvent(obj) {
	google.maps.event
			.addListener(
					obj.marker,
					'click',
					function(e) {
						var checked = (obj.entity.centerFlag == 1) ? "checked"
								: "";
						var contentString = '<div style="width: 260px; height:220px;">'
								+ '纬度:'
								+ obj.entity.latitude
								+ ' <br/>经度:'
								+ obj.entity.longitude
								+ '<input type="hidden" id="longitude" value="'
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
								+ '<br/><input type="checkbox" style="margin-left:34px;" id="centerFlag" '
								+ checked
								+ '/>设为中心点<br/>'
								+ '<span id="errorTips" style="color: red;font-size: 12px;margin-left:36px;"></span>'
								+ '<br/><span style="margin-left:36px;"><input id="saveButton" type="button" value="保存" />'
								+ '&nbsp;<input id="deleteButton" type="button" value="删除" /></span>'
								+ '&nbsp;<input id="closeButton" type="button" value="关闭" /></div>';
						if (currentInfoBubble) {
							closeMyInfoBubble();
						}
						currentInfoBubble = new InfoBubble({
						// maxWidth : 300
						});
						currentInfoBubble.addTab('兴趣点', contentString);
						currentInfoBubble.hideCloseButton();
						currentInfoBubble.open(map, obj.marker);
						
						// 要删除新增未保存的Marker
						if (tempObj) {
							tempObj.marker.setMap(null);
							tempObj = null;
						}
						bindMarkerDomEvent(obj.entity.id);
					});
}
/**
 * 绑定标记中的DOM事件，例保存、删除、关闭按钮
 * @param id 为标记的ID
 * @returns
 */
function bindMarkerDomEvent(id)
{
	setTimeout(function(){
		$("#closeButton").click(function(){
			closeMyInfoBubble();
 		});
		$("#deleteButton").click(function(){
			delMyMarker(id);
 		});
		$("#saveButton").click(function(){
			saveMyMarker(id);
 		});
	}, 500);
}

// 添加标注（兴趣点）
function addInterestPoint(event) {
	// var timestamp = new Date().getTime();
	var marker = new MarkerWithLabel({
		position : event.latLng,
		draggable : false, // 不可移动
		icon : markerImage,
		map : map,
		labelContent : '我的标记',
		labelAnchor : new google.maps.Point(22, 0),
		labelClass : "measure_labels", // the CSS class for the label
		labelStyle : {
			opacity : 0.75
		}
	});

	var contentString = '<div style="width: 260px; height:230px;">'
			+ '纬度:'
			+ marker.getPosition().lat()
			+ ' <br/>经度:'
			+ marker.getPosition().lng()
			+ '<input type="hidden" id="longitude" value="'
			+ marker.getPosition().lng()
			+ '" />'
			+ '<input type="hidden" id="latitude" value="'
			+ marker.getPosition().lat()
			+ '" />'
			+ '<input type="hidden" id="owner" value="'
			+ owner
			+ '" />'
			+ '<input type="hidden" id="markerId" value="0" />'
			+ '<br/><label>名称 </label><input type="text" style="width:150px;" id="markerName" maxlength="10"/><font color="red">*</font>'
			+ '<br/><label>备注 </label><textarea id="markerRemark" style="width:150px;height:50px;margin-top:3px;overflow:hidden" maxlength="30"></textarea>'
			+ '<br/><input type="checkbox" id="centerFlag" style="margin-left:34px;"/>设为中心点<br/>'
			+ '<span id="errorTips" style="color: red;font-size: 12px;margin-left:36px;"></span>'
			+ '<br/><span style="margin-left:36px;"><input id="saveMyMarker" type="button" value="保存" />'
			+ '&nbsp;<input id="delMyMarker" type="button" value="放弃" /></span>'
			+ '</div>';
	closeMyInfoBubble();
	currentInfoBubble = new InfoBubble({});
	currentInfoBubble.addTab('兴趣点', contentString);
	currentInfoBubble.hideCloseButton();
	currentInfoBubble.open(map, marker);

	// 添加至缓存，新建的
	tempObj = new Object();
	tempObj.marker = marker;

	map.draggableCursor = '';
	google.maps.event.clearListeners(map, "click");
	//绑定事件
	setTimeout(function(){
		$("#saveMyMarker").click(function(){
			saveMyMarker();
 		});
		$("#delMyMarker").click(function(){
			delMyMarker(-1);
 		});
	}, 500);
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

	$.ajax({
		type : "post",
		url : "/lbs/r/marker/save",
		data : {
			"id" : id,
			"name" : name,
			"remark" : remark,
			"centerFlag" : centerFlag,
			"longitude" : longitude,
			"latitude" : latitude,
			"owner" : owner
		},
		dataType : 'json',
		beforeSend : function() {

		},
		success : function(result) {
			if (result.result == 1) {
				var obj = customMarkerMap.get(result.rows.id);
				if (obj) {
					// 更新缓存中的记录
					obj.entity.id = result.rows.id;
					obj.entity.name = result.rows.name;
					obj.entity.remark = result.rows.remark;
					obj.entity.longitude = result.rows.longitude;
					obj.entity.latitude = result.rows.latitude;
					obj.entity.owner = result.rows.owner;
					obj.entity.centerFlag = result.rows.centerFlag;
				} else {
					obj = new Object();
					obj.marker = new MarkerWithLabel({
						position : tempObj.marker.getPosition(),
						draggable : false, // 不可移动
						icon : markerImage,
						map : map,
						labelContent : '我的标记',
						labelAnchor : new google.maps.Point(22, 0),
						labelClass : "measure_labels", // the CSS class for the
						// label
						labelStyle : {
							opacity : 0.75
						}
					});
					obj.entity = result.rows;

					customMarkerMap.put(result.rows.id, obj);
					initMarkerEvent(obj);

					tempObj.marker.setMap(null);
					tempObj = null;

				}
				obj.marker.set("labelContent", result.rows.name);

				closeMyInfoBubble();

				updateMyMarkerCenter(result.rows.id, result.rows.centerFlag);

			} else {
				$("#errorTips").html(result.msg);
			}
		},
		error : function(result) {
			alert(result.msg);
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
				url : "/lbs/r/marker/del/" + key,
				data : {},
				dataType : 'json',
				beforeSend : function() {

				},
				success : function(result) {

				},
				error : function(result) {
					alert(result.msg);
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
	if (currentInfoBubble != undefined && currentInfoBubble != null) {
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
				obj.marker.set("icon", markerImage);
				obj.entity.centerFlag = 0;
			}
		}
		customMarkerMap.get(id).marker.set("icon", centerImage);
		customMarkerMap.get(id).entity.centerFlag = 1;
		initCenterLatitude = customMarkerMap.get(id).entity.latitude;
		initCenterLongitude = customMarkerMap.get(id).entity.longitude;
		if (initCenterMarker) {
			initCenterMarker.setMap(null);
		}
		// setMapCenter();
	} else {
		customMarkerMap.get(id).marker.set("icon", markerImage);
	}
}
