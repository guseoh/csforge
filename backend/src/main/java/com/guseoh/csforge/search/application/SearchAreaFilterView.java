package com.guseoh.csforge.search.application;

import java.util.List;

/** Search area filter와 하위 Topic 선택지를 전달하는 application view이다. */
public record SearchAreaFilterView(String areaSlug, String areaName, List<SearchTopicFilterView> topics) {
}
