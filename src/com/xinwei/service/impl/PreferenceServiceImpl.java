package com.xinwei.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.xinwei.dao.PreferenceDAO;
import com.xinwei.entity.Preference;
import com.xinwei.service.PreferenceService;

@Service
@Transactional
public class PreferenceServiceImpl implements PreferenceService {

	@Autowired
	private PreferenceDAO preferenceDAO;

	@Override
	public Preference get(Long id) {
		return preferenceDAO.findOne(id);
	}

	@Override
	public Preference getByDataKey(String key) {
		return preferenceDAO.getByDataKey(key);
	}

	@Override
	public Preference saveOrUpdate(Preference o) {
		return preferenceDAO.save(o);
	}

	@Override
	public void delete(Long id) {
		preferenceDAO.delete(id);
	}

	@Override
	public Preference update(String key, String value) {
		Preference o = getByDataKey(key);
		if (null == o)
			return null;
		o.setDataValue(value);
		return saveOrUpdate(o);
	}

}
