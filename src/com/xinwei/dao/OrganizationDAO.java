package com.xinwei.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.xinwei.entity.Organization;

public interface OrganizationDAO extends JpaRepository<Organization, Long>, JpaSpecificationExecutor<Organization> {

	List<Organization> getByOwner(String owner);

	List<Organization> getByParentId(Long parentId);

	@Query(nativeQuery = true, value = "select max(timestamp) from xw_organization where owner = ? ")
	public Long getGreatestTimestamp(String owner);
}