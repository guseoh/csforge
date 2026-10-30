package com.guseoh.csforge.quiz.domain;

import lombok.Getter;

import com.guseoh.csforge.question.domain.Question;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * 퀴즈 세션에 포함된 문제와 고정된 출제 순서를 표현하는 도메인 엔티티이다.
 */
@Getter
@Entity
@Table(name = "quiz_question", uniqueConstraints = {
        @UniqueConstraint(name = "uq_quiz_question_session_question", columnNames = {"quiz_session_id", "question_id"}),
        @UniqueConstraint(name = "uq_quiz_question_session_position", columnNames = {"quiz_session_id", "position"})
})
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_session_id", nullable = false)
    private QuizSession quizSession;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false)
    private int position;

    protected QuizQuestion() {
    }

    private QuizQuestion(QuizSession quizSession, Question question, int position) {
        if (quizSession == null || question == null) {
            throw new IllegalArgumentException("quizSession and question are required");
        }
        if (position < 0) {
            throw new IllegalArgumentException("position must be non-negative");
        }
        this.quizSession = quizSession;
        this.question = question;
        this.position = position;
    }

    public static QuizQuestion place(QuizSession quizSession, Question question, int position) {
        return new QuizQuestion(quizSession, question, position);
    }
}
