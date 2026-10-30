package com.guseoh.csforge.quiz.api;

import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

public record QuizSelfCheckResponse(long quizId, long questionId, boolean correct, QuizSessionStatus sessionStatus) {
}
