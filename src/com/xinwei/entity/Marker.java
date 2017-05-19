package com.xinwei.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * 我的标记（兴趣点）
 * 
 * @author dengyong
 *
 */
@JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" })
@Entity
@Table(name = "xw_marker")
public class Marker {
	public Marker() {

	}

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	/**
	 * 名称
	 */
	@Column
	private String name;

	/**
	 * 备注
	 */
	@Column
	private String remark;
	/**
	 * 经度
	 */
	@Column
	private String longitude;
	/**
	 * 纬度
	 */
	@Column
	private String latitude;
	/**
	 * 所有者
	 */
	@Column
	private String owner;
	/**
	 * 是否设为中心点:0-否，1-中心点
	 */
	@Column
	private int centerFlag;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	public String getLongitude() {
		return longitude;
	}

	public void setLongitude(String longitude) {
		this.longitude = longitude;
	}

	public String getLatitude() {
		return latitude;
	}

	public void setLatitude(String latitude) {
		this.latitude = latitude;
	}

	public String getOwner() {
		return owner;
	}

	public void setOwner(String owner) {
		this.owner = owner;
	}

	public int getCenterFlag() {
		return centerFlag;
	}

	public void setCenterFlag(int centerFlag) {
		this.centerFlag = centerFlag;
	}

}
