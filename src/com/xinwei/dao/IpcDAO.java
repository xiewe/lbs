package com.xinwei.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.xinwei.entity.Ipc;

@Transactional
public interface IpcDAO extends JpaRepository<Ipc, Long>, JpaSpecificationExecutor<Ipc> {
	@Query(nativeQuery = true, value = "select max(timestamp) from xw_ipc where owner = ? ")
	public Long getGreatestTimestamp(String owner);

	@Modifying
	@Query(nativeQuery = true, value = "update xw_ipc set orgid = null where orgid = ? ")
	void resetOrg(Long orgid);

	@Modifying
	@Query(nativeQuery = true, value = "update xw_ipc set orgid = null where id in(:ids) ")
	void undoOrg(@Param("ids") List<Integer> ids);
	
	@Modifying
	@Query(nativeQuery = true, value = "delete from xw_ipc where owner = :owner ")
	void removeAllByOwner(@Param("owner") String owner);

	Ipc findByUdnAndOwner(String udn, String owner);
	
	List<Ipc> getByOwner(String owner);
}