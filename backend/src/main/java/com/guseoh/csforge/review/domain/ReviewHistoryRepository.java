package com.guseoh.csforge.review.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * 복습 시도 이력의 저장소이다.
 */
public interface ReviewHistoryRepository extends JpaRepository<ReviewHistory, Long> {

    @Query("select distinct history.question.id from ReviewHistory history where history.question.id in :questionIds")
    java.util.List<Long> findQuestionIdsWithHistory(@Param("questionIds") java.util.Collection<Long> questionIds);
}
