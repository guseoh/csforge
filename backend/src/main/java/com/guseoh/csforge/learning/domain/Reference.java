package com.guseoh.csforge.learning.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "reference")
public class Reference extends AuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2048, unique = true)
    private String url;

    @Column(nullable = false, length = 300)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", nullable = false, length = 32)
    private ReferenceType referenceType;

    @Column(name = "language_code", length = 16)
    private String languageCode;

    @Column(length = 32)
    private String depth;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    protected Reference() {
    }

    public Long getId() {
        return id;
    }

    public String getUrl() {
        return url;
    }

    public String getTitle() {
        return title;
    }

    public ReferenceType getReferenceType() {
        return referenceType;
    }

    public String getLanguageCode() {
        return languageCode;
    }

    public String getDepth() {
        return depth;
    }

    public String getRecommendation() {
        return recommendation;
    }
}
