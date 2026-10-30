package com.guseoh.csforge.learning.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** URL identity를 가진 canonical 학습 참고자료를 표현한다. */
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

    private Reference(String url, String title, ReferenceType referenceType, String languageCode,
            String depth, String recommendation) {
        reviseCanonicalMetadata(url, title, referenceType, languageCode, depth, recommendation);
    }

    public static Reference create(String url, String title, ReferenceType referenceType,
            String languageCode, String depth, String recommendation) {
        return new Reference(url, title, referenceType, languageCode, depth, recommendation);
    }

    public void reviseCanonicalMetadata(String url, String title, ReferenceType referenceType,
            String languageCode, String depth, String recommendation) {
        if (url == null || url.isBlank() || title == null || title.isBlank() || referenceType == null) {
            throw new IllegalArgumentException("Invalid reference metadata");
        }
        this.url = url.trim();
        this.title = title.trim();
        this.referenceType = referenceType;
        this.languageCode = languageCode;
        this.depth = depth;
        this.recommendation = recommendation;
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
