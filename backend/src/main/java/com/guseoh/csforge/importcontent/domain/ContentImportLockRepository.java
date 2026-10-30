package com.guseoh.csforge.importcontent.domain;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface ContentImportLockRepository extends JpaRepository<ContentImportLock, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from ContentImportLock l where l.id = 1")
    ContentImportLock acquire();
}
