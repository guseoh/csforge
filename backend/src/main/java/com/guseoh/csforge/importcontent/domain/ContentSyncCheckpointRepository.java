package com.guseoh.csforge.importcontent.domain;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentSyncCheckpointRepository extends JpaRepository<ContentSyncCheckpoint, String> { }
