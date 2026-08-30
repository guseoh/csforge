package com.guseoh.csforge.question.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuestionChoiceRepository extends JpaRepository<QuestionChoice, Long> {

    @Query("""
            select choice
            from QuestionChoice choice
            where choice.question.id = :questionId
              and choice.choiceKey = :choiceKey
            """)
    Optional<QuestionChoice> findByQuestionIdAndChoiceKey(
            @Param("questionId") long questionId,
            @Param("choiceKey") String choiceKey);

    @Query("""
            select choice
            from QuestionChoice choice
            where choice.question.id in :questionIds
            order by choice.question.id, choice.displayOrder, choice.id
            """)
    List<QuestionChoice> findForQuestionIds(@Param("questionIds") List<Long> questionIds);
}
