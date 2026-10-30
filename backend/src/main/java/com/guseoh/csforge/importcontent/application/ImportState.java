package com.guseoh.csforge.importcontent.application;

import java.util.Map;
import java.util.Set;
import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptReference;
import com.guseoh.csforge.learning.domain.LearningArea;
import com.guseoh.csforge.learning.domain.Reference;
import com.guseoh.csforge.learning.domain.Topic;
import com.guseoh.csforge.question.domain.Question;

/** 한 preview가 참조한 bounded canonical 현재 상태이다. */
public record ImportState(Map<String, LearningArea> areas, Map<String, Topic> topics,
        Map<String, Concept> concepts, Map<String, Question> questions, Map<String, Reference> references,
        Map<Long, java.util.List<ConceptReference>> conceptReferences, Set<Long> questionIdsWithAttempts,
        Map<String, Topic> topicSlugConflicts, Map<String, Concept> conceptSlugConflicts) {
    public ImportState {
        areas = Map.copyOf(areas); topics = Map.copyOf(topics); concepts = Map.copyOf(concepts);
        questions = Map.copyOf(questions); references = Map.copyOf(references);
        conceptReferences = Map.copyOf(conceptReferences); questionIdsWithAttempts = Set.copyOf(questionIdsWithAttempts);
        topicSlugConflicts = Map.copyOf(topicSlugConflicts); conceptSlugConflicts = Map.copyOf(conceptSlugConflicts);
    }
}
