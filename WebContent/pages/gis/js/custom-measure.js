/**
 * @fileoverview 自定义测距管理
 * @version 1.0
 * @author dengyong
 */
var measureImage = 'images/marker2.png'; // 测距的点图标
var poly;
var measureIndex = 0;// 当前测距序号，支持多条测距
var measureMarkerArray;// 临时的数组，保存当前测距在地图上标注的Marker
var measurePolylineMap = new Map();// 保存当前测距在地图上标注的Polyline,key为序号，value为Polyline
var measureMarkerMap = new Map(); // 保存页面所有测距，key为序号，value为Marker数组

// 完成测距
function completeMeasure() {
	var path = poly.getPath();
	// 为最后的测距Marker添加关闭操作，点击清除这条测距
	if (measureMarkerArray.length > 0) {
		var removeIndex = measureIndex;
		var lastMarker = measureMarkerArray[measureMarkerArray.length - 1];
		// 移除最后一个，创建一个新的marker
		var marker = new MarkerWithLabel(
				{
					position : lastMarker.position,
					draggable : false, // 不可移动
					icon : "images/dd-end.png",
					map : googlemap,
					labelContent : '总长：'
							+ lastMarker.labelContent
							+ '<img onclick="deleteOverlays('
							+ removeIndex
							+ ');" src="images/close.png" style="padding-top:0.1em;"/></div>',
					labelAnchor : new google.maps.Point(22, 0),
					labelClass : "measure_label", // the CSS class for the
					// label
					labelStyle : {
						opacity : 0.75
					}
				});
		measureMarkerArray.push(marker);
		lastMarker.setMap(null);
		// 将本次测距保存至map
		measureMarkerMap.put(removeIndex, measureMarkerArray);
		measurePolylineMap.put(removeIndex, poly);
	}

	googlemap.setOptions({
		draggableCursor : null
	});
	path.pop();
	google.maps.event.clearListeners(poly);
	google.maps.event.clearListeners(googlemap, 'click');
	google.maps.event.clearListeners(googlemap, 'rightclick');
	google.maps.event.clearListeners(googlemap, 'mousemove');

}

// 删除所有叠加物
function deleteOverlays(index) {
	var removeMeasureMarkerArray = measureMarkerMap.get(index);
	// 删除Marker
	if (removeMeasureMarkerArray) {
		for (i in removeMeasureMarkerArray) {
			removeMeasureMarkerArray[i].setMap(null);
		}
		removeMeasureMarkerArray.length = 0;
	}
	// 清除折线
	var removeMeasurePolyline = measurePolylineMap.get(index);
	if (removeMeasurePolyline) {
		removeMeasurePolyline.setMap(null);
		removeMeasurePolyline = null;
	}
	measureMarkerMap.remove(index);
	measurePolylineMap.remove(index);
}

function delLatLng(event) {//
	var path = poly.getPath();
	path.pop(); // 删除最后一个点
	path.push(event.latLng);// 附加鼠标当前位置所在点
}
function addLatLng(event) {
	var path = poly.getPath();
	path.push(event.latLng);
	var distance = (poly.getLength() / 1000).toFixed(2);
	// 在当前点击处生成红色标记
	var labelContent = distance + "km";
	var markerIcon = measureImage;
	if (measureMarkerArray.length == 0) {
		labelContent = '起点';
		markerIcon = 'images/dd-start.png';
	}
	var marker = new MarkerWithLabel({
		position : event.latLng,
		draggable : false, // 不可移动
		icon : markerIcon,
		map : googlemap,
		labelContent : labelContent,
		labelAnchor : new google.maps.Point(22, 0),
		labelClass : "measure_label", // the CSS class for the label
		labelStyle : {
			opacity : 0.75
		}
	});
	measureMarkerArray.push(marker);
}

// 距离算法
google.maps.LatLng.prototype.distanceFrom = function(latlng) {
	var lat = [ this.lat(), latlng.lat() ]
	var lng = [ this.lng(), latlng.lng() ]
	// var R = 6371; // km (change this constant to get miles)
	var R = 6378137; // In meters
	var dLat = (lat[1] - lat[0]) * Math.PI / 180;
	var dLng = (lng[1] - lng[0]) * Math.PI / 180;
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
			+ Math.cos(lat[0] * Math.PI / 180)
			* Math.cos(lat[1] * Math.PI / 180) * Math.sin(dLng / 2)
			* Math.sin(dLng / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return Math.round(d);
}
google.maps.Marker.prototype.distanceFrom = function(marker) {
	return this.getPosition().distanceFrom(marker.getPosition());
}
google.maps.Polyline.prototype.getLength = function() {
	var d = 0;
	var path = this.getPath();
	var latlng;
	for (var i = 0; i < path.getLength() - 1; i++) {
		latlng = [ path.getAt(i), path.getAt(i + 1) ];
		d += latlng[0].distanceFrom(latlng[1]);
	}
	return d;
}
// 距离算法 end
