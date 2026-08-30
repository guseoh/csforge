package com.guseoh.csforge.learning.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "concept_progress")
public class ConceptProgress extends AuditedEntity implements Persistable<Long> {

    @Id
    @Column(name = "concept_id")
    private Long conceptId;

    @OneToOne(optional = false)
    @MapsId
    @JoinColumn(name = "concept_id", nullable = false)
    private Concept concept;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private LearningStatus status;

    @Column(nullable = false)
    private boolean bookmarked;

    @Column(name = "first_viewed_at")
    private Instant firstViewedAt;

    @Column(name = "last_viewed_at")
    private Instant lastViewedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    protected ConceptProgress() {
    }

    public ConceptProgress(Concept concept) {
        this.concept = concept;
        this.conceptId = concept.getId();
        this.status = LearningStatus.UNSEEN;
    }

    public void recordView(Instant viewedAt) {
        if (firstViewedAt == null) {
            firstViewedAt = viewedAt;
        }
        lastViewedAt = viewedAt;
        if (status == LearningStatus.UNSEEN) {
            startLearning();
        }
    }

    public void startLearning() {
        status = LearningStatus.LEARNING;
        completedAt = null;
    }

    public void complete(Instant completedAt) {
        status = LearningStatus.COMPLETED;
        if (this.completedAt == null) {
            this.completedAt = completedAt;
        }
    }

    public void markReviewNeeded() {
        status = LearningStatus.REVIEW_NEEDED;
        completedAt = null;
    }

    public void bookmark() {
        bookmarked = true;
    }

    public void unbookmark() {
        bookmarked = false;
    }

    public Long getConceptId() {
        return conceptId;
    }

    @Override
    public Long getId() {
        return conceptId;
    }

    @Override
    public boolean isNew() {
        return getCreatedAt() == null;
    }

    public LearningStatus getStatus() {
        return status;
    }

    public boolean isBookmarked() {
        return bookmarked;
    }

    public Instant getFirstViewedAt() {
        return firstViewedAt;
    }

    public Instant getLastViewedAt() {
        return lastViewedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}
