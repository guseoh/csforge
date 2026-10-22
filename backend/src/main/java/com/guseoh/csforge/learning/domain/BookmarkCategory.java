package com.guseoh.csforge.learning.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** 개인 북마크의 이름 변경 가능한 기본 분류를 보관한다. */
@Entity
@Table(name = "bookmark_category")
public class BookmarkCategory extends AuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60, unique = true)
    private String name;

    @Column(name = "display_order", nullable = false, updatable = false)
    private int displayOrder;

    protected BookmarkCategory() {
    }

    public void rename(String newName) {
        if (newName == null || newName.isBlank() || newName.strip().length() > 60) {
            throw new IllegalArgumentException("Category name must contain 1 to 60 characters");
        }
        name = newName.strip();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}
