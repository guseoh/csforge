package com.guseoh.csforge.importcontent.application;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptReferenceRepository;
import com.guseoh.csforge.learning.domain.ConceptRepository;
import com.guseoh.csforge.learning.domain.LearningArea;
import com.guseoh.csforge.learning.domain.LearningAreaRepository;
import com.guseoh.csforge.learning.domain.Reference;
import com.guseoh.csforge.learning.domain.ReferenceRepository;
import com.guseoh.csforge.learning.domain.Topic;
import com.guseoh.csforge.learning.domain.TopicRepository;
import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionRepository;
import com.guseoh.csforge.quiz.domain.AttemptRepository;

/** 입력에서 참조하는 canonical aggregate만 묶음 조회한다. */
@Component
@RequiredArgsConstructor
public class ContentImportStateLoader {
    private final LearningAreaRepository areaRepository;
    private final TopicRepository topicRepository;
    private final ConceptRepository conceptRepository;
    private final ReferenceRepository referenceRepository;
    private final QuestionRepository questionRepository;
    private final ConceptReferenceRepository conceptReferenceRepository;
    private final AttemptRepository attemptRepository;

    public ImportState load(List<NormalizedImportItem> items) {
        Set<String> areas = new HashSet<>(); Set<String> topics = new HashSet<>(); Set<String> concepts = new HashSet<>();
        Set<String> questions = new HashSet<>(); Set<String> urls = new HashSet<>();
        for (NormalizedImportItem item : items) {
            if (item.areaSlug() != null) areas.add(item.areaSlug());
            if (item.topicContentKey() != null) topics.add(item.topicContentKey());
            if (item.contentKey() != null && item.kind() == ImportItemKind.TOPIC) topics.add(item.contentKey());
            if (item.contentKey() != null && item.kind() == ImportItemKind.CONCEPT) concepts.add(item.contentKey());
            if (item.contentKey() != null && item.kind() == ImportItemKind.QUESTION) questions.add(item.contentKey());
            item.conceptKeys().forEach(concepts::add); item.references().forEach(reference -> urls.add(reference.url()));
        }
        Map<String, LearningArea> areaMap = byArea(areaRepository.findBySlugIn(areas));
        Map<String, Topic> topicMap = byTopic(topicRepository.findByContentKeyIn(topics));
        Map<String, Concept> conceptMap = byConcept(conceptRepository.findByContentKeyIn(concepts));
        Map<String, Reference> referenceMap = byReference(referenceRepository.findByUrlIn(urls));
        Map<String, Question> questionMap = byQuestion(questionRepository.findByContentKeyIn(questions));
        Map<Long, List<com.guseoh.csforge.learning.domain.ConceptReference>> links = new HashMap<>();
        if (!conceptMap.isEmpty()) conceptReferenceRepository.findForConceptIds(conceptMap.values().stream().map(Concept::getId).toList())
                .forEach(link -> links.computeIfAbsent(link.getConcept().getId(), ignored -> new java.util.ArrayList<>()).add(link));
        Set<Long> questionIds = questionMap.values().stream().map(Question::getId).collect(java.util.stream.Collectors.toSet());
        Set<Long> attempted = questionIds.isEmpty() ? Set.of() : new HashSet<>(attemptRepository.findQuestionIdsWithAttempts(questionIds));
        return new ImportState(areaMap, topicMap, conceptMap, questionMap, referenceMap, links, attempted);
    }

    private static Map<String, LearningArea> byArea(Collection<LearningArea> values) { Map<String, LearningArea> result = new HashMap<>(); values.forEach(v -> result.put(v.getSlug(), v)); return result; }
    private static Map<String, Topic> byTopic(Collection<Topic> values) { Map<String, Topic> result = new HashMap<>(); values.forEach(v -> result.put(v.getContentKey(), v)); return result; }
    private static Map<String, Concept> byConcept(Collection<Concept> values) { Map<String, Concept> result = new HashMap<>(); values.forEach(v -> result.put(v.getContentKey(), v)); return result; }
    private static Map<String, Reference> byReference(Collection<Reference> values) { Map<String, Reference> result = new HashMap<>(); values.forEach(v -> result.put(v.getUrl(), v)); return result; }
    private static Map<String, Question> byQuestion(Collection<Question> values) { Map<String, Question> result = new HashMap<>(); values.forEach(v -> result.put(v.getContentKey(), v)); return result; }
}
