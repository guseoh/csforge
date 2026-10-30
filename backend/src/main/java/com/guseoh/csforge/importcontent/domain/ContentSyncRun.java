package com.guseoh.csforge.importcontent.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/** 콘텐츠와 checkpoint가 같은 transaction에서 확정된 성공 실행 근거이다. */
@Entity
@Table(name = "content_sync_run")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ContentSyncRun {
    @Id private UUID id;
    @Column(nullable = false) private String scope;
    @Column(nullable = false) private String sourceSha;
    @Column(nullable = false) private String manifestDigest;
    @Column(nullable = false) private String mode;
    private int changedFiles;
    private int updatedItems;
    private int createdItems;
    @Column(nullable = false) private Instant completedAt;

    public static ContentSyncRun completed(String scope, String sha, String digest, String mode,
            int files, int updated, int created, Instant now) {
        var run = new ContentSyncRun();
        run.id = UUID.randomUUID(); run.scope = scope; run.sourceSha = sha;
        run.manifestDigest = digest; run.mode = mode; run.changedFiles = files;
        run.updatedItems = updated; run.createdItems = created; run.completedAt = now;
        return run;
    }
}
