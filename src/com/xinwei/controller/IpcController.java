package com.xinwei.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.jeebss.framework.core.Dictionary.OperatorEum;
import org.jeebss.framework.core.component.pager.DynamicSpecifications;
import org.jeebss.framework.core.component.pager.Pager;
import org.jeebss.framework.core.component.pager.Rule;
import org.jeebss.framework.core.component.pager.SearchFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xinwei.Constants;
import com.xinwei.bean.GeneralResponseData;
import com.xinwei.bean.PreferenceEnum;
import com.xinwei.bean.SimpleResJson;
import com.xinwei.entity.Ipc;
import com.xinwei.entity.Organization;
import com.xinwei.entity.Preference;
import com.xinwei.service.IpcService;
import com.xinwei.service.OrganizationService;
import com.xinwei.service.PreferenceService;

@Controller
@RequestMapping("/r/ipc")
public class IpcController {
	private final static Logger logger = LoggerFactory.getLogger(IpcController.class);
	@Autowired
	public HttpServletRequest httpServletRequest;
	@Autowired
	public HttpServletResponse httpServletResponse;
	@Autowired
	private IpcService ipcService;
	@Autowired
	private OrganizationService organizationService;
	@Autowired
	private PreferenceService preferenceService;
	private ObjectMapper mapper = new ObjectMapper();

