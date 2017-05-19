package com.xinwei.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
@JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" })
@Entity
@Table(name = "xw_organization")
public class Organization {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	/**
	 * 所有者，即核心网管中配置的组织名
	 */
	@Column
	private String owner;

	/**
	 * 组织名
	 */
	@Column(nullable = false)
	private String name;

	/**
	 * 组织描述
	 */
	@Column
	private String remark;

	/**
	 * 创建者
	 */
	@Column
	private String creator;

	/**
	 * 父组织
	 */
	@Column
	private Long parentId;

	/**
	 * 时间戳，最后修改时间（自1970年1月1日0时起的毫秒数）
	 */
	@Column
	private long timestamp;

	/**
	 * 做个转换，easyui 中的treegrid父节点名为_parentId
	 */
	@Transient
	private Long _parentId;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setParentId(Long parentId) {
		this.parentId = parentId;
	}

	public Long getParentId() {
		return parentId;
	}

	public String getOwner() {
		return owner;
	}

	public void setOwner(String owner) {
		this.owner = owner;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}

	public Long get_parentId() {
		return parentId;
	}

	public void set_parentId(Long _parentId) {
		this._parentId = _parentId;
	}

	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	public String getCreator() {
		return creator;
	}

	public void setCreator(String creator) {
		this.creator = creator;
	}

}
