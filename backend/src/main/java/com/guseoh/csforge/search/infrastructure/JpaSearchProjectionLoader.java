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
import com.guseoh.csforge.search.application.SearchProjectionDocument;
import com.guseoh.csforge.search.application.SearchProjectionLoader;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

/** 각 Search 문서 타입의 최신 PostgreSQL 상태를 explicit query로 조립하며 grading answer는 조회하지 않는다. */
@Repository
public class JpaSearchProjectionLoader implements SearchProjectionLoader {

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

    private Optional<SearchProjectionDocument> loadConcept(long conceptId) {
        Concept concept = entityManager.find(Concept.class, conceptId);
        if (concept == null || !isSearchable(concept)) return Optional.empty();
        ConceptContext context = ConceptContext.from(concept);
        return Optional.of(document(
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
                null));
    }

    private Optional<SearchProjectionDocument> loadQuestion(long questionId) {
        Question question = entityManager.find(Question.class, questionId);
        if (question == null || question.getStatus() != QuestionStatus.PUBLISHED) return Optional.empty();
        List<ConceptContext> contexts = searchableContextsForQuestion(questionId);
        if (contexts.isEmpty()) return Optional.empty();
        String choices = question.getChoices().stream()
                .sorted(java.util.Comparator.comparingInt(choice -> choice.getDisplayOrder()))
                .map(choice -> choice.getContentMarkdown())
                .reduce("", (left, right) -> left + "\n" + right);
        String body = joinText(question.getPromptMarkdown(), choices, question.getExplanationMarkdown());
        return Optional.of(document(
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
                null));
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
        ConceptContext context = ConceptContext.from(rows.getFirst());
        return Optional.of(document(
                SearchDocumentType.PERSONAL_NOTE,
                noteId,
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
                null));
    }

    private Optional<SearchProjectionDocument> loadWrongNote(long wrongNoteId) {
        WrongNote wrongNote = entityManager.find(WrongNote.class, wrongNoteId);
        if (wrongNote == null || wrongNote.getQuestion().getStatus() != QuestionStatus.PUBLISHED) return Optional.empty();
        List<ConceptContext> contexts = searchableContextsForQuestion(wrongNote.getQuestion().getId());
        if (contexts.isEmpty()) return Optional.empty();
        String body = joinText(wrongNote.getQuestion().getPromptMarkdown(), wrongNote.getCauseNote());
        return Optional.of(document(
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
                wrongNote.getWrongCount()));
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
        List<ConceptContext> contexts = links.stream().map(link -> ConceptContext.from(link.getConcept())).toList();
        String relationNotes = links.stream().map(ConceptReference::getRelationNote).filter(java.util.Objects::nonNull)
                .reduce("", (left, right) -> left + "\n" + right);
        return Optional.of(document(
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
                null));
    }

    private List<ConceptContext> searchableContextsForQuestion(long questionId) {
        List<Object[]> rows = entityManager.createQuery("""
                select c.id, c.contentKey, c.level, t.contentKey, t.title, a.slug, a.name
                from QuestionConcept l
                join l.concept c
                join c.topic t
                join t.learningArea a
                where l.question.id = :questionId
                  and c.status = :published
                  and t.active = true
                  and a.active = true
                order by c.id
                """, Object[].class)
                .setParameter("questionId", questionId)
                .setParameter("published", ContentStatus.PUBLISHED)
                .getResultList();
        return rows.stream().map(ConceptContext::from).toList();
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
            return new ConceptContext(
                    ((Number) row[0]).longValue(),
                    (String) row[1],
                    ((Number) row[2]).intValue(),
                    (String) row[3],
                    (String) row[4],
                    (String) row[5],
                    (String) row[6]);
        }
    }
}
