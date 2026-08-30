package com.guseoh.csforge.importcontent.parser;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;
import tools.jackson.databind.ObjectMapper;

import com.guseoh.csforge.importcontent.application.ImportFilesCommand;
import com.guseoh.csforge.importcontent.application.ImportItemKind;
import com.guseoh.csforge.importcontent.application.ImportSourceFile;
import com.guseoh.csforge.importcontent.application.ImportValidationError;
import com.guseoh.csforge.importcontent.application.NormalizedChoice;
import com.guseoh.csforge.importcontent.application.NormalizedImportItem;
import com.guseoh.csforge.importcontent.application.NormalizedReference;

/** Markdown/JSON 파일을 정규화된 import item으로 변환한다. */
@Component
@RequiredArgsConstructor
public class ContentImportParser {

    private final ObjectMapper objectMapper;
    private final Yaml yaml = new Yaml();

    public List<NormalizedImportItem> parse(ImportFilesCommand command) {
        List<NormalizedImportItem> result = new ArrayList<>();
        for (ImportSourceFile file : command.files()) result.addAll(parseFile(file));
        return result;
    }

    private List<NormalizedImportItem> parseFile(ImportSourceFile file) {
        String name = file.fileName() == null ? "unnamed" : file.fileName();
        String lower = name.toLowerCase(Locale.ROOT);
        if (!lower.endsWith(".md") && !lower.endsWith(".json")) {
            return List.of(errorItem(name, 0, List.of(), "지원하지 않는 파일 형식"));
        }
        try {
            if (lower.endsWith(".md")) return List.of(parseMarkdown(name, file.content()));
            Object parsed = objectMapper.readValue(file.content(), Object.class);
            List<?> objects = parsed instanceof Collection<?> collection ? new ArrayList<>(collection) : List.of(parsed);
            List<NormalizedImportItem> items = new ArrayList<>();
            for (int index = 0; index < objects.size(); index++) {
                Object item = objects.get(index);
                if (!(item instanceof Map<?, ?> map)) {
                    items.add(errorItem(name, index, List.of(new ImportValidationError("$[" + index + "]", "객체여야 합니다")), null));
                } else {
                    items.add(normalize(name, index, castMap(map), null));
                }
            }
            return items;
        } catch (Exception exception) {
            return List.of(errorItem(name, 0, List.of(new ImportValidationError("file", "파일을 파싱할 수 없습니다")), null));
        }
    }

    private NormalizedImportItem parseMarkdown(String fileName, byte[] bytes) {
        String source = new String(bytes, StandardCharsets.UTF_8).replace("\r\n", "\n").replace('\r', '\n');
        if (!source.startsWith("---\n")) {
            return errorItem(fileName, 0, List.of(new ImportValidationError("frontMatter", "YAML front matter가 필요합니다")), null);
        }
        int end = source.indexOf("\n---", 4);
        if (end < 0) return errorItem(fileName, 0, List.of(new ImportValidationError("frontMatter", "front matter 종료가 필요합니다")), null);
        String frontMatter = source.substring(4, end);
        String body = source.substring(end + 4);
        if (body.startsWith("\n")) body = body.substring(1);
        Object parsed = yaml.load(frontMatter);
        if (!(parsed instanceof Map<?, ?> map)) {
            return errorItem(fileName, 0, List.of(new ImportValidationError("frontMatter", "YAML 객체여야 합니다")), null);
        }
        return normalize(fileName, 0, castMap(map), body);
    }

    private NormalizedImportItem normalize(String fileName, int index, Map<String, Object> values, String markdownBody) {
        List<ImportValidationError> errors = new ArrayList<>();
        String kindValue = text(values, "kind");
        ImportItemKind kind = null;
        if (kindValue != null) {
            try { kind = ImportItemKind.valueOf(kindValue.trim().toUpperCase(Locale.ROOT)); }
            catch (IllegalArgumentException ignored) { errors.add(new ImportValidationError("kind", "topic, concept, question 중 하나여야 합니다")); }
        } else errors.add(new ImportValidationError("kind", "필수입니다"));

        String contentKey = text(values, "contentKey");
        if (contentKey == null) errors.add(new ImportValidationError("contentKey", "필수입니다"));
        String slug = text(values, "slug");
        String title = text(values, "title");
        String areaSlug = text(values, "areaSlug");
        String topicKey = text(values, "topicContentKey");
        String body = normalizeMarkdown(markdownBody != null ? markdownBody : text(values, "contentMarkdown"));
        String prompt = normalizeMarkdown(markdownBody != null && kind == ImportItemKind.QUESTION ? markdownBody : text(values, "promptMarkdown"));
        List<String> concepts = strings(values.get("conceptKeys"));
        List<NormalizedReference> refs = references(values.get("references"), errors);
        List<NormalizedChoice> choices = choices(values.get("choices"), errors);
        List<String> accepted = strings(values.get("acceptedAnswers"));
        if (kind == ImportItemKind.TOPIC) require(errors, slug, "slug");
        if (kind == ImportItemKind.CONCEPT) {
            require(errors, topicKey, "topicContentKey"); require(errors, slug, "slug"); require(errors, title, "title");
            require(errors, body, "contentMarkdown"); validateLevel(values.get("level"), errors);
        }
        if (kind == ImportItemKind.QUESTION) {
            require(errors, prompt, "promptMarkdown"); require(errors, text(values, "questionType"), "questionType");
            require(errors, text(values, "difficulty"), "difficulty"); require(errors, titleOrPrompt(values, prompt), "promptMarkdown");
            if (concepts.isEmpty()) errors.add(new ImportValidationError("conceptKeys", "하나 이상 필요합니다"));
        }
        return new NormalizedImportItem(fileName, index, kind, contentKey, areaSlug, topicKey, slug, title,
                text(values, "description"), text(values, "summary"), body, number(values.get("level"), (short) 0),
                upper(values.get("status"), kind == ImportItemKind.QUESTION ? "DRAFT" : "DRAFT"), number(values.get("displayOrder"), 0),
                bool(values.get("active"), true), refs, values.containsKey("references"), prompt, upper(values.get("questionType"), null), upper(values.get("difficulty"), null),
                normalizeMarkdown(text(values, "explanationMarkdown")), concepts, choices, text(values, "correctChoiceKey"), accepted,
                normalizeMarkdown(text(values, "modelAnswer")), errors, null);
    }

