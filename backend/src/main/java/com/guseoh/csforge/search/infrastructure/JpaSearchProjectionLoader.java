package com.guseoh.csforge.search.infrastructure;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptReference;
import com.guseoh.csforge.learning.domain.ContentStatus;
import com.guseoh.csforge.learning.domain.PersonalNote;
import com.guseoh.csforge.learning.domain.Reference;
import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionStatus;
import com.guseoh.csforge.search.application.SearchDocumentRef;
import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchProjectionBatch;
import com.guseoh.csforge.search.application.SearchProjectionBatchLoader;
import com.guseoh.csforge.search.application.SearchProjectionDocument;
import com.guseoh.csforge.search.application.SearchProjectionLoader;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/** 각 Search 문서 타입의 최신 PostgreSQL 상태를 explicit query로 조립하며 grading answer는 조회하지 않는다. */
@Repository
public class JpaSearchProjectionLoader implements SearchProjectionLoader, SearchProjectionBatchLoader {

    private static final int MAX_REINDEX_BATCH_SIZE = 1000;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<SearchProjectionDocument> load(SearchDocumentRef ref) {
        return switch (ref.documentType()) {
            case CONCEPT -> loadConcept(ref.sourceId());
            case QUESTION -> loadQuestion(ref.sourceId());
            case PERSONAL_NOTE -> loadPersonalNote(ref.sourceId());
            case WRONG_NOTE -> loadWrongNote(ref.sourceId());
            case REFERENCE -> loadReference(ref.sourceId());
        };
    }

    @Override
    @Transactional(readOnly = true)
    public SearchProjectionBatch loadAfter(SearchDocumentType documentType, long afterSourceId, int limit) {
        if (documentType == null || afterSourceId < 0 || limit < 1 || limit > MAX_REINDEX_BATCH_SIZE) {
            throw new IllegalArgumentException("Invalid search projection batch request");
        }
        List<Long> ids = findSearchableIds(documentType, afterSourceId, limit);
        if (ids.isEmpty()) return new SearchProjectionBatch(afterSourceId, 0, List.of());
        List<SearchProjectionDocument> documents = switch (documentType) {
            case CONCEPT -> loadConceptBatch(ids);
            case QUESTION -> loadQuestionBatch(ids);
            case PERSONAL_NOTE -> loadPersonalNoteBatch(ids);
            case WRONG_NOTE -> loadWrongNoteBatch(ids);
            case REFERENCE -> loadReferenceBatch(ids);
        };
        documents = documents.stream()
                .sorted(java.util.Comparator.comparingLong(document -> document.ref().sourceId()))
                .toList();
        return new SearchProjectionBatch(ids.getLast(), ids.size(), documents);
    }

    private Optional<SearchProjectionDocument> loadConcept(long conceptId) {
        Concept concept = entityManager.find(Concept.class, conceptId);
        if (concept == null || !isSearchable(concept)) return Optional.empty();
        return Optional.of(conceptDocument(concept));
    }

    private Optional<SearchProjectionDocument> loadQuestion(long questionId) {
        Question question = entityManager.find(Question.class, questionId);
        if (question == null || question.getStatus() != QuestionStatus.PUBLISHED) return Optional.empty();
        List<ConceptContext> contexts = searchableContextsForQuestion(questionId);
        if (contexts.isEmpty()) return Optional.empty();
        return Optional.of(questionDocument(question, contexts));
    }

    private Optional<SearchProjectionDocument> loadPersonalNote(long noteId) {
        PersonalNote note = entityManager.find(PersonalNote.class, noteId);
        if (note == null || note.getContent() == null || note.getContent().isBlank()) return Optional.empty();
        List<Object[]> rows = entityManager.createQuery("""
                select c.id, c.contentKey, c.level, t.contentKey, t.title, a.slug, a.name
                from PersonalNote n
                join n.concept c
                join c.topic t
                join t.learningArea a
                where n.id = :noteId and c.status = :published and t.active = true and a.active = true
                """, Object[].class)
                .setParameter("noteId", noteId)
                .setParameter("published", ContentStatus.PUBLISHED)
                .getResultList();
        if (rows.isEmpty()) return Optional.empty();
        return Optional.of(personalNoteDocument(note, ConceptContext.from(rows.getFirst())));
    }

