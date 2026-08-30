package com.guseoh.csforge.question.domain;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuestionAnswerRepository extends JpaRepository<QuestionAnswer, Long> {

    @Query("""
            select answer
            from QuestionAnswer answer
            left join fetch answer.choice
            where answer.question.id in :questionIds
            order by answer.question.id, answer.displayOrder, answer.id
            """)
    List<QuestionAnswer> findForQuestionIds(@Param("questionIds") List<Long> questionIds);
}
