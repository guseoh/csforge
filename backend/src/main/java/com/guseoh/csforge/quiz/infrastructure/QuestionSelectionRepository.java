package com.guseoh.csforge.quiz.infrastructure;

import java.util.List;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionStatus;
import com.guseoh.csforge.quiz.application.QuestionSelectionResult;
import com.guseoh.csforge.quiz.application.QuizQuestionSelectionCriteria;
import com.guseoh.csforge.quiz.application.QuizQuestionState;
import com.guseoh.csforge.quiz.domain.Attempt;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.stereotype.Repository;

@Repository
public class QuestionSelectionRepository {

    private final EntityManager entityManager;

    public QuestionSelectionRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public QuestionSelectionResult select(QuizQuestionSelectionCriteria criteria, int limit) {
        if (limit < 1) {
            throw new IllegalArgumentException("limit must be positive");
        }

        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> query = builder.createQuery(Long.class);
        Root<Question> question = query.from(Question.class);
        query.select(question.get("id"))
                .where(predicates(builder, query, question, criteria))
                .distinct(true)
                .orderBy(builder.asc(question.get("id")));

        List<Long> ids = entityManager.createQuery(query)
                .setMaxResults(limit)
                .getResultList();
        return new QuestionSelectionResult(count(criteria), ids);
    }

    public long count(QuizQuestionSelectionCriteria criteria) {
        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> query = builder.createQuery(Long.class);
        Root<Question> question = query.from(Question.class);
        query.select(builder.countDistinct(question.get("id")))
                .where(predicates(builder, query, question, criteria));
        return entityManager.createQuery(query).getSingleResult();
    }

    private Predicate[] predicates(
            CriteriaBuilder builder,
            CriteriaQuery<?> query,
            Root<Question> question,
            QuizQuestionSelectionCriteria criteria) {
        Join<?, ?> link = question.join("conceptLinks", JoinType.INNER);
        Join<?, ?> concept = link.join("concept", JoinType.INNER);
        Join<?, ?> topic = concept.join("topic", JoinType.INNER);
        Join<?, ?> area = topic.join("learningArea", JoinType.INNER);

        List<Predicate> predicates = new java.util.ArrayList<>();
        predicates.add(builder.equal(question.get("status"), QuestionStatus.PUBLISHED));
        predicates.add(builder.equal(concept.get("status"),
                com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED));
        predicates.add(builder.isTrue(topic.get("active")));
        predicates.add(builder.isTrue(area.get("active")));
        if (!criteria.areaSlugs().isEmpty()) {
            predicates.add(area.get("slug").in(criteria.areaSlugs()));
        }
        if (!criteria.conceptIds().isEmpty()) {
            predicates.add(concept.get("id").in(criteria.conceptIds()));
        }
        if (!criteria.levels().isEmpty()) {
            predicates.add(concept.get("level").in(criteria.levels()));
        }
        if (!criteria.difficulties().isEmpty()) {
            predicates.add(question.get("difficulty").in(criteria.difficulties()));
        }
        if (!criteria.questionTypes().isEmpty()) {
            predicates.add(question.get("questionType").in(criteria.questionTypes()));
        }
        if (criteria.state() == QuizQuestionState.UNSEEN) {
            Subquery<Long> attempts = query.subquery(Long.class);
            Root<Attempt> attempt = attempts.from(Attempt.class);
            attempts.select(builder.literal(1L))
                    .where(builder.equal(attempt.get("question").get("id"), question.get("id")));
            predicates.add(builder.not(builder.exists(attempts)));
        }
        return predicates.toArray(Predicate[]::new);
    }
}
