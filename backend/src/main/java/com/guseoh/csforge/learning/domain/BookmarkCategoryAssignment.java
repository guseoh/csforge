package com.guseoh.csforge.learning.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** 북마크된 Concept 하나에 선택적으로 부여하는 단일 분류이다. */
@Entity
@Table(name = "bookmark_category_concept")
public class BookmarkCategoryAssignment {

    @Id
    @Column(name = "concept_id", nullable = false)
    private Long conceptId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private BookmarkCategory category;

    protected BookmarkCategoryAssignment() {
    }

    private BookmarkCategoryAssignment(long conceptId, BookmarkCategory category) {
        this.conceptId = conceptId;
        this.category = java.util.Objects.requireNonNull(category);
    }

    public static BookmarkCategoryAssignment assign(long conceptId, BookmarkCategory category) {
        if (conceptId <= 0) {
            throw new IllegalArgumentException("Concept id must be positive");
        }
        return new BookmarkCategoryAssignment(conceptId, category);
    }

    public void moveTo(BookmarkCategory next) {
        category = java.util.Objects.requireNonNull(next);
    }

    public Long getConceptId() {
        return conceptId;
    }

    public BookmarkCategory getCategory() {
        return category;
    }
}
