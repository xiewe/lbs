package com.xinwei.controller;

import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/index")
public class IndexController {

	private static final String INDEX = "/index";
	private static final String EROOR_400 = "common/400";
	private static final String EROOR_404 = "common/404";
	private static final String EROOR_500 = "common/500";

	@RequestMapping(value = "", method = { RequestMethod.GET, RequestMethod.POST })
	public String index(Map<String, Object> map) {

		return INDEX;
	}

	@RequestMapping(value = "/error404", method = RequestMethod.GET)
	public String pageNotFound() {
		return EROOR_404;
	}

	@RequestMapping(value = "/error400", method = RequestMethod.GET)
	public String requestSyntaxError() {
		return EROOR_400;
	}

	@RequestMapping(value = "/error500", method = RequestMethod.GET)
	public String throwableException() {
		return EROOR_500;
	}

}
