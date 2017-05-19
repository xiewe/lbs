package com.xinwei.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.transaction.annotation.Transactional;

import com.xinwei.entity.Preference;

@Transactional
public interface PreferenceDAO extends JpaRepository<Preference, Long>, JpaSpecificationExecutor<Preference> {

	Preference getByDataKey(String key);
	
}