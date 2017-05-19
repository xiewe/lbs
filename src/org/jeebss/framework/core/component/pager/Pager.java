package org.jeebss.framework.core.component.pager;

import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public class Pager {
	/**
	 * 每页显示条数
	 */
	public int rows = 10;

	/**
	 * 当前页
	 */
	public int page = 1;

	/**
	 * 排序列名
	 */
	public String sidx;

	/**
	 * 排序类型：asc or desc
	 */
	public String sord;

	/**
	 * 总页数
	 */
	public int totalPage = 1;

	/**
	 * 总记录数
	 */
	public long totalRecords = 0;

	public int getRows() {
		return rows;
	}

	public void setRows(int rows) {
		this.rows = rows;
	}

	public int getPage() {
		return page;
	}

	public void setPage(int page) {
		this.page = page;
	}

	public String getSidx() {
		return sidx;
	}

	public void setSidx(String sidx) {
		this.sidx = sidx;
	}

	public String getSord() {
		return sord;
	}

	public void setSord(String sord) {
		this.sord = sord;
	}

	public int getTotalPage() {
		return totalPage;
	}

	public void setTotalPage(int totalPage) {
		this.totalPage = totalPage;
	}

	public long getTotalRecords() {
		return totalRecords;
	}

	public void setTotalRecords(long totalRecords) {
		this.totalRecords = totalRecords;
		totalPage = (int) (totalRecords - 1) / this.rows + 1;
	}

	public Pageable parsePageable() {
		if (StringUtils.isNotBlank(getSidx())) {
			return new PageRequest(getPage() - 1, getRows(), getSord()
					.equalsIgnoreCase("asc") ? Sort.Direction.ASC
					: Sort.Direction.DESC, getSidx());
		}
		return new PageRequest(getPage() - 1, getRows());
	}

	public String toJson() {
		return "{\"total\":" + getTotalPage() + ",\"page\":" + getPage() + ",\"records\": "
				+ getTotalRecords() + ",\"rows\":%s}";
	}

}
