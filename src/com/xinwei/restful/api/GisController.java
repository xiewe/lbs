package com.xinwei.restful.api;

import javax.servlet.ServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * GIS业务相关，统一在此提供
 * 
 * @author dengyong
 * 
 */
@Controller
@RequestMapping("/gis")
public class GisController {
	private final static Logger logger = LoggerFactory.getLogger(GisController.class);
	ObjectMapper mapper = new ObjectMapper();

	@RequestMapping(value = "/test", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String test(ServletRequest request) throws Exception {				
		mapper.setSerializationInclusion(Include.NON_NULL);
		logger.debug("2222222222222222");
		return mapper.writeValueAsString("wwwwwwwwwwww");
	}

}
