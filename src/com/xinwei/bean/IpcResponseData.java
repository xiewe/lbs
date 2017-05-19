package com.xinwei.bean;

import java.util.HashSet;

/**
 * IPC信息
 * 
 * @author dengyong
 * 
 */
public class IpcResponseData {
	/**
	 * 1表示成功，0-表示标签一样，没有更新，不返回数据，-1失败
	 */
	private Integer result;
	/**
	 * 返回操作结果消息
	 */
	private String msg;
	/**
	 * 时间戳，每次请求由服务端返回，终端保存，下次查询携带，比较该值，相同不处理，返回相应提示
	 */
	private Long tag;
	/**
	 * 组织信息
	 */
	private HashSet<Organization> organizations;
	/**
	 * 返回的数据，监控摄像头信息
	 */
	private HashSet<Ipc> ipcs;

	/**
	 * 当前页，可选，分页查询用
	 */
	private Integer page;
	/**
	 * 每页显示多少条记录，可选，分页查询用
	 */
	private Integer rows;

	public IpcResponseData() {
	}

	public IpcResponseData(int result, String message) {
		this.result = result;
		this.msg = message;
	}

	public Integer getResult() {
		return result;
	}

	public void setResult(Integer result) {
		this.result = result;
	}

	public Long getTag() {
		return tag;
	}

	public void setTag(Long tag) {
		this.tag = tag;
	}

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

	public HashSet<Organization> getOrganizations() {
		return organizations;
	}

	public void setOrganizations(HashSet<Organization> organizations) {
		this.organizations = organizations;
	}

	public HashSet<Ipc> getIpcs() {
		return ipcs;
	}

	public void setIpcs(HashSet<Ipc> ipcs) {
		this.ipcs = ipcs;
	}

	public Integer getPage() {
		return page;
	}

	public void setPage(Integer page) {
		this.page = page;
	}

	public Integer getRows() {
		return rows;
	}

	public void setRows(Integer rows) {
		this.rows = rows;
	}

	public static class Organization {
		/**
		 * 主键ID
		 */
		private Long id;
		/**
		 * 组织名
		 */
		private String name;
		/**
		 * 组织描述
		 */
		private String remark;
		/**
		 * 创建者
		 */
		private String creator;
		/**
		 * 父组织
		 */
		private Long parentId;

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

		public String getCreator() {
			return creator;
		}

		public void setCreator(String creator) {
			this.creator = creator;
		}

		public Long getParentId() {
			return parentId;
		}

		public void setParentId(Long parentId) {
			this.parentId = parentId;
		}
	}

	public static class Ipc {
		/**
		 * 监控名称
		 */
		private String name;
		/**
		 * UDN，监控号码
		 */
		private String udn;
		/**
		 * 经度
		 */
		private String longitude;
		/**
		 * 纬度
		 */
		private String latitude;
		/**
		 * 组织ID，属于哪个组织，关联组织表主键
		 */
		Long orgid;

		/**
		 * 视频监控位置类型：0-固定、1-移动
		 */
		private int gpsType;
		/**
		 * 标识视频监控是否支持语音上传功能：0-否,1-是
		 */
		private int voiceUploadFlag;
		/**
		 * 标识视频监控是否支持语音播放功能：0-否,1-是
		 */
		private int voicePlayFlag;
		/**
		 * 标识视频监控是否支持云台控制功能：0-否,1-是
		 */
		private int ptzFlag;

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
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

		public String getLatitude() {
			return latitude;
		}

		public void setLatitude(String latitude) {
			this.latitude = latitude;
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
	}
}
