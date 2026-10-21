package com.guseoh.csforge.learning.domain;

import org.springframework.data.jpa.repository.JpaRepository;

/** 북마크 분류 연결은 Concept ID당 최대 하나만 보관한다. */
public interface BookmarkCategoryAssignmentRepository extends JpaRepository<BookmarkCategoryAssignment, Long> {
}
