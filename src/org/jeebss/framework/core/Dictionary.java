package org.jeebss.framework.core;

/**
 * 数据字典，定义枚举类型
 * 
 * @author dengyong
 *
 */
public class Dictionary {

	/**
	 * SQL查询逻辑
	 * 
	 */
	public enum OperatorEum {
		EQ, LIKE, GT, LT, GTE, LTE, IN, NOTEQ, NOTIN, NOTLIKE, ISNULL, NOTNULL
	}

	/**
	 * 操作逻辑
	 * 
	 */
	public enum QueryBuilder {
		AND, OR
	}
}
