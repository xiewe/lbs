package com.xinwei.bean;

import java.io.Serializable;

/**
 * 简单响应结果,操作结果成功或失败，附加消息
 * 
 * @author dengyong
 *
 */
public class SimpleResJson implements Serializable, Cloneable{
	/** 1成功 , -1失败 */
	private int result;
	private String msg;

	public SimpleResJson() {
	}

	public SimpleResJson(int result, String msg) {
		this.result = result;
		this.msg = msg;
	}

	public int getResult() {
		return result;
	}

	public void setResult(int result) {
		this.result = result;
	}

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

}
