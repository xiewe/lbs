package com.xinwei.bean;

public class GeneralResponseData<T> {

	/** 1成功 , 其它为失败值 */
	private int result;

	/** 返回的消息，失败为具体原因 */
	private String msg;

	/** 返回的记录条数 */
	private long total;

	/** 返回数据 */
	private T rows;

	public GeneralResponseData() {
		msg = "";
		total = 0;
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

	public T getRows() {
		return rows;
	}

	public void setRows(T rows) {
		this.rows = rows;
	}

	public long getTotal() {
		return total;
	}

	public void setTotal(long total) {
		this.total = total;
	}

}
