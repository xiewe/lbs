package com.xinwei.service;

import com.xinwei.entity.Preference;

public interface PreferenceService {

	Preference get(Long id);

	Preference getByDataKey(String key);

	Preference saveOrUpdate(Preference o);

	void delete(Long id);

	Preference update(String key, String value);
}