    private Optional<SearchProjectionDocument> loadWrongNote(long wrongNoteId) {
        WrongNote wrongNote = entityManager.find(WrongNote.class, wrongNoteId);
        if (wrongNote == null || wrongNote.getQuestion().getStatus() != QuestionStatus.PUBLISHED) return Optional.empty();
        List<ConceptContext> contexts = searchableContextsForQuestion(wrongNote.getQuestion().getId());
        if (contexts.isEmpty()) return Optional.empty();
        return Optional.of(wrongNoteDocument(wrongNote, contexts));
    }

    private Optional<SearchProjectionDocument> loadReference(long referenceId) {
        Reference reference = entityManager.find(Reference.class, referenceId);
        if (reference == null) return Optional.empty();
        List<ConceptReference> links = entityManager.createQuery("""
                select l from ConceptReference l
                join fetch l.concept c
                join fetch c.topic t
                join fetch t.learningArea a
                where l.reference.id = :referenceId
                  and c.status = :published
                  and t.active = true
                  and a.active = true
                order by c.id, l.displayOrder
                """, ConceptReference.class)
                .setParameter("referenceId", referenceId)
                .setParameter("published", ContentStatus.PUBLISHED)
                .getResultList();
        if (links.isEmpty()) return Optional.empty();
        return Optional.of(referenceDocument(reference, links));
    }

    private List<Long> findSearchableIds(SearchDocumentType documentType, long afterSourceId, int limit) {
        var query = switch (documentType) {
            case CONCEPT -> entityManager.createQuery("""
                    select c.id from Concept c
                    join c.topic t
                    join t.learningArea a
                    where c.id > :afterId
                      and c.status = :conceptPublished
                      and t.active = true
                      and a.active = true
                    order by c.id
                    """, Long.class)
                    .setParameter("conceptPublished", ContentStatus.PUBLISHED);
            case QUESTION -> entityManager.createQuery("""
                    select q.id from Question q
                    where q.id > :afterId
                      and q.status = :questionPublished
                      and exists (
                          select qc.id from QuestionConcept qc
                          join qc.concept c
                          join c.topic t
                          join t.learningArea a
                          where qc.question = q
                            and c.status = :conceptPublished
                            and t.active = true
                            and a.active = true
                      )
                    order by q.id
                    """, Long.class)
                    .setParameter("questionPublished", QuestionStatus.PUBLISHED)
                    .setParameter("conceptPublished", ContentStatus.PUBLISHED);
            case PERSONAL_NOTE -> entityManager.createQuery("""
                    select n.id from PersonalNote n
                    join n.concept c
                    join c.topic t
                    join t.learningArea a
                    where n.id > :afterId
                      and n.content is not null
                      and trim(n.content) <> ''
                      and c.status = :conceptPublished
                      and t.active = true
                      and a.active = true
                    order by n.id
                    """, Long.class)
                    .setParameter("conceptPublished", ContentStatus.PUBLISHED);
            case WRONG_NOTE -> entityManager.createQuery("""
                    select w.id from WrongNote w
                    join w.question q
                    where w.id > :afterId
                      and q.status = :questionPublished
                      and exists (
                          select qc.id from QuestionConcept qc
                          join qc.concept c
                          join c.topic t
                          join t.learningArea a
                          where qc.question = q
                            and c.status = :conceptPublished
                            and t.active = true
                            and a.active = true
                      )
                    order by w.id
                    """, Long.class)
                    .setParameter("questionPublished", QuestionStatus.PUBLISHED)
                    .setParameter("conceptPublished", ContentStatus.PUBLISHED);
            case REFERENCE -> entityManager.createQuery("""
                    select distinct l.reference.id from ConceptReference l
                    join l.concept c
                    join c.topic t
                    join t.learningArea a
                    where l.reference.id > :afterId
                      and c.status = :conceptPublished
                      and t.active = true
                      and a.active = true
                    order by l.reference.id
                    """, Long.class)
                    .setParameter("conceptPublished", ContentStatus.PUBLISHED);
        };
        return query.setParameter("afterId", afterSourceId).setMaxResults(limit).getResultList();
    }

