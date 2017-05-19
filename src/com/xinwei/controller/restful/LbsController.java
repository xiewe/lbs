package com.xinwei.controller.restful;

import java.util.HashSet;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.jeebss.framework.core.Dictionary.OperatorEum;
import org.jeebss.framework.core.component.pager.DynamicSpecifications;
import org.jeebss.framework.core.component.pager.Rule;
import org.jeebss.framework.core.component.pager.SearchFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.xinwei.Constants;
import com.xinwei.bean.IpcResponseData;
import com.xinwei.bean.MapSettings;
import com.xinwei.bean.PreferenceEnum;
import com.xinwei.bean.SimpleResponseBody;
import com.xinwei.entity.Ipc;
import com.xinwei.entity.Organization;
import com.xinwei.entity.Preference;
import com.xinwei.service.IpcService;
import com.xinwei.service.OrganizationService;
import com.xinwei.service.PreferenceService;

@Controller
@RequestMapping("/r/lbs")
public class LbsController {
	private final static Logger logger = LoggerFactory.getLogger(LbsController.class);
	@Autowired
	public HttpServletRequest httpServletRequest;
	@Autowired
	private IpcService ipcService;
	@Autowired
	private OrganizationService organizationService;
	@Autowired
	private PreferenceService preferenceService;
	private ObjectMapper mapper = new ObjectMapper();

