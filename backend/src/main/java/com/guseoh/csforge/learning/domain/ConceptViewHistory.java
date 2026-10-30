package com.guseoh.csforge.learning.domain;

import java.time.Instant;
import java.util.Objects;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Concept를 본 시각을 append-only로 보존하는 학습 이력이다. */
@Getter
@Entity
@Table(name = "concept_view_history")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ConceptViewHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "concept_id", nullable = false)
    private Concept concept;

    @Column(name = "viewed_at", nullable = false)
    private Instant viewedAt;

    private ConceptViewHistory(Concept concept, Instant viewedAt) {
        this.concept = Objects.requireNonNull(concept, "concept is required");
        this.viewedAt = Objects.requireNonNull(viewedAt, "viewedAt is required");
    }

    public static ConceptViewHistory record(Concept concept, Instant viewedAt) {
        return new ConceptViewHistory(concept, viewedAt);
    }
}
