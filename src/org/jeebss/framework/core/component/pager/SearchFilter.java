package org.jeebss.framework.core.component.pager;

import java.util.HashSet;

import org.jeebss.framework.core.Dictionary.QueryBuilder;

/**
 * 动态查询对象
 */
public class SearchFilter {

	private QueryBuilder builder;
	private HashSet<Rule> rules;

	public SearchFilter() {
		this.builder = QueryBuilder.AND;
	}

	public QueryBuilder getBuilder() {
		return builder;
	}

	public void setBuilder(QueryBuilder builder) {
		this.builder = builder;
	}

	public HashSet<Rule> getRules() {
		return rules;
	}

	public void setRules(HashSet<Rule> rules) {
		this.rules = rules;
	}

	public void addRule(Rule rule) {
		if (rules == null)
			rules = new HashSet<Rule>();
		rules.add(rule);
	}

}