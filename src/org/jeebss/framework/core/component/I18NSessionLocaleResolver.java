package org.jeebss.framework.core.component;

import java.util.Locale;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.i18n.SessionLocaleResolver;

public class I18NSessionLocaleResolver extends SessionLocaleResolver {
	private Locale locale;

	public Locale resolveLocale(HttpServletRequest request) {
		return locale == null ? request.getLocale() : locale;
	}

	public void setLocale(HttpServletRequest request,
			HttpServletResponse response, Locale locale) {
		this.locale = locale;
	}
}
