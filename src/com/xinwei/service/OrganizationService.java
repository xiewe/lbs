package com.xinwei.service;

import java.util.List;

import org.jeebss.framework.core.component.pager.Pager;
import org.springframework.data.jpa.domain.Specification;

import com.xinwei.entity.Organization;

public interface OrganizationService {

	Organization get(Long id);

	/**
	 * 获取最大的时间戳
	 */
	Long getGreatestTimestamp(String owner);

	Organization saveOrUpdate(Organization o);

	void delete(Long id);
	
	void syncOwner(Organization parent);

	List<Organization> findAll();

	List<Organization> findAll(Specification<Organization> specification);

	List<Organization> findByPageable(Specification<Organization> specification, Pager pager);
	
	List<Organization> getByOwner(String owner); 

	List<Organization> getByParentId(Long parentId);
}
