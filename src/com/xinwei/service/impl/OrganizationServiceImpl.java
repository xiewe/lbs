package com.xinwei.service.impl;

import java.util.List;

import org.jeebss.framework.core.component.pager.Pager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.xinwei.dao.IpcDAO;
import com.xinwei.dao.OrganizationDAO;
import com.xinwei.entity.Organization;
import com.xinwei.service.OrganizationService;

@Service
@Transactional
public class OrganizationServiceImpl implements OrganizationService {

	@Autowired
	private OrganizationDAO organizationDAO;
	@Autowired
	private IpcDAO ipcDAO;

	@Override
	public Organization get(Long id) {
		return organizationDAO.findOne(id);
	}

	@Override
	public Organization saveOrUpdate(Organization o) {
		return organizationDAO.save(o);
	}

	/** 递归删除子节点 */
	private void deleteChild(Long id) {
		List<Organization> children = getByParentId(id);
		if (null != children && children.size() > 0) {
			for (Organization o : children) {
				// 删除IPC的引用
				ipcDAO.resetOrg(o.getId());
				organizationDAO.delete(o.getId());
				deleteChild(o.getId());
			}
		}
	}

	@Override
	public void delete(Long id) {
		deleteChild(id);
		ipcDAO.resetOrg(id);
		organizationDAO.delete(id);
	}

	@Override
	public List<Organization> findAll() {
		return organizationDAO.findAll();
	}

	@Override
	public List<Organization> findByPageable(Specification<Organization> specification, Pager pager) {
		org.springframework.data.domain.Page<Organization> springDataPage = organizationDAO.findAll(specification,
				pager.parsePageable());
		pager.setTotalRecords(springDataPage.getTotalElements());
		return springDataPage.getContent();
	}

	@Override
	public List<Organization> findAll(Specification<Organization> specification) {
		return organizationDAO.findAll(specification);
	}

	@Override
	public List<Organization> getByParentId(Long parentId) {
		return organizationDAO.getByParentId(parentId);
	}

	@Override
	public Long getGreatestTimestamp(String owner) {
		return organizationDAO.getGreatestTimestamp(owner);
	}

	@Override
	public void syncOwner(Organization parent) {
		syncChild(parent);
	}

	/** 递归子节点 */
	private void syncChild(Organization parent) {
		List<Organization> children = getByParentId(parent.getId());
		if (null != children && children.size() > 0) {
			for (Organization o : children) {
				o.setOwner(parent.getOwner());
				organizationDAO.save(o);
				syncChild(o);
			}
		}
	}

	@Override
	public List<Organization> getByOwner(String owner) {
		return organizationDAO.getByOwner(owner);
	}
}
