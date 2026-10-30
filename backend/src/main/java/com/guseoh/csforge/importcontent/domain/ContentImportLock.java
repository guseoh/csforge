package com.guseoh.csforge.importcontent.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/** 수동 및 자동 canonical 쓰기를 직렬화하는 단일 잠금 행이다. */
@Entity
@Table(name = "content_import_lock")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ContentImportLock {
    @Id private Long id;
}
