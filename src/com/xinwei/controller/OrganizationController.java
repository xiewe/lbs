package com.xinwei.controller;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

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
import com.xinwei.entity.Organization;
import com.xinwei.service.OrganizationService;
import com.xinwei.service.PreferenceService;

@Controller
@RequestMapping("/r/org")
public class OrganizationController {
	private final static Logger logger = LoggerFactory.getLogger(OrganizationController.class);
	@Autowired
	public HttpServletRequest httpServletRequest;
	@Autowired
	private OrganizationService organizationService;
	@Autowired
	private PreferenceService preferenceService;
	private ObjectMapper mapper = new ObjectMapper();

	@RequestMapping(value = "/list", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String list(@RequestParam(value = "owner", required = false) String owner) throws JsonProcessingException {
		logger.debug(String.format("[获取组织JSON] owner:%s", owner));
		try {
			List<Organization> list = null;
			if (StringUtils.isEmpty(owner)) {
				list = organizationService.findAll();
			} else {
				SearchFilter searchFilter = new SearchFilter();
				Rule rule = new Rule();
				rule.setField("owner");
				rule.setOperator(OperatorEum.EQ);
				rule.setData(owner);
				searchFilter.addRule(rule);
				Specification<Organization> specification = DynamicSpecifications.buildSpecification(searchFilter,
						Organization.class);
				list = organizationService.findAll(specification);
			}

			GeneralResponseData res = new GeneralResponseData();
			res.setResult(Constants.RES_RESULT_SUCCESS);
			res.setRows(list == null ? null : list);
			res.setMsg("获取组织信息成功");
			return mapper.writeValueAsString(res);
		} catch (Exception e) {
			logger.error("获取组织失败。", e);
			GeneralResponseData res = new GeneralResponseData();
			res.setResult(Constants.RES_RESULT_FAIL);
			res.setRows(null);
			res.setMsg("获取失败，" + e.getLocalizedMessage());
			return mapper.writeValueAsString(res);
		}
	}

	@RequestMapping(value = "/del", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String del(@RequestParam(value = "id", required = true) Long id) throws JsonProcessingException {
		logger.debug(String.format("[删除组织JSON] organization id:%d", id));
		try {
			organizationService.delete(id);
			// 更新时间戳，标识监控位置有更新
			preferenceService.update(PreferenceEnum.Timestamp.toString(), String.valueOf(System.currentTimeMillis()));
			SimpleResJson res = new SimpleResJson(Constants.RES_RESULT_SUCCESS, "删除成功");
			return mapper.writeValueAsString(res);
		} catch (Exception e) {
			logger.error("删除组织失败。", e);
			SimpleResJson res = new SimpleResJson(Constants.RES_RESULT_FAIL, "删除失败，请联系管理员");
			return mapper.writeValueAsString(res);
		}
	}

	@RequestMapping(value = "/append", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String saveOrUpdate(@RequestParam(value = "id", required = false) Long id,
			@RequestParam(value = "name", required = true) String name,
			@RequestParam(value = "owner", required = true) String owner,
			@RequestParam(value = "creator", required = true) String creator,
			@RequestParam(value = "remark", required = false) String remark,
			@RequestParam(value = "parentId", required = false) Long parentId) throws JsonProcessingException {
		logger.debug(String.format("[新建组织JSON] organization name:%s,parentId:%d, id:%d, owner: %s", name, parentId, id,
				owner));
		try {
			// 新建时，若父节点为空，则是一级组织结构，同一个组织下不能有二个一级节点
			if (id == -1 && null == parentId) {
				List<Organization> findObjs = organizationService.getByOwner(owner);
				if (null != findObjs && findObjs.size() > 0) {
					GeneralResponseData res = new GeneralResponseData();
					res.setResult(Constants.RES_RESULT_FAIL);
					res.setMsg("保存失败，同一组织下只能有一个一级节点");
					return mapper.writeValueAsString(res);
				}
			}

			// 校验，同一级别下不能有相同名字的组织
			SearchFilter searchFilter = new SearchFilter();
			Rule rule = new Rule();
			rule.setField("name");
			rule.setOperator(OperatorEum.EQ);
			rule.setData(name);
			searchFilter.addRule(rule);
			Rule parentIdRule = new Rule();
			parentIdRule.setField("parentId");
			if (null == parentId)
				parentIdRule.setOperator(OperatorEum.ISNULL);
			else
				parentIdRule.setOperator(OperatorEum.EQ);
			parentIdRule.setData(parentId);
			searchFilter.addRule(parentIdRule);
			// 判断是否同一条记录
			if (null != id) {
				Rule itself = new Rule();
				itself.setField("id");
				itself.setOperator(OperatorEum.NOTEQ);
				itself.setData(id);
				searchFilter.addRule(itself);
			}
			Specification<Organization> specification = DynamicSpecifications.buildSpecification(searchFilter,
					Organization.class);
			List<Organization> findOrganizations = organizationService.findByPageable(specification, new Pager());
			if (null != findOrganizations && findOrganizations.size() > 0) {
				GeneralResponseData res = new GeneralResponseData();
				res.setResult(Constants.RES_RESULT_FAIL);
				res.setMsg("保存失败，同一级别下不能有重名");
				return mapper.writeValueAsString(res);
			}

			Organization o = null;
			if (null != id) {
				o = organizationService.get(id);
			}
			if (null == o) {
				o = new Organization();
			}
			o.setParentId(parentId);
			o.setOwner(owner);
			o.setRemark(remark);
			o.setCreator(creator);
			o.setTimestamp(System.currentTimeMillis());
			o.setName(name);
			organizationService.saveOrUpdate(o);
			// 若是根节点，修改关联组织，需要递归修改下面所有子节点
			if (null == parentId) {
				organizationService.syncOwner(o);
			}
			// 更新时间戳，标识监控位置有更新
			preferenceService.update(PreferenceEnum.Timestamp.toString(), String.valueOf(System.currentTimeMillis()));
			GeneralResponseData res = new GeneralResponseData();
			res.setResult(Constants.RES_RESULT_SUCCESS);
			res.setMsg("操作成功");
			res.setRows(o);
			return mapper.writeValueAsString(res);
		} catch (Exception e) {
			logger.error("新建组织失败。", e);
			GeneralResponseData res = new GeneralResponseData();
			res.setResult(Constants.RES_RESULT_FAIL);
			res.setMsg("创建失败，" + e.getLocalizedMessage());
			return mapper.writeValueAsString(res);
		}
	}
}
