package com.guseoh.csforge.learning.domain;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** 가져오기 대상 Topic을 묶음으로 조회하는 저장소이다. */
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByContentKeyIn(Collection<String> contentKeys);

    @Query("select t from Topic t join fetch t.learningArea a where a.slug in :areaSlugs and t.slug in :slugs")
    List<Topic> findByAreaSlugInAndSlugIn(@Param("areaSlugs") Collection<String> areaSlugs,
            @Param("slugs") Collection<String> slugs);
}
