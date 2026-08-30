package com.guseoh.csforge.quiz.application;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.LearningArea;
import com.guseoh.csforge.learning.domain.Topic;
import com.guseoh.csforge.question.domain.QuestionConcept;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;
import com.guseoh.csforge.quiz.domain.QuizQuestion;

/**
 * 제출된 퀴즈의 전체 및 토픽별 채점 통계를 계산하는 애플리케이션 컴포넌트이다.
 */
@Component
public class QuizResultCalculator {

    public QuizResultView calculate(QuizSessionData data) {
        Counts total = new Counts();
        Map<TopicKey, Counts> breakdown = new LinkedHashMap<>();

        for (QuizQuestion quizQuestion : data.quizQuestions()) {
            long questionId = quizQuestion.getQuestion().getId();
            Attempt attempt = data.requireAttempt(questionId);
            total.add(attempt);

            Set<TopicKey> relatedTopics = relatedTopics(
                    data.conceptsByQuestionId().getOrDefault(questionId, List.of()));
            relatedTopics.forEach(key -> breakdown.computeIfAbsent(key, ignored -> new Counts()).add(attempt));
        }

        List<QuizBreakdownView> breakdownViews = breakdown.entrySet().stream()
                .map(entry -> entry.getValue().toView(entry.getKey()))
                .toList();
        return new QuizResultView(data, total.toSummary(), breakdownViews);
    }

    private Set<TopicKey> relatedTopics(List<QuestionConcept> links) {
        Set<TopicKey> topics = new LinkedHashSet<>();
        for (QuestionConcept link : links) {
            Concept concept = link.getConcept();
            Topic topic = concept.getTopic();
            LearningArea area = topic.getLearningArea();
            topics.add(new TopicKey(area.getSlug(), area.getName(), topic.getSlug(), topic.getTitle()));
        }
        return topics;
    }

    private record TopicKey(String areaSlug, String areaName, String topicSlug, String topicTitle) {
    }

    private static final class Counts {
        private int total;
        private int correct;
        private int wrong;
        private int unanswered;
        private int selfCheckPending;

        void add(Attempt attempt) {
            total++;
            if (attempt.getGradingStatus() == AttemptGradingStatus.SELF_CHECK_REQUIRED) {
                selfCheckPending++;
            } else if (!attempt.hasAnswer()) {
                unanswered++;
            } else if (Boolean.TRUE.equals(attempt.getCorrect())) {
                correct++;
            } else if (attempt.isFinalized()) {
                wrong++;
            }
        }

        QuizResultSummary toSummary() {
            int gradedAnswered = correct + wrong;
            Double accuracy = gradedAnswered == 0 ? null : (double) correct / gradedAnswered;
            return new QuizResultSummary(total, correct, wrong, unanswered, selfCheckPending, accuracy);
        }

        QuizBreakdownView toView(TopicKey key) {
            return new QuizBreakdownView(
                    key.areaSlug(),
                    key.areaName(),
                    key.topicSlug(),
                    key.topicTitle(),
                    total,
                    correct,
                    wrong,
                    unanswered,
                    selfCheckPending);
        }
    }
}
