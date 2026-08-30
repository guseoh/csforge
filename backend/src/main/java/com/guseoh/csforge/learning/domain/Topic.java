package com.guseoh.csforge.learning.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** 학습 영역에 속한 canonical Topic 콘텐츠를 표현한다. */
@Entity
@Table(name = "topic")
public class Topic extends AuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learning_area_id", nullable = false)
    private LearningArea learningArea;

    @Column(name = "content_key", nullable = false, length = 160, unique = true)
    private String contentKey;

    @Column(nullable = false, length = 96)
    private String slug;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean active;

    protected Topic() {
    }

    private Topic(LearningArea learningArea, String contentKey, String slug, String title,
            String description, int displayOrder, boolean active) {
        this.learningArea = require(learningArea, "learningArea");
        this.contentKey = text(contentKey, "contentKey");
        this.slug = text(slug, "slug");
        this.title = text(title, "title");
        this.description = description;
        this.displayOrder = nonNegative(displayOrder, "displayOrder");
        this.active = active;
    }

    public static Topic create(LearningArea area, String contentKey, String slug, String title,
            String description, int displayOrder, boolean active) {
        return new Topic(area, contentKey, slug, title, description, displayOrder, active);
    }

    public void reviseCanonicalContent(LearningArea area, String slug, String title,
            String description, int displayOrder, boolean active) {
        this.learningArea = require(area, "learningArea");
        this.slug = text(slug, "slug");
        this.title = text(title, "title");
        this.description = description;
        this.displayOrder = nonNegative(displayOrder, "displayOrder");
        this.active = active;
    }

    private static String text(String value, String name) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(name + " is required");
        return value.trim();
    }

    private static int nonNegative(int value, String name) {
        if (value < 0) throw new IllegalArgumentException(name + " must be non-negative");
        return value;
    }

    private static <T> T require(T value, String name) {
        if (value == null) throw new IllegalArgumentException(name + " is required");
        return value;
    }

    public Long getId() {
        return id;
    }

    public LearningArea getLearningArea() {
        return learningArea;
    }

    public String getContentKey() {
        return contentKey;
    }

    public String getSlug() {
        return slug;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public boolean isActive() {
        return active;
    }
}
