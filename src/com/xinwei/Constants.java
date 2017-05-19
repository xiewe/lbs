package com.xinwei;

/**
 * 常量
 *
 * @author dengyong
 *
 */
public interface Constants {

	/**
	 * restful API 请求响应结果码，成功
	 */
	public static final int RES_RESULT_SUCCESS = 1;
	/**
	 * restful API 请求响应结果码，失败
	 */
	public static final int RES_RESULT_FAIL = -1;

	/**
	 * token 有效期7*24小时，转换毫秒7*24*3600*1000,单位毫秒
	 */
	public static final int TOKEN_EXPIRES = 604800000;

	/**
	 * 文件上传路径，用户上传的头像及其它图片或语音文件
	 */
	public static final String RESOURCE_PATH = "download.path";

}
