package com.xinwei.service;

import java.util.List;

import org.jeebss.framework.core.component.pager.Pager;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.repository.query.Param;

import com.xinwei.entity.Ipc;

public interface IpcService {

	Ipc get(Long id);

	/**
	 * 获取最大的时间戳
	 */
	Long getGreatestTimestamp(String owner);

	Ipc saveOrUpdate(Ipc o);

	Ipc findByUdnAndOwner(String udn, String owner);

	void delete(Long id);
	
	void removeAllByOwner(String owner);

	void resetOrg(Long orgid);

	void undoOrg(List<Integer> ids);

	List<Ipc> findAll();

	List<Ipc> findAll(Specification<Ipc> specification);

	List<Ipc> findByPageable(Specification<Ipc> specification, Pager pager);

	List<Ipc> getByOwner(String owner);
}
