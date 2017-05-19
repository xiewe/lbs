package org.jeebss.framework.core.component.pager;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.EnumUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.domain.Specification;

public class DynamicSpecifications {
	private static final Logger logger = LoggerFactory.getLogger(DynamicSpecifications.class);

	private static final String SHORT_DATE = "yyyy-MM-dd";
	private static final String LONG_DATE = "yyyy-MM-dd HH:mm:ss";
	private static final String TIME = "HH:mm:ss";

	public static <T> Specification<T> buildSpecification(final SearchFilter searchFilter, final Class<T> entityClazz) {
		return new Specification<T>() {
			@Override
			public Predicate toPredicate(Root<T> root, CriteriaQuery<?> criteriaQuery,
					CriteriaBuilder criteriaBuilder) {
				if (null != searchFilter) {
					List<Predicate> predicates = new ArrayList<Predicate>();
					HashSet<Rule> rules = searchFilter.getRules();
					if (null != rules) {

						Path expression = null;
						Iterator<Rule> it = rules.iterator();
						while (it.hasNext()) {
							Rule rule = it.next();
							// expression = root.get(rule.getField());

							String[] names = rule.getField().split("\\.");
							expression = root.get(names[0]);
							for (int i = 1; i < names.length; i++) {
								expression = expression.get(names[i]);
							}

							// 自动进行enum和date的转换。
							Class clazz = expression.getJavaType();
							if (Date.class.isAssignableFrom(clazz) && !rule.getData().getClass().equals(clazz)) {
								rule.setData(convert2Date((String) rule.getData()));
							} else if (Enum.class.isAssignableFrom(clazz) && !rule.getData().getClass().equals(clazz)) {
								rule.setData(convert2Enum(clazz, (String) rule.getData()));
							}

							/**
							 * eq 等于，ne 不等于，lt 小于， le 小于等于，gt 大于，ge 大于等于，bw 开始于，
							 * bn 不开始于，in 属于，ni 不属于，ew 结束于， en 不结束于，cn 包含，nc
							 * 不包含，nu 不存在，nn 存在
							 */
							switch (rule.getOperator()) {
							case EQ:// 等于
								predicates.add(criteriaBuilder.equal(expression, rule.getData()));
								break;
							case NOTEQ:// 不等于
								predicates.add(criteriaBuilder.notEqual(expression, rule.getData()));
								break;
							case LT:// 小于
								predicates.add(criteriaBuilder.lessThan(expression, (Comparable) rule.getData()));
								break;
							case LTE:// 小于等于
								predicates.add(
										criteriaBuilder.lessThanOrEqualTo(expression, (Comparable) rule.getData()));
								break;
							case GT:// 大于
								predicates.add(criteriaBuilder.greaterThan(expression, (Comparable) rule.getData()));
								break;
							case GTE:// 大于等于
								predicates.add(
										criteriaBuilder.greaterThanOrEqualTo(expression, (Comparable) rule.getData()));
								break;
							case IN:// 包含
								Object[] in = rule.getData().toString().split(",");
								predicates.add(expression.in(in));
								break;
							case NOTIN:// 不包含
								Object[] notIn = rule.getData().toString().split(",");
								predicates.add(criteriaBuilder.not(expression.in(notIn)));
								break;
							case LIKE:// 模糊匹配
								if (rule.getData().toString().indexOf("%") < 0) {
									rule.setData("%" + rule.getData() + "%");
								}
								predicates.add(criteriaBuilder.like(expression, rule.getData().toString()));
								break;
							case NOTLIKE:// 不匹配
								if (rule.getData().toString().indexOf("%") < 0) {
									rule.setData("%" + rule.getData() + "%");
								}
								predicates.add(criteriaBuilder.notLike(expression, rule.getData().toString()));
								break;
							case ISNULL:// is null
								predicates.add(criteriaBuilder.isNull(expression));
								break;
							case NOTNULL:// 不为null
								predicates.add(criteriaBuilder.isNotNull(expression));
								break;
							}
						}
					}
					// 将所有条件联合起来
					if (predicates.size() > 0) {
						switch (searchFilter.getBuilder()) {
						case OR:
							return criteriaBuilder.or(predicates.toArray(new Predicate[predicates.size()]));
						default:
							return criteriaBuilder.and(predicates.toArray(new Predicate[predicates.size()]));
						}
					}
				}

				return criteriaBuilder.conjunction();
			}
		};

	}

	private static Date convert2Date(String dateString) {
		SimpleDateFormat sFormat = new SimpleDateFormat(LONG_DATE);
		try {
			return sFormat.parse(dateString);
		} catch (ParseException e) {
			try {
				sFormat = new SimpleDateFormat(SHORT_DATE);
				return sFormat.parse(dateString);
			} catch (ParseException e1) {
				try {
					sFormat = new SimpleDateFormat(TIME);
					return sFormat.parse(dateString);
				} catch (ParseException e2) {
					logger.error("Convert time is error! The dateString is " + dateString, e2);
				}
			}
		}

		return null;
	}

	private static <E extends Enum<E>> E convert2Enum(Class<E> enumClass, String enumString) {
		return EnumUtils.getEnum(enumClass, enumString);
	}
}