    private List<SearchProjectionDocument> loadConceptBatch(List<Long> ids) {
        return entityManager.createQuery("""
                select c from Concept c
                join fetch c.topic t
                join fetch t.learningArea a
                where c.id in :ids
                """, Concept.class)
                .setParameter("ids", ids)
                .getResultList().stream()
                .filter(JpaSearchProjectionLoader::isSearchable)
                .map(JpaSearchProjectionLoader::conceptDocument)
                .toList();
    }

    private List<SearchProjectionDocument> loadQuestionBatch(List<Long> ids) {
        List<Question> questions = entityManager.createQuery("""
                select distinct q from Question q
                left join fetch q.choices
                where q.id in :ids and q.status = :published
                """, Question.class)
                .setParameter("ids", ids)
                .setParameter("published", QuestionStatus.PUBLISHED)
                .getResultList();
        Map<Long, List<ConceptContext>> contextsByQuestion = searchableContextsForQuestions(ids);
        return questions.stream()
                .filter(question -> !contextsByQuestion.getOrDefault(question.getId(), List.of()).isEmpty())
                .map(question -> questionDocument(question, contextsByQuestion.get(question.getId())))
                .toList();
    }

    private List<SearchProjectionDocument> loadPersonalNoteBatch(List<Long> ids) {
        List<Object[]> rows = entityManager.createQuery("""
                select n, c.id, c.contentKey, c.level, t.contentKey, t.title, a.slug, a.name
                from PersonalNote n
                join n.concept c
                join c.topic t
                join t.learningArea a
                where n.id in :ids
                  and n.content is not null
                  and trim(n.content) <> ''
                  and c.status = :published
                  and t.active = true
                  and a.active = true
                """, Object[].class)
                .setParameter("ids", ids)
                .setParameter("published", ContentStatus.PUBLISHED)
                .getResultList();
        return rows.stream()
                .map(row -> personalNoteDocument((PersonalNote) row[0], ConceptContext.from(row, 1)))
                .toList();
    }

    private List<SearchProjectionDocument> loadWrongNoteBatch(List<Long> ids) {
        List<WrongNote> wrongNotes = entityManager.createQuery("""
                select w from WrongNote w
                join fetch w.question q
                where w.id in :ids and q.status = :published
                """, WrongNote.class)
                .setParameter("ids", ids)
                .setParameter("published", QuestionStatus.PUBLISHED)
                .getResultList();
        List<Long> questionIds = wrongNotes.stream().map(wrongNote -> wrongNote.getQuestion().getId()).distinct().toList();
        Map<Long, List<ConceptContext>> contextsByQuestion = searchableContextsForQuestions(questionIds);
        return wrongNotes.stream()
                .filter(wrongNote -> !contextsByQuestion.getOrDefault(wrongNote.getQuestion().getId(), List.of()).isEmpty())
                .map(wrongNote -> wrongNoteDocument(wrongNote, contextsByQuestion.get(wrongNote.getQuestion().getId())))
                .toList();
    }

    private List<SearchProjectionDocument> loadReferenceBatch(List<Long> ids) {
        List<ConceptReference> links = entityManager.createQuery("""
                select l from ConceptReference l
                join fetch l.reference r
                join fetch l.concept c
                join fetch c.topic t
                join fetch t.learningArea a
                where r.id in :ids
                  and c.status = :published
                  and t.active = true
                  and a.active = true
                order by r.id, c.id, l.displayOrder
                """, ConceptReference.class)
                .setParameter("ids", ids)
                .setParameter("published", ContentStatus.PUBLISHED)
                .getResultList();
        Map<Long, List<ConceptReference>> linksByReference = new LinkedHashMap<>();
        for (ConceptReference link : links) {
            linksByReference.computeIfAbsent(link.getReference().getId(), ignored -> new ArrayList<>()).add(link);
        }
        List<SearchProjectionDocument> documents = new ArrayList<>();
        for (List<ConceptReference> referenceLinks : linksByReference.values()) {
            Reference reference = referenceLinks.getFirst().getReference();
            documents.add(referenceDocument(reference, referenceLinks));
        }
        return documents;
    }

