package com.xinwei.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * IPC（IP网络摄像头）信息
 * 
 * @author dengyong
 *
 */
@JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" })
@Entity
@Table(name = "xw_ipc")
public class Ipc {
	public Ipc() {
		ptzFlag = 0;
		gpsType = 0;
		voicePlayFlag = 0;
		voiceUploadFlag = 0;
	}

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	/**
	 * 监控名称
	 */
	@Column
	private String name;

	/**
	 * UDN，用户号码
	 */
	@Column(nullable = false)
	private String udn;
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
	 * 组织ID，属于哪个组织，关联组织表主键
	 */
	@Column
	Long orgid;

	/**
	 * 视频监控位置类型：0-固定、1-移动
	 */
	@Column
	private int gpsType;
	/**
	 * 标识视频监控是否支持语音上传功能：0-否,1-是
	 */
	@Column
	private int voiceUploadFlag;
	/**
	 * 标识视频监控是否支持语音播放功能：0-否,1-是
	 */
	@Column
	private int voicePlayFlag;
	/**
	 * 标识视频监控是否支持云台控制功能：0-否,1-是
	 */
	@Column
	private int ptzFlag;
	/**
	 * 所有者，即核心网管中配置的组织名
	 */
	@Column
	private String owner;

	/**
	 * 时间戳，最后修改时间（自1970年1月1日0时起的毫秒数）
	 */
	@JsonIgnore
	@Column
	private long timestamp;

	@Transient
	private String orgName;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUdn() {
		return udn;
	}

	public void setUdn(String udn) {
		this.udn = udn;
	}

	public String getLongitude() {
		return longitude;
	}

	public void setLongitude(String longitude) {
		this.longitude = longitude;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Long getOrgid() {
		return orgid;
	}

	public void setOrgid(Long orgid) {
		this.orgid = orgid;
	}

	public int getGpsType() {
		return gpsType;
	}

	public void setGpsType(int gpsType) {
		this.gpsType = gpsType;
	}

	public int getVoiceUploadFlag() {
		return voiceUploadFlag;
	}

	public void setVoiceUploadFlag(int voiceUploadFlag) {
		this.voiceUploadFlag = voiceUploadFlag;
	}

	public int getVoicePlayFlag() {
		return voicePlayFlag;
	}

	public void setVoicePlayFlag(int voicePlayFlag) {
		this.voicePlayFlag = voicePlayFlag;
	}

	public int getPtzFlag() {
		return ptzFlag;
	}

	public void setPtzFlag(int ptzFlag) {
		this.ptzFlag = ptzFlag;
	}

	public String getLatitude() {
		return latitude;
	}

	public void setLatitude(String latitude) {
		this.latitude = latitude;
	}

	public long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}

	public String getOwner() {
		return owner;
	}

	public void setOwner(String owner) {
		this.owner = owner;
	}

	public String getOrgName() {
		return orgName;
	}

	public void setOrgName(String orgName) {
		this.orgName = orgName;
	}

}
