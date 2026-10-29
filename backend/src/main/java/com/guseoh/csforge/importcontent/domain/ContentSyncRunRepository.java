package com.guseoh.csforge.importcontent.domain;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentSyncRunRepository extends JpaRepository<ContentSyncRun, UUID> { }