    private static String titleOrPrompt(Map<String, Object> values, String prompt) { return text(values, "title") != null ? text(values, "title") : prompt; }
    private static void validateLevel(Object value, List<ImportValidationError> errors) { short level = number(value, (short) 0); if (level < 1 || level > 3) errors.add(new ImportValidationError("level", "1..3 범위여야 합니다")); }
    private static void require(List<ImportValidationError> errors, String value, String path) { if (value == null || value.isBlank()) errors.add(new ImportValidationError(path, "필수입니다")); }
    private static String text(Map<String, Object> values, String key) { Object value = values.get(key); return value == null ? null : String.valueOf(value).trim(); }
    private static String normalizeMarkdown(String value) { return value == null ? null : value.replace("\r\n", "\n").replace('\r', '\n').trim(); }
    private static String upper(Object value, String fallback) { return value == null ? fallback : String.valueOf(value).trim().toUpperCase(Locale.ROOT); }
    private static boolean bool(Object value, boolean fallback) { return value == null ? fallback : Boolean.parseBoolean(String.valueOf(value)); }
    private static short number(Object value, short fallback) { if (value == null) return fallback; try { return Short.parseShort(String.valueOf(value)); } catch (NumberFormatException e) { return fallback; } }
    private static int number(Object value, int fallback) { if (value == null) return fallback; try { return Integer.parseInt(String.valueOf(value)); } catch (NumberFormatException e) { return fallback; } }
    private static List<String> strings(Object value) { if (!(value instanceof Collection<?> c)) return List.of(); return c.stream().map(String::valueOf).map(String::trim).filter(s -> !s.isBlank()).toList(); }

    private static List<NormalizedReference> references(Object value, List<ImportValidationError> errors) {
        if (!(value instanceof Collection<?> collection)) return List.of();
        List<NormalizedReference> result = new ArrayList<>();
        int index = 0;
        for (Object element : collection) {
            if (!(element instanceof Map<?, ?> map)) { errors.add(new ImportValidationError("references[" + index + "]", "객체여야 합니다")); index++; continue; }
            Map<String, Object> v = castMap(map); String url = text(v, "url"); String title = text(v, "title"); String type = upper(v.get("referenceType"), "OTHER");
            if (url == null) errors.add(new ImportValidationError("references[" + index + "].url", "필수입니다"));
            if (title == null) errors.add(new ImportValidationError("references[" + index + "].title", "필수입니다"));
            result.add(new NormalizedReference(url, title, type, text(v, "language"), text(v, "depth"), text(v, "recommendation"), number(v.get("displayOrder"), 0), text(v, "relationNote"))); index++;
        }
        return result;
    }

    private static List<NormalizedChoice> choices(Object value, List<ImportValidationError> errors) {
        if (!(value instanceof Collection<?> collection)) return List.of();
        List<NormalizedChoice> result = new ArrayList<>(); int index = 0;
        for (Object element : collection) {
            if (!(element instanceof Map<?, ?> map)) { errors.add(new ImportValidationError("choices[" + index + "]", "객체여야 합니다")); index++; continue; }
            Map<String, Object> v = castMap(map); String key = text(v, "key"); String content = text(v, "content");
            if (key == null) errors.add(new ImportValidationError("choices[" + index + "].key", "필수입니다"));
            if (content == null) errors.add(new ImportValidationError("choices[" + index + "].content", "필수입니다"));
            result.add(new NormalizedChoice(key, normalizeMarkdown(content), number(v.get("displayOrder"), index))); index++;
        }
        return result;
    }

    private static NormalizedImportItem errorItem(String fileName, int index, List<ImportValidationError> errors, String skipReason) {
        return new NormalizedImportItem(fileName, index, null, null, null, null, null, null, null, null, null, (short) 0, null, 0, true, List.of(), false, null, null, null, null, List.of(), List.of(), null, List.of(), null, errors, skipReason);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> castMap(Map<?, ?> map) { Map<String, Object> result = new LinkedHashMap<>(); map.forEach((key, value) -> result.put(String.valueOf(key), value)); return result; }
}
