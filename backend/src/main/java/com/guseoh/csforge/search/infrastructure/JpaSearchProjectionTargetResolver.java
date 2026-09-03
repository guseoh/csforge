package com.guseoh.csforge.search.infrastructure;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchDocumentRef;
import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchProjectionTargetResolver;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

/** JPA query로 source 변경의 denormalized Search 문서 의존성을 bounded하게 확장한다. */
@Repository
public class JpaSearchProjectionTargetResolver implements SearchProjectionTargetResolver {

    private static final int CONCEPT_BATCH_SIZE = 200;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Set<SearchDocumentRef> resolve(SearchChangeType changeType, long sourceId) {
        return switch (changeType) {
            case TOPIC -> expandConcepts(findConceptIdsForTopic(sourceId));
            case CONCEPT -> expandConcepts(List.of(sourceId));
            case QUESTION -> questionTargets(sourceId);
            case PERSONAL_NOTE -> Set.of(new SearchDocumentRef(SearchDocumentType.PERSONAL_NOTE, sourceId));
            case WRONG_NOTE -> Set.of(new SearchDocumentRef(SearchDocumentType.WRONG_NOTE, sourceId));
            case REFERENCE -> Set.of(new SearchDocumentRef(SearchDocumentType.REFERENCE, sourceId));
        };
    }

    private Set<SearchDocumentRef> questionTargets(long questionId) {
        Set<SearchDocumentRef> refs = new LinkedHashSet<>();
        refs.add(new SearchDocumentRef(SearchDocumentType.QUESTION, questionId));
        entityManager.createQuery("select w.id from WrongNote w where w.question.id = :questionId", Long.class)
                .setParameter("questionId", questionId)
                .setMaxResults(1)
                .getResultList()
                .stream()
                .findFirst()
                .ifPresent(id -> refs.add(new SearchDocumentRef(SearchDocumentType.WRONG_NOTE, id)));
        return refs;
    }

    private List<Long> findConceptIdsForTopic(long topicId) {
        return entityManager.createQuery("select c.id from Concept c where c.topic.id = :topicId order by c.id", Long.class)
                .setParameter("topicId", topicId)
                .getResultList();
    }

    private Set<SearchDocumentRef> expandConcepts(Collection<Long> conceptIds) {
        Set<SearchDocumentRef> refs = new LinkedHashSet<>();
        List<Long> ids = conceptIds.stream().distinct().sorted().toList();
        for (Long id : ids) refs.add(new SearchDocumentRef(SearchDocumentType.CONCEPT, id));
        for (int start = 0; start < ids.size(); start += CONCEPT_BATCH_SIZE) {
            List<Long> batch = ids.subList(start, Math.min(ids.size(), start + CONCEPT_BATCH_SIZE));
            addRefs(refs, SearchDocumentType.QUESTION, queryIds(
                    "select distinct l.question.id from QuestionConcept l where l.concept.id in :ids", batch));
            addRefs(refs, SearchDocumentType.PERSONAL_NOTE, queryIds(
                    "select n.id from PersonalNote n where n.concept.id in :ids", batch));
            addRefs(refs, SearchDocumentType.REFERENCE, queryIds(
                    "select distinct l.reference.id from ConceptReference l where l.concept.id in :ids", batch));
            addRefs(refs, SearchDocumentType.WRONG_NOTE, queryIds(
                    "select distinct w.id from WrongNote w join w.question q join q.conceptLinks l where l.concept.id in :ids", batch));
        }
        return refs;
    }

    private List<Long> queryIds(String jpql, List<Long> ids) {
        if (ids.isEmpty()) return List.of();
        return entityManager.createQuery(jpql, Long.class).setParameter("ids", ids).getResultList();
    }

    private static void addRefs(Set<SearchDocumentRef> refs, SearchDocumentType type, Collection<Long> ids) {
        ids.stream().distinct().sorted().forEach(id -> refs.add(new SearchDocumentRef(type, id)));
    }
}
