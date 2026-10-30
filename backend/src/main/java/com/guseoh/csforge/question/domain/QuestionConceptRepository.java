package com.guseoh.csforge.question.domain;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuestionConceptRepository extends JpaRepository<QuestionConcept, QuestionConceptId> {

    @Query("""
            select new com.guseoh.csforge.question.domain.QuestionConceptSummary(
                link.question.id, concept.id, concept.slug, concept.title, concept.level,
                area.slug, area.name, topic.slug, topic.title)
            from QuestionConcept link
            join link.concept concept
            join concept.topic topic
            join topic.learningArea area
            where link.question.id in :questionIds
            order by link.question.id, concept.id
            """)
    List<QuestionConceptSummary> findSummariesForQuestionIds(@Param("questionIds") List<Long> questionIds);

    @Query("""
            select distinct link
            from QuestionConcept link
            join fetch link.concept concept
            join fetch concept.topic topic
            join fetch topic.learningArea area
            where link.question.id in :questionIds
            order by link.question.id, concept.id
            """)
    List<QuestionConcept> findForQuestionIds(@Param("questionIds") List<Long> questionIds);
}
