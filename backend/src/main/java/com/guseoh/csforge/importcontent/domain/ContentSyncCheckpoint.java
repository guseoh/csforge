package com.guseoh.csforge.importcontent.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 원자적으로 완료된 scope의 원본 manifest와 SHA만 보관한다. */
@Entity
@Table(name = "content_sync_checkpoint")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ContentSyncCheckpoint {
    @Id private String scope;
    @Column(nullable = false) private String sourceSha;
    @Column(nullable = false, columnDefinition = "text") private String manifest;

    public static ContentSyncCheckpoint establish(String scope, String sha, String manifest) {
        var value = new ContentSyncCheckpoint();
        value.scope = scope;
        value.advance(sha, manifest);
        return value;
    }

    public void advance(String sha, String manifest) {
        this.sourceSha = java.util.Objects.requireNonNull(sha);
        this.manifest = java.util.Objects.requireNonNull(manifest);
    }
}
