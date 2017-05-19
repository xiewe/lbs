package com.xinwei.service;

import java.util.List;

import org.jeebss.framework.core.component.pager.Pager;
import org.springframework.data.jpa.domain.Specification;

import com.xinwei.entity.Marker;

public interface MarkerService {

	Marker get(Long id);

	Marker saveOrUpdate(Marker o);

	void delete(Long id);

	List<Marker> findAll();

	List<Marker> findAll(Specification<Marker> specification);

	List<Marker> findByPageable(Specification<Marker> specification, Pager pager);

	/**
	 * 重置指定用户的中心点为空
	 * 
	 * @param owner
	 */
	void resetCenter(String owner);
}
