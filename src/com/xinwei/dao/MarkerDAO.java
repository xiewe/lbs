package com.xinwei.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.xinwei.entity.Marker;

@Transactional
public interface MarkerDAO extends JpaRepository<Marker, Long>, JpaSpecificationExecutor<Marker> {
	@Modifying
	@Query(nativeQuery = true, value = "update xw_marker set center_flag = 0  where owner = :owner ")
	void resetCenter(@Param("owner") String owner);
}