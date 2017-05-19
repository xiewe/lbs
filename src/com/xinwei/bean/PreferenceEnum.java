package com.xinwei.bean;

/**
 * 系统偏好设置KEY枚举
 * 
 * @author dengyong
 *
 */
public enum PreferenceEnum {
	/**
	 * eTag标识位，用来比较是否有更新
	 */
	Timestamp("Timestamp");

	/** 系统偏好设置KEY */
	private String key;

	// 构造方法
	private PreferenceEnum(String key) {
		this.key = key;
	}

}
