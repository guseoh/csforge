package com.guseoh.csforge.learning.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "concept")
public class Concept extends AuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(name = "content_key", nullable = false, length = 160, unique = true)
    private String contentKey;

    @Column(nullable = false, length = 120)
    private String slug;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "content_markdown", nullable = false, columnDefinition = "TEXT")
    private String contentMarkdown;

    @Column(nullable = false)
    private short level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ContentStatus status;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    protected Concept() {
    }

    public Long getId() {
        return id;
    }

    public Topic getTopic() {
        return topic;
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

    public String getSummary() {
        return summary;
    }

    public String getContentMarkdown() {
        return contentMarkdown;
    }

    public short getLevel() {
        return level;
    }

    public ContentStatus getStatus() {
        return status;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}