    private List<ConceptContext> searchableContextsForQuestion(long questionId) {
        return searchableContextsForQuestions(List.of(questionId)).getOrDefault(questionId, List.of());
    }

    private Map<Long, List<ConceptContext>> searchableContextsForQuestions(List<Long> questionIds) {
        if (questionIds.isEmpty()) return Map.of();
        List<Object[]> rows = entityManager.createQuery("""
                select l.question.id, c.id, c.contentKey, c.level, t.contentKey, t.title, a.slug, a.name
                from QuestionConcept l
                join l.concept c
                join c.topic t
                join t.learningArea a
                where l.question.id in :questionIds
                  and c.status = :published
                  and t.active = true
                  and a.active = true
                order by l.question.id, c.id
                """, Object[].class)
                .setParameter("questionIds", questionIds)
                .setParameter("published", ContentStatus.PUBLISHED)
                .getResultList();
        Map<Long, List<ConceptContext>> contexts = new LinkedHashMap<>();
        for (Object[] row : rows) {
            long questionId = ((Number) row[0]).longValue();
            contexts.computeIfAbsent(questionId, ignored -> new ArrayList<>()).add(ConceptContext.from(row, 1));
        }
        return contexts;
    }

    private static SearchProjectionDocument conceptDocument(Concept concept) {
        ConceptContext context = ConceptContext.from(concept);
        return document(
                SearchDocumentType.CONCEPT,
                concept.getId(),
                concept.getTitle(),
                concept.getContentMarkdown(),
                concept.getSummary(),
                List.of(context),
                concept.getUpdatedAt(),
                concept.getId(),
                null,
                null,
                null,
                null,
                null,
                null);
    }

    private static SearchProjectionDocument questionDocument(Question question, List<ConceptContext> contexts) {
        String choices = question.getChoices().stream()
                .sorted(java.util.Comparator.comparingInt(choice -> choice.getDisplayOrder()))
                .map(choice -> choice.getContentMarkdown())
                .reduce("", (left, right) -> left + "\n" + right);
        String body = joinText(question.getPromptMarkdown(), choices, question.getExplanationMarkdown());
        return document(
                SearchDocumentType.QUESTION,
                question.getId(),
                compactTitle(question.getPromptMarkdown()),
                body,
                question.getExplanationMarkdown(),
                contexts,
                question.getUpdatedAt(),
                null,
                question.getId(),
                null,
                question.getQuestionType().name(),
                question.getDifficulty().name(),
                null,
                null);
    }

    private static SearchProjectionDocument personalNoteDocument(PersonalNote note, ConceptContext context) {
        return document(
                SearchDocumentType.PERSONAL_NOTE,
                note.getId(),
                "개인 노트 · " + context.conceptContentKey(),
                note.getContent(),
                note.getContent(),
                List.of(context),
                note.getUpdatedAt(),
                context.conceptId(),
                null,
                null,
                null,
                null,
                null,
                null);
    }

    private static SearchProjectionDocument wrongNoteDocument(WrongNote wrongNote, List<ConceptContext> contexts) {
        String body = joinText(wrongNote.getQuestion().getPromptMarkdown(), wrongNote.getCauseNote());
        return document(
                SearchDocumentType.WRONG_NOTE,
                wrongNote.getId(),
                "오답 노트 · " + compactTitle(wrongNote.getQuestion().getPromptMarkdown()),
                body,
                wrongNote.getCauseNote(),
                contexts,
                wrongNote.getUpdatedAt(),
                null,
                wrongNote.getQuestion().getId(),
                null,
                null,
                wrongNote.getQuestion().getDifficulty().name(),
                wrongNote.getStatus().name(),
                wrongNote.getWrongCount());
    }

