package com.guseoh.csforge.importcontent.validation;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

import com.guseoh.csforge.importcontent.application.ImportValidationError;
import lombok.RequiredArgsConstructor;
import org.commonmark.node.FencedCodeBlock;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.springframework.stereotype.Component;

/** CommonMark AST의 실제 fenced code block만 학습 도식 선언으로 검증한다. */
@Component
@RequiredArgsConstructor
public class VisualizationMarkdownValidator {
    private static final int MAX_BLOCKS = 8;
    private final LearningVisualizationValidator payloadValidator;
    private final Parser parser = Parser.builder().build();

    public List<ImportValidationError> validate(String markdown, String path) {
        if (markdown == null || markdown.isBlank()) return List.of();
        List<ImportValidationError> errors = new ArrayList<>();
        Deque<Node> pending = new ArrayDeque<>();
        pending.push(parser.parse(markdown));
        int count = 0;
        while (!pending.isEmpty()) {
            Node node = pending.pop();
            if (node instanceof FencedCodeBlock block) {
                String info = block.getInfo();
                String language = info.split("\\s+", 2)[0];
                if (!language.equals("csforge-viz")) continue;
                if (++count > MAX_BLOCKS) {
                    errors.add(new ImportValidationError(path, "학습 도식은 필드당 최대 8개입니다"));
                    return errors;
                }
                if (!info.equals("csforge-viz") || block.getClosingFenceLength() == null
                        || !payloadValidator.isValid(block.getLiteral())) {
                    errors.add(error(path, count));
                }
            } else {
                // Iterative traversal preserves document order without recursing through untrusted nesting.
                for (Node child = node.getLastChild(); child != null; child = child.getPrevious()) {
                    pending.push(child);
                }
            }
        }
        return errors;
    }

    private static ImportValidationError error(String path, int index) {
        return new ImportValidationError(path + ".visualizations[" + (index - 1) + "]",
                "csforge-viz의 JSON, version/type, 필수 설명, 허용 필드·범위 및 닫는 fence를 확인하세요");
    }
}