	/**
	 * 
	 * @param owner
	 *            所有者，即核心网管中配置的组织名
	 * @param etag
	 *            标签，用于比对数据是否有变动
	 * @param page
	 *            当前页， 可选 ，数据多时，用于分页查询
	 * @param rows
	 *            每页显示条数，可选 ，数据多时，用于分页查询
	 * @return
	 * @throws JsonProcessingException
	 */
	@RequestMapping(value = "/list", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String list(@RequestParam(value = "owner", required = true) String owner,
			@RequestParam(value = "etag", required = true) Long etag,
			@RequestParam(value = "page", required = false) Integer page,
			@RequestParam(value = "rows", required = false) Integer rows) throws JsonProcessingException {
		logger.debug(String.format("[获取IPC JSON] owner:%s,timestamp:%d,page:%d,rows:%d", owner, etag, page, rows));
		try {
			mapper.setSerializationInclusion(Include.NON_NULL);
			// 比较TAG标签，是否与最后改动时间相符，若一致不返回记录
			Preference timestamp = preferenceService.getByDataKey(PreferenceEnum.Timestamp.toString());
			if (null != timestamp && Long.parseLong(timestamp.getDataValue()) == etag.longValue()) {
				IpcResponseData res = new IpcResponseData(0, "没有更新");
				res.setTag(etag);
				return mapper.writeValueAsString(res);
			} else {
				if (null == timestamp) {
					etag = System.currentTimeMillis();
					timestamp = new Preference();
					timestamp.setDataKey(PreferenceEnum.Timestamp.toString());
					timestamp.setDataValue(String.valueOf(etag));
					preferenceService.saveOrUpdate(timestamp);
				} else {
					etag = Long.parseLong(timestamp.getDataValue());
				}
			}

			SearchFilter searchFilter = new SearchFilter();
			Rule rule = new Rule();
			rule.setField("owner");
			rule.setOperator(OperatorEum.EQ);
			rule.setData(owner);
			searchFilter.addRule(rule);
			Specification<Organization> specification = DynamicSpecifications.buildSpecification(searchFilter,
					Organization.class);
			List<Organization> organizations = organizationService.findAll(specification);
			HashSet<com.xinwei.bean.IpcResponseData.Organization> orgs = new HashSet<com.xinwei.bean.IpcResponseData.Organization>();
			for (Organization o : organizations) {
				com.xinwei.bean.IpcResponseData.Organization org = new com.xinwei.bean.IpcResponseData.Organization();
				org.setCreator(o.getCreator());
				org.setId(o.getId());
				org.setName(o.getName());
				org.setParentId(o.getParentId());
				org.setRemark(o.getRemark());
				orgs.add(org);
			}
			// 查询IPC
			searchFilter = new SearchFilter();
			rule = new Rule();
			rule.setField("owner");
			rule.setOperator(OperatorEum.EQ);
			rule.setData(owner);
			searchFilter.addRule(rule);
			Specification<Ipc> ipcSpecification = DynamicSpecifications.buildSpecification(searchFilter, Ipc.class);
			List<Ipc> findIpcs = ipcService.findAll(ipcSpecification);
			HashSet<com.xinwei.bean.IpcResponseData.Ipc> ipcs = new HashSet<com.xinwei.bean.IpcResponseData.Ipc>();
			for (Ipc o : findIpcs) {
				com.xinwei.bean.IpcResponseData.Ipc ipc = new com.xinwei.bean.IpcResponseData.Ipc();
				ipc.setGpsType(o.getGpsType());
				ipc.setLatitude(o.getLatitude());
				ipc.setLongitude(o.getLongitude());
				ipc.setName(o.getName());
				ipc.setOrgid(o.getOrgid());
				ipc.setPtzFlag(o.getPtzFlag());
				ipc.setUdn(o.getUdn());
				ipc.setVoicePlayFlag(o.getVoicePlayFlag());
				ipc.setVoiceUploadFlag(o.getVoiceUploadFlag());
				ipcs.add(ipc);
			}
			IpcResponseData res = new IpcResponseData();
			res.setResult(Constants.RES_RESULT_SUCCESS);
			res.setMsg("操作成功");

			res.setOrganizations(orgs);
			res.setIpcs(ipcs);
			res.setTag(etag);
			SimpleFilterProvider filter = new SimpleFilterProvider().setFailOnUnknownId(false);
			SimpleBeanPropertyFilter.filterOutAllExcept("owner", "timestamp", "_parentId");// 这里需要真需要排除的属性
			return mapper.writer(filter).writeValueAsString(res);
		} catch (Exception e) {
			logger.error("获取IPC配置信息失败。", e);
			IpcResponseData res = new IpcResponseData(Constants.RES_RESULT_FAIL, "操作失败，" + e.getLocalizedMessage());
			return mapper.writeValueAsString(res);
		}
	}

	/**
	 * 同步GDC摄像头信息
	 * 
	 * @param owner
	 *            所属组织，即核心网管中配置的组织名
	 * @param ipcs
	 *            摄像头UDN,多人以英文逗号隔开
	 * @return
	 */
	@RequestMapping(value = "/sync", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String sync(@RequestParam(value = "owner", required = true) String owner,
			@RequestParam(value = "ipcs", required = true) String ipcs) {
		logger.debug(String.format("[同步IPC] owner:%s,IPCs:%s", owner, ipcs));
		String response = "None";
		// IPC摄像头参数不为空，若无自动创建
		if (!StringUtils.isEmpty(ipcs)) {
			String[] ipc = ipcs.split(",");
			// 先判断新增
			for (String udn : ipc) {
				Ipc o = ipcService.findByUdnAndOwner(udn, owner);
				if (null == o) {
					o = new Ipc();
					o.setOwner(owner);
					o.setUdn(udn);
					response = "added";
					ipcService.saveOrUpdate(o);
				}
			}

			// 检测删除的
			List<Ipc> findObjs = ipcService.getByOwner(owner);
			for (Ipc camera : findObjs) {
				boolean isDeleted = true;
				for (String udn : ipc) {
					if (camera.getUdn().equals(udn)) {
						isDeleted = false;
						break;
					}
				}
				if (isDeleted) {
					ipcService.delete(camera.getId());
					response = "Deleted";
				}
			}
		} else {
			ipcService.removeAllByOwner(owner);
			response = "remove all";
		}
		if (!"None".equals(response)) {
			// 更新时间戳，标识监控位置有更新
			preferenceService.update(PreferenceEnum.Timestamp.toString(), String.valueOf(System.currentTimeMillis()));
		}
		return response;
	}

	/**
	 * 此API仅打印日志，便于定位html页面与GDC某些交互问题跟踪，如：参数是什么，执行结果等等。。。
	 * 
	 * @param log
	 * @return
	 */
	@RequestMapping(value = "/log", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String log(@RequestParam(value = "log", required = true) String log,
			@RequestParam(value = "callback", required = false) String callback) {
		logger.debug("JS print --> " + log);
		if (StringUtils.isEmpty(callback)) {
			return "";
		} else {
			return callback + "()";
		}
	}

	/**
	 * 获取指定用户的地图偏好设置
	 * 
	 * @throws JsonProcessingException
	 */
	@SuppressWarnings("finally")
	@RequestMapping(value = "/map/settings", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String settings(@RequestParam(value = "key", required = true) String key,
			@RequestParam(value = "callback", required = false) String callback) throws JsonProcessingException {
		logger.debug("key --> " + key);
		SimpleResponseBody<MapSettings> res = new SimpleResponseBody<MapSettings>();
		try {
			Preference pres = preferenceService.getByDataKey(key);
			MapSettings settings = mapper.readValue(pres.getDataValue(), MapSettings.class);
			logger.debug(settings.toString());
			res.setStatus(Constants.RES_RESULT_SUCCESS);
			res.setData(settings);
		} catch (Exception e) {
			logger.error("", e);
			res.setStatus(Constants.RES_RESULT_FAIL);
			res.setMsg(e.getLocalizedMessage());
		} finally {
			if (StringUtils.isEmpty(callback)) {
				return mapper.writeValueAsString(res);
			} else {
				return callback + "(" + mapper.writeValueAsString(res) + ")";
			}
		}
	}

	/**
	 * 保存指定用户的地图偏好设置
	 * 
	 * @throws JsonProcessingException
	 */
	@SuppressWarnings("finally")
	@RequestMapping(value = "/map/settings/save", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String settingsSave(@RequestParam(value = "key", required = true) String key,
			@RequestParam(value = "value", required = true) String value,
			@RequestParam(value = "callback", required = false) String callback) throws JsonProcessingException {
		logger.debug("Key:{}, value: {}", key, value);
		SimpleResponseBody<MapSettings> res = new SimpleResponseBody<MapSettings>();
		try {
			Preference o = preferenceService.getByDataKey(key);
			if (null == o) {
				o = new Preference();
				o.setDataKey(key);
			}
			o.setDataValue(value);
			preferenceService.saveOrUpdate(o);
			MapSettings settings = mapper.readValue(o.getDataValue(), MapSettings.class);
			res.setStatus(Constants.RES_RESULT_SUCCESS);
			res.setData(settings);
		} catch (Exception e) {
			logger.error("", e);
			res.setStatus(Constants.RES_RESULT_FAIL);
			res.setMsg(e.getLocalizedMessage());
		} finally {
			if (StringUtils.isEmpty(callback)) {
				return mapper.writeValueAsString(res);
			} else {
				return callback + "(" + mapper.writeValueAsString(res) + ")";
			}
		}
	}
}
