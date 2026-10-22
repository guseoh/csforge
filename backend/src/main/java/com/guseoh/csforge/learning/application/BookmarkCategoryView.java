package com.guseoh.csforge.learning.application;

/** 사용자가 표시명을 바꿀 수 있는 북마크 분류의 조회 모델이다. */
public record BookmarkCategoryView(long id, String name, int displayOrder) {
}
