package com.xinwei.service.impl;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.jeebss.framework.core.component.pager.Pager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.xinwei.dao.IpcDAO;
import com.xinwei.entity.Ipc;
import com.xinwei.service.IpcService;

@Service
@Transactional
public class IpcServiceImpl implements IpcService {

	@Autowired
	private IpcDAO ipcDAO;

	@Override
	public Ipc get(Long id) {
		return ipcDAO.findOne(id);
	}

	@Override
	public Ipc saveOrUpdate(Ipc o) {
		return ipcDAO.save(o);
	}

	@Override
	public void delete(Long id) {
		ipcDAO.delete(id);
	}

	@Override
	public List<Ipc> findAll() {
		return ipcDAO.findAll();
	}

	@Override
	public List<Ipc> findByPageable(Specification<Ipc> specification, Pager pager) {
		if (null != pager && StringUtils.isEmpty(pager.getSidx())) {
			pager.setSord(Sort.Direction.DESC.name());
			pager.setSidx("id");
		}
		org.springframework.data.domain.Page<Ipc> springDataPage = ipcDAO.findAll(specification, pager.parsePageable());
		pager.setTotalRecords(springDataPage.getTotalElements());
		return springDataPage.getContent();
	}

	@Override
	public Long getGreatestTimestamp(String owner) {
		return ipcDAO.getGreatestTimestamp(owner);
	}

	@Override
	public List<Ipc> findAll(Specification<Ipc> specification) {
		return ipcDAO.findAll(specification);
	}

	@Override
	public void resetOrg(Long orgid) {
		ipcDAO.resetOrg(orgid);
	}

	@Override
	public void undoOrg(List<Integer> ids) {
		ipcDAO.undoOrg(ids);
	}

	@Override
	public Ipc findByUdnAndOwner(String udn, String owner) {
		return ipcDAO.findByUdnAndOwner(udn, owner);
	}

	@Override
	public List<Ipc> getByOwner(String owner) {
		return ipcDAO.getByOwner(owner);
	}

	@Override
	public void removeAllByOwner(String owner) {
		ipcDAO.removeAllByOwner(owner);
	}

}
