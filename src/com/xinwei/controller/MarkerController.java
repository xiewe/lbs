package com.xinwei.controller;

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
import com.xinwei.bean.SimpleResJson;
import com.xinwei.entity.Marker;
import com.xinwei.service.MarkerService;

@Controller
@RequestMapping("/r/marker")
public class MarkerController {
	private final static Logger logger = LoggerFactory.getLogger(MarkerController.class);
	@Autowired
	public HttpServletRequest httpServletRequest;
	@Autowired
	public HttpServletResponse httpServletResponse;
	@Autowired
	private MarkerService markerService;

	private ObjectMapper mapper = new ObjectMapper();

	@RequestMapping(value = "/list", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String list(@RequestParam(value = "owner", required = true) String owner,
			@RequestParam(value = "callback", required = false) String callback) throws JsonProcessingException {
		logger.debug(String.format("[获取Marker JSON] owner:%s", owner));
		GeneralResponseData res = new GeneralResponseData();
		try {
			SearchFilter searchFilter = new SearchFilter();
			Rule rule = new Rule();
			rule.setField("owner");
			rule.setOperator(OperatorEum.EQ);
			rule.setData(owner);
			searchFilter.addRule(rule);
			Specification<Marker> specification = DynamicSpecifications.buildSpecification(searchFilter, Marker.class);
			List<Marker> list = markerService.findAll(specification);

			res.setResult(Constants.RES_RESULT_SUCCESS);
			res.setTotal(list.size());
			res.setRows(list);
			res.setMsg("获取Marker信息成功");
		} catch (Exception e) {
			logger.error("获取Marker失败。", e);
			res.setResult(Constants.RES_RESULT_FAIL);
			res.setRows(null);
			res.setMsg("获取失败，" + e.getLocalizedMessage());
		} finally {
			if (StringUtils.isEmpty(callback)) {
				return mapper.writeValueAsString(res);
			} else {
				String json = mapper.writeValueAsString(res);
				return callback + "(" + json + ")";
			}
		}
	}

	@RequestMapping(value = "/del/{id}", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String del(@RequestParam(value = "callback", required = false) String callback, @PathVariable Long id)
			throws JsonProcessingException {
		logger.debug(String.format("[删除Marker JSON] id:%d", id));
		SimpleResJson res = new SimpleResJson();
		try {
			markerService.delete(id);
			res.setResult(Constants.RES_RESULT_SUCCESS);
			res.setMsg("删除成功");
		} catch (Exception e) {
			logger.error("删除Marker失败。", e);
			res.setResult(Constants.RES_RESULT_FAIL);
			res.setMsg("删除失败，" + e.getLocalizedMessage());
		} finally {
			if (StringUtils.isEmpty(callback)) {
				return mapper.writeValueAsString(res);
			} else {
				String json = mapper.writeValueAsString(res);
				return callback + "(" + json + ")";
			}
		}
	}

	@RequestMapping(value = "/save", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String saveOrUpdate(@RequestParam(value = "id", required = false) Long id,
			@RequestParam(value = "name", required = true) String name,
			@RequestParam(value = "remark", required = true) String remark,
			@RequestParam(value = "longitude", required = true) String longitude,
			@RequestParam(value = "latitude", required = true) String latitude,
			@RequestParam(value = "owner", required = true) String owner,
			@RequestParam(value = "callback", required = false) String callback,
			@RequestParam(value = "centerFlag", required = false) Integer centerFlag) throws JsonProcessingException {
		logger.debug(String.format(
				"[新建Marker JSON] name:%s,remark:%s, id:%d, centerFlag: %d,longitude:%s, latitude:%s,owner:%s", name,
				remark, id, centerFlag, longitude, latitude, owner));
		GeneralResponseData res = new GeneralResponseData();
		try {
			Marker o = null;
			if (null != id) {
				o = markerService.get(id);
			}
			if (null == o) {
				o = new Marker();
			}
			// 用户只能有一个中心点，所以如果设了某个标记为中心点，则要将其它标记为中心点的重置
			if (centerFlag == 1) {
				markerService.resetCenter(owner);
			}
			o.setName(name);
			o.setRemark(remark);
			o.setLatitude(latitude);
			o.setLongitude(longitude);
			o.setOwner(owner);
			o.setCenterFlag(centerFlag);
			markerService.saveOrUpdate(o);

			res.setResult(Constants.RES_RESULT_SUCCESS);
			res.setMsg("操作成功");
			res.setRows(o);
		} catch (Exception e) {
			logger.error("保存Marker失败。", e);
			res.setResult(Constants.RES_RESULT_FAIL);
			res.setMsg("保存失败，" + e.getLocalizedMessage());
		} finally {
			if (StringUtils.isEmpty(callback)) {
				return mapper.writeValueAsString(res);
			} else {
				String json = mapper.writeValueAsString(res);
				return callback + "(" + json + ")";
			}
		}
	}
}
