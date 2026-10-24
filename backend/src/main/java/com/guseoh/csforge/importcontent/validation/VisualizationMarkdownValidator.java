package com.guseoh.csforge.importcontent.validation;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.guseoh.csforge.importcontent.application.ImportValidationError;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Markdown의 예약 도식 fence를 찾아 기존 코드 블록과 분리하여 검증한다. */
@Component
@RequiredArgsConstructor
public class VisualizationMarkdownValidator {
    private static final Pattern OPENING = Pattern.compile("^ {0,3}(`{3,}|~{3,})(.*)$");
    private static final int MAX_BLOCKS = 8;
    private final LearningVisualizationValidator payloadValidator;

    public List<ImportValidationError> validate(String markdown, String path) {
        if (markdown == null || !markdown.contains("csforge-viz")) return List.of();
        List<ImportValidationError> errors = new ArrayList<>();
        String marker = null;
        boolean visualization = false;
        boolean validInfo = true;
        int count = 0;
        StringBuilder payload = new StringBuilder();
        for (String rawLine : markdown.split("\\R", -1)) {
            // Common quote/list containers may surround a fenced block. JSON indentation is immaterial.
            String line = rawLine.replaceFirst("^\\s*(?:> ?)+", "")
                    .replaceFirst("^\\s*(?:(?:[-+*]|\\d+[.)]) +)+", "");
            if (marker == null) {
                Matcher opening = OPENING.matcher(line);
                if (!opening.matches()) {
                    // Conservatively validate reserved declarations in deeply indented list content too.
                    // Literal examples of this reserved language belong inside an outer ordinary fence.
                    opening = OPENING.matcher(line.stripLeading());
                    if (!opening.matches() || !opening.group(2).strip().matches("csforge-viz(?:[ \\t].*)?")) continue;
                }
                String info = opening.group(2).strip();
                // A backtick cannot occur in a backtick fence's info string.
                if (opening.group(1).charAt(0) == '`' && info.contains("`")) continue;
                marker = opening.group(1);
                visualization = info.equals("csforge-viz") || info.startsWith("csforge-viz ") || info.startsWith("csforge-viz\t");
                validInfo = info.equals("csforge-viz");
                payload.setLength(0);
                if (visualization && ++count > MAX_BLOCKS) {
                    errors.add(new ImportValidationError(path, "학습 도식은 필드당 최대 8개입니다"));
                    return errors;
                }
            } else if ((visualization ? line.stripLeading() : line).matches(" {0,3}" + Pattern.quote(marker.substring(0, 1)) + "{" + marker.length() + ",}[ \\t]*")) {
                if (visualization && (!validInfo || !payloadValidator.isValid(payload.toString()))) {
                    errors.add(error(path, count));
                }
                marker = null;
            } else if (visualization && payload.length() <= LearningVisualizationValidator.MAX_SOURCE_LENGTH) {
                int remaining = LearningVisualizationValidator.MAX_SOURCE_LENGTH + 1 - payload.length();
                payload.append(line, 0, Math.min(line.length(), remaining)).append('\n');
            }
        }
        if (marker != null && visualization) errors.add(error(path, count));
        return errors;
    }

    private static ImportValidationError error(String path, int index) {
        return new ImportValidationError(path + ".visualizations[" + (index - 1) + "]",
                "csforge-viz의 JSON, version/type, 필수 설명, 허용 필드·범위 및 닫는 fence를 확인하세요");
    }
}