	@RequestMapping(value = "/list", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String list(@RequestParam(value = "orgid", required = false) Integer orgid,
			@RequestParam(value = "owner", required = false) String owner,
			@RequestParam(value = "page", required = false) Integer page,
			@RequestParam(value = "rows", required = false) Integer rows) throws JsonProcessingException {
		logger.debug(String.format("[获取IPC JSON] orgid:%d,page:%d,owner:%s", orgid, page, owner));
		try {
			SearchFilter searchFilter = new SearchFilter();
			// orgid这个条件有可能为null，目的就是查询为null的记录（未配置关联组织的IPC）
			Rule rule = new Rule();
			rule.setField("orgid");
			rule.setOperator(null == orgid ? OperatorEum.ISNULL : OperatorEum.EQ);
			rule.setData(orgid);
			// 需要特殊处理一下，若查询所有，传参将是-1，则不添加这个查询条件
			if (null == orgid || orgid != -1) {
				searchFilter.addRule(rule);
			}

			if (!StringUtils.isEmpty(owner)) {
				Rule ownerRule = new Rule();
				ownerRule.setField("owner");
				ownerRule.setOperator(OperatorEum.EQ);
				ownerRule.setData(owner);
				searchFilter.addRule(ownerRule);
			}
			Specification<Ipc> specification = DynamicSpecifications.buildSpecification(searchFilter, Ipc.class);
			Pager pager = new Pager();
			pager.setPage(page == null ? 1 : page);
			if (null != rows)
				pager.setRows(rows);
			List<Ipc> list = ipcService.findByPageable(specification, pager);
			for (int i = 0; i < list.size(); i++) {
				Long oid = list.get(i).getOrgid();
				if (null != oid) {
					Organization o = organizationService.get(oid);
					list.get(i).setOrgName(o.getName());
				}
			}

			GeneralResponseData res = new GeneralResponseData();
			res.setResult(Constants.RES_RESULT_SUCCESS);
			res.setTotal(pager.getTotalRecords());
			res.setRows(list == null ? null : list);
			res.setMsg("获取IPC信息成功");
			return mapper.writeValueAsString(res);
		} catch (Exception e) {
			logger.error("获取IPC失败。", e);
			GeneralResponseData res = new GeneralResponseData();
			res.setResult(Constants.RES_RESULT_FAIL);
			res.setRows(null);
			res.setMsg("获取失败，" + e.getLocalizedMessage());
			return mapper.writeValueAsString(res);
		}
	}

	@RequestMapping(value = "/del/{id}", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String del(@PathVariable Long id) throws JsonProcessingException {
		logger.debug(String.format("[删除IPC JSON] id:%d", id));
		try {
			ipcService.delete(id);
			SimpleResJson res = new SimpleResJson(Constants.RES_RESULT_SUCCESS, "删除成功");
			return mapper.writeValueAsString(res);
		} catch (Exception e) {
			logger.error("删除IPC失败。", e);
			SimpleResJson res = new SimpleResJson(Constants.RES_RESULT_FAIL, "删除失败，" + e.getLocalizedMessage());
			return mapper.writeValueAsString(res);
		}
	}

	@RequestMapping(value = "/del", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String dels(@RequestParam(value = "ids", required = true) String ids) throws JsonProcessingException {
		logger.debug(String.format("[删除多个IPC JSON] ids:%s", ids));
		try {
			String[] id = ids.split(",");
			for (String str : id) {
				ipcService.delete(Long.parseLong(str));
			}
			SimpleResJson res = new SimpleResJson(Constants.RES_RESULT_SUCCESS, "删除成功");
			return mapper.writeValueAsString(res);
		} catch (Exception e) {
			logger.error("删除IPC失败。", e);
			SimpleResJson res = new SimpleResJson(Constants.RES_RESULT_FAIL, "删除失败，" + e.getLocalizedMessage());
			return mapper.writeValueAsString(res);
		}
	}

	/**
	 * 移除组织信息
	 * 
	 * @param id
	 * @return
	 * @throws IOException
	 */
	@RequestMapping(value = "/undo", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String undo(@RequestParam(value = "ids", required = true) String ids) throws IOException {
		logger.debug(String.format("[移除组织信息] ids:%s", ids));
		try {
			String[] id = ids.split(",");
			List<Integer> undoIds = new ArrayList<Integer>();
			for (String str : id) {
				undoIds.add(Integer.parseInt(str));
			}
			ipcService.undoOrg(undoIds);
			// 更新时间戳，标识监控位置有更新
			preferenceService.update(PreferenceEnum.Timestamp.toString(), String.valueOf(System.currentTimeMillis()));
			SimpleResJson res = new SimpleResJson(Constants.RES_RESULT_SUCCESS, "操作成功");
			return mapper.writeValueAsString(res);
		} catch (Exception e) {
			logger.error("移除组织信息失败。", e);
			httpServletResponse.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);
			// httpServletResponse.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			SimpleResJson res = new SimpleResJson(Constants.RES_RESULT_FAIL, "移除组织信息失败，" + e.getLocalizedMessage());
			httpServletResponse.getOutputStream().flush();
			return mapper.writeValueAsString(res);
		}
	}

	@RequestMapping(value = "/config", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String config(@RequestParam(value = "ids", required = true) String ids,
			@RequestParam(value = "orgid", required = true) long orgid,
			@RequestParam(value = "owner", required = true) String owner) throws JsonProcessingException {
		logger.debug(String.format("[配置IPC JSON] orgid:%d, ids:%s", orgid, ids));
		try {
			String id[] = ids.split(",");
			for (String key : id) {
				Ipc ipc = ipcService.get(Long.parseLong(key));
				ipc.setOrgid(orgid);
				ipc.setTimestamp(System.currentTimeMillis());
				ipcService.saveOrUpdate(ipc);
			}
			// 更新时间戳，标识监控位置有更新
			preferenceService.update(PreferenceEnum.Timestamp.toString(), String.valueOf(System.currentTimeMillis()));
			SimpleResJson res = new SimpleResJson(Constants.RES_RESULT_SUCCESS, "操作成功");
			return mapper.writeValueAsString(res);
		} catch (Exception e) {
			logger.error("配置IPC失败。", e);
			SimpleResJson res = new SimpleResJson(Constants.RES_RESULT_FAIL, "配置失败，" + e.getLocalizedMessage());
			return mapper.writeValueAsString(res);
		}
	}

	private boolean isExists(String udn, String owner) {
		return ipcService.findByUdnAndOwner(udn, owner) == null;
	}

	@RequestMapping(value = "/get/{id}", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String get(@PathVariable Long id) throws JsonProcessingException {
		logger.debug(String.format("[获取IPC JSON] id:%d", id));
		try {
			GeneralResponseData res = new GeneralResponseData();
			res.setResult(Constants.RES_RESULT_SUCCESS);
			res.setRows(ipcService.get(id));
			res.setMsg("获取IPC信息成功");
			return mapper.writeValueAsString(res);
		} catch (Exception e) {
			logger.error("获取IPC失败。", e);
			GeneralResponseData res = new GeneralResponseData();
			res.setResult(Constants.RES_RESULT_FAIL);
			res.setRows(null);
			res.setMsg("获取失败，" + e.getLocalizedMessage());
			return mapper.writeValueAsString(res);
		}
	}

	@RequestMapping(value = "/append", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String saveOrUpdate(@RequestParam(value = "id", required = false) Long id,
			@RequestParam(value = "name", required = true) String name,
			@RequestParam(value = "udn", required = true) String udn,
			@RequestParam(value = "longitude", required = false) String longitude,
			@RequestParam(value = "latitude", required = false) String latitude,
			@RequestParam(value = "gpsType", required = false) Integer gpsType,
			@RequestParam(value = "voiceUploadFlag", required = false) Integer voiceUploadFlag,
			@RequestParam(value = "voicePlayFlag", required = false) Integer voicePlayFlag,
			@RequestParam(value = "ptzFlag", required = false) Integer ptzFlag,
			@RequestParam(value = "owner", required = false) String owner,
			@RequestParam(value = "orgid", required = false) Long orgid) throws JsonProcessingException {
		logger.debug(String.format("[新建IPC JSON] name:%s,orgid:%d, id:%d, udn: %s,longitude:%s, latitude:%s,owner:%s",
				name, orgid, id, udn, longitude, latitude, owner));
		try {
			// 判断同一组织下不能有相同的摄像头UDN，即电话号码一样
			Ipc findObj = ipcService.findByUdnAndOwner(udn, owner);
			if (null != findObj) {
				if (!findObj.getId().equals(id)) {
					logger.error(String.format("同组织 (%s) 下不能创建相同的IPC摄像头: %s", owner, udn));
					GeneralResponseData res = new GeneralResponseData();
					res.setResult(Constants.RES_RESULT_FAIL);
					res.setMsg(String.format("同组织 %s 下不能创建相同的监控号码: %s", owner, udn));
					return mapper.writeValueAsString(res);
				}
			}

			Ipc o = null;
			if (null != id) {
				o = ipcService.get(id);
			}
			if (null == o) {
				o = new Ipc();
				o.setOrgid(orgid);
				o.setOwner(owner);
			}
			o.setName(name);
			o.setUdn(udn);
			o.setLatitude(latitude);
			o.setLongitude(longitude);
			o.setPtzFlag(ptzFlag == null ? 0 : ptzFlag);
			o.setGpsType(gpsType == null ? 0 : gpsType);
			o.setVoicePlayFlag(voicePlayFlag == null ? 0 : voicePlayFlag);
			o.setVoiceUploadFlag(voiceUploadFlag == null ? 0 : voiceUploadFlag);
			o.setTimestamp(System.currentTimeMillis());
			ipcService.saveOrUpdate(o);
			// 更新时间戳，标识监控位置有更新
			preferenceService.update(PreferenceEnum.Timestamp.toString(), String.valueOf(System.currentTimeMillis()));
			GeneralResponseData res = new GeneralResponseData();
			res.setResult(Constants.RES_RESULT_SUCCESS);
			res.setMsg("操作成功");
			res.setRows(o);
			return mapper.writeValueAsString(res);
		} catch (Exception e) {
			logger.error("新建IPC失败。", e);
			GeneralResponseData res = new GeneralResponseData();
			res.setResult(Constants.RES_RESULT_FAIL);
			res.setMsg("创建失败，" + e.getLocalizedMessage());
			return mapper.writeValueAsString(res);
		}
	}

}
