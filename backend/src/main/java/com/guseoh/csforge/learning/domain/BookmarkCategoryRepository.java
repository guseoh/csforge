package com.guseoh.csforge.learning.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** 저장된 북마크 분류의 정렬 및 고유 표시명을 조회한다. */
public interface BookmarkCategoryRepository extends JpaRepository<BookmarkCategory, Long> {
    List<BookmarkCategory> findAllByOrderByDisplayOrderAscIdAsc();
    boolean existsByNameAndIdNot(String name, Long id);
}
