package com.xinwei.bean;

/**
 * 
 * 视频监控
 * 
 * 
 */

public class VideoMonitor {

	/** 监控号码 */
	private String udn;

	/** 监控名称 */
	private String name;

	/* 是否支持云台控制 */
	private boolean enablePTZ = true; // 默认支持云台

	public VideoMonitor() {

	}

	public String getUdn() {
		return udn;
	}

	public void setUdn(String udn) {
		this.udn = udn;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public boolean isEnablePTZ() {
		return enablePTZ;
	}

	public void setEnablePTZ(boolean enablePTZ) {
		this.enablePTZ = enablePTZ;
	}

}