    private static SearchProjectionDocument referenceDocument(Reference reference, List<ConceptReference> links) {
        List<ConceptContext> contexts = links.stream().map(link -> ConceptContext.from(link.getConcept())).toList();
        String relationNotes = links.stream().map(ConceptReference::getRelationNote).filter(java.util.Objects::nonNull)
                .reduce("", (left, right) -> left + "\n" + right);
        return document(
                SearchDocumentType.REFERENCE,
                reference.getId(),
                reference.getTitle(),
                joinText(reference.getUrl(), reference.getRecommendation(), relationNotes),
                reference.getRecommendation(),
                contexts,
                reference.getUpdatedAt(),
                null,
                null,
                reference.getUrl(),
                null,
                null,
                null,
                null);
    }

    private static boolean isSearchable(Concept concept) {
        return concept.getStatus() == ContentStatus.PUBLISHED
                && concept.getTopic().isActive()
                && concept.getTopic().getLearningArea().isActive();
    }

    private static SearchProjectionDocument document(
            SearchDocumentType type,
            long sourceId,
            String title,
            String body,
            String summary,
            List<ConceptContext> contexts,
            Instant updatedAt,
            Long conceptId,
            Long questionId,
            String referenceUrl,
            String questionType,
            String difficulty,
            String wrongNoteStatus,
            Integer wrongCount) {
        List<ConceptContext> uniqueContexts = deduplicate(contexts);
        return new SearchProjectionDocument(
                new SearchDocumentRef(type, sourceId),
                title,
                body,
                summary,
                uniqueContexts.stream().map(ConceptContext::areaSlug).distinct().toList(),
                uniqueContexts.stream().map(ConceptContext::areaName).distinct().toList(),
                uniqueContexts.stream().map(ConceptContext::topicContentKey).distinct().toList(),
                uniqueContexts.stream().map(ConceptContext::topicTitle).distinct().toList(),
                uniqueContexts.stream().map(ConceptContext::conceptId).distinct().toList(),
                uniqueContexts.stream().map(ConceptContext::conceptContentKey).distinct().toList(),
                uniqueContexts.stream().map(ConceptContext::level).distinct().toList(),
                updatedAt,
                conceptId,
                questionId,
                referenceUrl,
                questionType,
                difficulty,
                wrongNoteStatus,
                wrongCount);
    }

    private static List<ConceptContext> deduplicate(List<ConceptContext> contexts) {
        Map<Long, ConceptContext> byId = new LinkedHashMap<>();
        contexts.forEach(context -> byId.putIfAbsent(context.conceptId(), context));
        return new ArrayList<>(byId.values());
    }

    private static String compactTitle(String markdown) {
        if (markdown == null || markdown.isBlank()) return "문제";
        String compact = markdown.replaceAll("\\s+", " ").trim();
        return compact.length() <= 120 ? compact : compact.substring(0, 117) + "...";
    }

    private static String joinText(String... values) {
        return java.util.Arrays.stream(values).filter(java.util.Objects::nonNull).filter(value -> !value.isBlank())
                .collect(java.util.stream.Collectors.joining("\n"));
    }

    private record ConceptContext(
            long conceptId,
            String conceptContentKey,
            int level,
            String topicContentKey,
            String topicTitle,
            String areaSlug,
            String areaName) {

        static ConceptContext from(Concept concept) {
            return new ConceptContext(
                    concept.getId(),
                    concept.getContentKey(),
                    concept.getLevel(),
                    concept.getTopic().getContentKey(),
                    concept.getTopic().getTitle(),
                    concept.getTopic().getLearningArea().getSlug(),
                    concept.getTopic().getLearningArea().getName());
        }

        static ConceptContext from(Object[] row) {
            return from(row, 0);
        }

        static ConceptContext from(Object[] row, int offset) {
            return new ConceptContext(
                    ((Number) row[offset]).longValue(),
                    (String) row[offset + 1],
                    ((Number) row[offset + 2]).intValue(),
                    (String) row[offset + 3],
                    (String) row[offset + 4],
                    (String) row[offset + 5],
                    (String) row[offset + 6]);
        }
    }
}
