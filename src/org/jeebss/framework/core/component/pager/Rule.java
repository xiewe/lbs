package org.jeebss.framework.core.component.pager;

import org.jeebss.framework.core.Dictionary.OperatorEum;

public class Rule {
	private String field;
	private Object data;
	private OperatorEum operator;

	public Rule() {
		super();
	}

	public Rule(String field, Object data, OperatorEum operator) {
		super();
		this.field = field;
		this.data = data;
		this.operator = operator;
	}

	public String getField() {
		return field;
	}

	public void setField(String field) {
		this.field = field;
	}

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}

	public OperatorEum getOperator() {
		return operator;
	}

	public void setOperator(OperatorEum operator) {
		this.operator = operator;
	}

}
