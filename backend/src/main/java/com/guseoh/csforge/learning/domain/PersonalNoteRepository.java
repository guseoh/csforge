package com.guseoh.csforge.learning.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonalNoteRepository extends JpaRepository<PersonalNote, Long> {

    Optional<PersonalNote> findByConcept_Id(Long conceptId);
}
