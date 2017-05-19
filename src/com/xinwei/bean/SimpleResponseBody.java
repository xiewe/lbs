package com.xinwei.bean;

import java.io.Serializable;

/**
 * 通用RESTful接口ResponseBody返回json对象定义
 * 
 * @author dengyong
 *
 * @param <T>
 */
public class SimpleResponseBody<T> implements Serializable, Cloneable {

	private static final long serialVersionUID = 1L;

	/** 1成功 , 其它为失败值 */
	private int status;

	/** 附加消息 */
	private String msg;

	/** 返回数据 */
	private T data;

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

	public T getData() {
		return data;
	}

	public void setData(T data) {
		this.data = data;
	}

}
