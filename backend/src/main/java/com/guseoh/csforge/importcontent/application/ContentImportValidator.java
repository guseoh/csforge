package com.guseoh.csforge.importcontent.application;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Component;
import com.guseoh.csforge.learning.domain.ContentStatus;
import com.guseoh.csforge.learning.domain.ReferenceType;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.question.domain.QuestionDifficulty;

/** 파싱된 item의 cross-file 참조와 domain 입력을 검증한다. */
@Component
public class ContentImportValidator {
    public List<NormalizedImportItem> validate(List<NormalizedImportItem> items) {
        Set<String> topics = new HashSet<>(); Set<String> concepts = new HashSet<>();
        items.stream().filter(i -> i.kind() == ImportItemKind.TOPIC && !i.isError()).map(NormalizedImportItem::contentKey).forEach(topics::add);
        items.stream().filter(i -> i.kind() == ImportItemKind.CONCEPT && !i.isError()).map(NormalizedImportItem::contentKey).forEach(concepts::add);
        Map<String, NormalizedImportItem> definitions = new java.util.HashMap<>(); List<NormalizedImportItem> result = new ArrayList<>();
        for (NormalizedImportItem item : items) {
            List<ImportValidationError> errors = new ArrayList<>(item.errors());
            if (item.isSkipped()) { result.add(item); continue; }
            if (item.contentKey() != null) {
                String identity = item.kind() + ":" + item.contentKey();
                NormalizedImportItem previous = definitions.putIfAbsent(identity, item);
                if (previous != null && !previous.sameCanonicalPayload(item)) errors.add(new ImportValidationError("contentKey", "충돌하는 contentKey가 같은 batch에 중복되었습니다"));
            }
            if (item.kind() == ImportItemKind.TOPIC) {
                if (item.areaSlug() == null) errors.add(new ImportValidationError("areaSlug", "필수입니다"));
                if (item.title() == null) errors.add(new ImportValidationError("title", "필수입니다"));
            } else if (item.kind() == ImportItemKind.CONCEPT) {
                // Existing Topic existence is checked after the bounded DB preload.
                validateStatus(item.status(), errors);
            } else if (item.kind() == ImportItemKind.QUESTION) validateQuestion(item, concepts, errors);
            for (NormalizedReference ref : item.references()) {
                try { ReferenceType.valueOf(ref.referenceType()); } catch (Exception e) { errors.add(new ImportValidationError("references.referenceType", "지원하지 않는 referenceType입니다")); }
            }
            result.add(copyWithErrors(item, errors));
        }
        return result;
    }

    private void validateQuestion(NormalizedImportItem item, Set<String> concepts, List<ImportValidationError> errors) {
        // Existing Concept existence is checked after the bounded DB preload.
        QuestionType type = null; try { type = QuestionType.valueOf(item.questionType()); } catch (Exception e) { errors.add(new ImportValidationError("questionType", "지원하지 않는 questionType입니다")); }
        try { QuestionDifficulty.valueOf(item.difficulty()); } catch (Exception e) { errors.add(new ImportValidationError("difficulty", "지원하지 않는 difficulty입니다")); }
        validateStatus(item.status(), errors);
        Set<String> choiceKeys = new HashSet<>(); Set<Integer> orders = new HashSet<>();
        for (NormalizedChoice choice : item.choices()) {
            if (!choiceKeys.add(choice.key())) errors.add(new ImportValidationError("choices.key", "choice key가 중복되었습니다"));
            if (!orders.add(choice.displayOrder())) errors.add(new ImportValidationError("choices.displayOrder", "choice displayOrder가 중복되었습니다"));
        }
        Set<String> acceptedAnswers = new HashSet<>();
        for (String answer : item.acceptedAnswers()) {
            if (!acceptedAnswers.add(answer.toLowerCase(Locale.ROOT))) errors.add(new ImportValidationError("acceptedAnswers", "accepted answer가 중복되었습니다"));
        }
        if ("PUBLISHED".equals(item.status()) && type != null) {
            switch (type) {
                case MULTIPLE_CHOICE -> { if (item.choices().size() < 2) errors.add(new ImportValidationError("choices", "공개 객관식은 선택지 2개 이상이 필요합니다")); if (item.correctChoiceKey() == null || !choiceKeys.contains(item.correctChoiceKey())) errors.add(new ImportValidationError("correctChoiceKey", "공개 객관식은 유효한 정답 선택지가 필요합니다")); }
                case SHORT_ANSWER -> { if (item.acceptedAnswers().isEmpty()) errors.add(new ImportValidationError("acceptedAnswers", "공개 단답형은 허용 답안이 필요합니다")); }
                case DESCRIPTIVE, SCENARIO -> { if (item.modelAnswer() == null) errors.add(new ImportValidationError("modelAnswer", "공개 서술형은 모범 답안이 필요합니다")); }
            }
        }
    }

    private static void validateStatus(String status, List<ImportValidationError> errors) { try { ContentStatus.valueOf(status); } catch (Exception e) { errors.add(new ImportValidationError("status", "지원하지 않는 status입니다")); } }

    private static NormalizedImportItem copyWithErrors(NormalizedImportItem i, List<ImportValidationError> errors) {
        return new NormalizedImportItem(i.fileName(), i.itemIndex(), i.kind(), i.contentKey(), i.areaSlug(), i.topicContentKey(), i.slug(), i.title(), i.description(), i.summary(), i.contentMarkdown(), i.level(), i.status(), i.displayOrder(), i.active(), i.references(), i.referencesDeclared(), i.promptMarkdown(), i.questionType(), i.difficulty(), i.explanationMarkdown(), i.conceptKeys(), i.choices(), i.correctChoiceKey(), i.acceptedAnswers(), i.modelAnswer(), errors, i.skipReason());
    }
}
