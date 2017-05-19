package com.xinwei.service.impl;

import java.util.List;

import org.jeebss.framework.core.component.pager.Pager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.xinwei.dao.MarkerDAO;
import com.xinwei.entity.Marker;
import com.xinwei.service.MarkerService;

@Service
@Transactional
public class MarkerServiceImpl implements MarkerService {

	@Autowired
	private MarkerDAO markerDAO;

	@Override
	public Marker get(Long id) {
		return markerDAO.findOne(id);
	}

	@Override
	public Marker saveOrUpdate(Marker o) {
		return markerDAO.save(o);
	}

	@Override
	public void delete(Long id) {
		markerDAO.delete(id);
	}

	@Override
	public List<Marker> findAll() {
		return markerDAO.findAll();
	}

	@Override
	public List<Marker> findByPageable(Specification<Marker> specification, Pager pager) {
		org.springframework.data.domain.Page<Marker> springDataPage = markerDAO.findAll(specification,
				pager.parsePageable());
		pager.setTotalRecords(springDataPage.getTotalElements());
		return springDataPage.getContent();
	}

	@Override
	public List<Marker> findAll(Specification<Marker> specification) {
		return markerDAO.findAll(specification);
	}

	@Override
	public void resetCenter(String owner) {
		markerDAO.resetCenter(owner);
	}

}
