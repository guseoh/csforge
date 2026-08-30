package com.guseoh.csforge.review.domain;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 복습 시도 이력의 저장소이다.
 */
public interface ReviewHistoryRepository extends JpaRepository<ReviewHistory, Long> {
}
