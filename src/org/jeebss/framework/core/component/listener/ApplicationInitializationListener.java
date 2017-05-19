package org.jeebss.framework.core.component.listener;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.WebApplicationContextUtils;

public class ApplicationInitializationListener extends ContextLoaderListener implements ServletContextListener {
	private static final Logger log = LoggerFactory.getLogger(ApplicationInitializationListener.class);
	/**
	 * spring上下文环境
	 */
	private static ApplicationContext applicationContext;

	/**
	 * servlet上下文环境
	 */
	private static ServletContext servletContext;

	@Override
	public void contextInitialized(ServletContextEvent event) {
		log.debug(String.format(">>>>>>>>>> %s <<<<<<<<<<", "Application initialization"));
		super.contextInitialized(event);
		servletContext = event.getServletContext();
		applicationContext = WebApplicationContextUtils.getRequiredWebApplicationContext(servletContext);
	}

	@Override
	public void contextDestroyed(ServletContextEvent arg0) {

	}

	/**
	 * @return the applicationContext
	 */
	public static ApplicationContext getApplicationContext() {
		return applicationContext;
	}

	/**
	 * @return the servletContext
	 */
	public static ServletContext getServletContext() {
		return servletContext;
	}

}
