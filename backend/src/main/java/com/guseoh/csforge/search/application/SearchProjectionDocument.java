package com.guseoh.csforge.search.application;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** PostgreSQL source에서 조립된 Elasticsearch 검색 projection 문서이다. */
public record SearchProjectionDocument(
        SearchDocumentRef ref,
        String title,
        String body,
        String summary,
        List<String> areaSlugs,
        List<String> areaNames,
        List<String> topicContentKeys,
        List<String> topicTitles,
        List<Long> conceptIds,
        List<String> conceptContentKeys,
        List<Integer> levels,
        Instant updatedAt,
        Long conceptId,
        Long questionId,
        String referenceUrl,
        String questionType,
        String difficulty,
        String wrongNoteStatus,
        Integer wrongCount) {

    public Map<String, Object> toSource() {
        Map<String, Object> source = new LinkedHashMap<>();
        source.put("documentKey", ref.documentKey());
        source.put("documentType", ref.documentType().name());
        source.put("sourceId", ref.sourceId());
        source.put("title", title);
        source.put("body", body == null ? "" : body);
        source.put("summary", summary == null ? "" : summary);
        source.put("areaSlugs", areaSlugs);
        source.put("areaNames", areaNames);
        source.put("topicContentKeys", topicContentKeys);
        source.put("topicTitles", topicTitles);
        source.put("conceptIds", conceptIds);
        source.put("conceptContentKeys", conceptContentKeys);
        source.put("levels", levels);
        source.put("updatedAt", updatedAt);
        putIfNotNull(source, "conceptId", conceptId);
        putIfNotNull(source, "questionId", questionId);
        putIfNotNull(source, "referenceUrl", referenceUrl);
        putIfNotNull(source, "questionType", questionType);
        putIfNotNull(source, "difficulty", difficulty);
        putIfNotNull(source, "wrongNoteStatus", wrongNoteStatus);
        putIfNotNull(source, "wrongCount", wrongCount);
        return source;
    }

    private static void putIfNotNull(Map<String, Object> source, String key, Object value) {
        if (value != null) source.put(key, value);
    }
}
