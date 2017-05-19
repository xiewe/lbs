package com.xinwei.bean;

import org.apache.commons.lang3.builder.ToStringBuilder;

/**
 * 地图设置
 * 
 * @author dengyong
 *
 */
public class MapSettings {

	/** 是否从本地加载网页，本地加载网页js与服务端交互会有跨协议、跨域问题，需要特殊处理，0-服务端；1-本地加载 */
	private int useLocalResources;

	/** 街道图，地图资源路径 */
	private String roadmapPath;

	/** 卫星图，地图资源路径 */
	private String satellitePath;

	/** 地图类型, 1-街道roadmap 2-卫星satellite 3-街道和卫星 */
	private int mapType;

	/** 地图缩放最大级别 */
	private int maxZoom;

	/** 地图缩放最小级别 */
	private int minZoom;

	/** 地图缩放初始级别 */
	private int initZoom;

	public int getUseLocalResources() {
		return useLocalResources;
	}

	public void setUseLocalResources(int useLocalResources) {
		this.useLocalResources = useLocalResources;
	}

	public String getRoadmapPath() {
		return roadmapPath;
	}

	public void setRoadmapPath(String roadmapPath) {
		this.roadmapPath = roadmapPath;
	}

	public String getSatellitePath() {
		return satellitePath;
	}

	public void setSatellitePath(String satellitePath) {
		this.satellitePath = satellitePath;
	}

	public int getMapType() {
		return mapType;
	}

	public void setMapType(int mapType) {
		this.mapType = mapType;
	}

	public int getMaxZoom() {
		return maxZoom;
	}

	public void setMaxZoom(int maxZoom) {
		this.maxZoom = maxZoom;
	}

	public int getMinZoom() {
		return minZoom;
	}

	public void setMinZoom(int minZoom) {
		this.minZoom = minZoom;
	}

	public int getInitZoom() {
		return initZoom;
	}

	public void setInitZoom(int initZoom) {
		this.initZoom = initZoom;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
}
