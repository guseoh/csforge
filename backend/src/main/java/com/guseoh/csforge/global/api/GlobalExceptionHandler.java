package com.guseoh.csforge.global.api;

import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.importcontent.application.ImportBoundsException;
import com.guseoh.csforge.importcontent.application.ImportPreviewStaleException;
import com.guseoh.csforge.ai.application.AiProviderNotConfiguredException;
import com.guseoh.csforge.ai.application.WrongAnswerAnalysisEligibilityException;
import com.guseoh.csforge.ai.application.WrongAnswerAnalysisInvalidStateException;
import com.guseoh.csforge.learning.application.LearningBadRequestException;
import com.guseoh.csforge.learning.application.LearningNotFoundException;
import com.guseoh.csforge.quiz.application.InsufficientQuestionsException;
import com.guseoh.csforge.quiz.application.NoWrongQuestionsException;
import com.guseoh.csforge.quiz.application.QuizNotFoundException;
import com.guseoh.csforge.quiz.domain.QuizAnswerException;
import com.guseoh.csforge.quiz.domain.QuizExpiredException;
import com.guseoh.csforge.quiz.domain.QuizInvalidStateException;
import com.guseoh.csforge.review.application.NoDueReviewsException;
import com.guseoh.csforge.review.application.ReviewQuestionNotFoundException;
import com.guseoh.csforge.search.application.SearchNotReadyException;
import com.guseoh.csforge.search.application.SearchReindexInProgressException;
import com.guseoh.csforge.search.application.SearchUnavailableException;
import com.guseoh.csforge.wrongnote.application.WrongNoteNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/** 애플리케이션 예외를 일관된 HTTP 오류 응답으로 변환하는 전역 예외 처리기이다. */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(LearningNotFoundException.class)
    public ResponseEntity<ApiError> handleLearningNotFound(LearningNotFoundException exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, "LEARNING_NOT_FOUND", exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(QuizNotFoundException.class)
    public ResponseEntity<ApiError> handleQuizNotFound(QuizNotFoundException exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, "QUIZ_NOT_FOUND", exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(WrongNoteNotFoundException.class)
    public ResponseEntity<ApiError> handleWrongNoteNotFound(WrongNoteNotFoundException exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, "WRONG_NOTE_NOT_FOUND", "Wrong note was not found", request, List.of());
    }

    @ExceptionHandler(AiProviderNotConfiguredException.class)
    public ResponseEntity<ApiError> handleAiProviderNotConfigured(
            AiProviderNotConfiguredException exception,
            HttpServletRequest request) {
        return error(HttpStatus.SERVICE_UNAVAILABLE, "AI_PROVIDER_NOT_CONFIGURED",
                "AI analysis is not configured", request, List.of());
    }

    @ExceptionHandler(WrongAnswerAnalysisEligibilityException.class)
    public ResponseEntity<ApiError> handleAiAnalysisEligibility(
            WrongAnswerAnalysisEligibilityException exception,
            HttpServletRequest request) {
        return error(HttpStatus.UNPROCESSABLE_CONTENT, "AI_ANALYSIS_NOT_ELIGIBLE",
                exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(WrongAnswerAnalysisInvalidStateException.class)
    public ResponseEntity<ApiError> handleAiAnalysisState(
            WrongAnswerAnalysisInvalidStateException exception,
            HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, "AI_ANALYSIS_INVALID_STATE",
                exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(ReviewQuestionNotFoundException.class)
    public ResponseEntity<ApiError> handleReviewQuestionNotFound(ReviewQuestionNotFoundException exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, "REVIEW_QUESTION_NOT_FOUND", exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(NoDueReviewsException.class)
    public ResponseEntity<ApiError> handleNoDueReviews(NoDueReviewsException exception, HttpServletRequest request) {
        return error(HttpStatus.UNPROCESSABLE_CONTENT, "REVIEW_NO_DUE_ITEMS", "No due reviews are available", request, List.of());
    }

    @ExceptionHandler(InsufficientQuestionsException.class)
    public ResponseEntity<ApiError> handleInsufficientQuestions(InsufficientQuestionsException exception, HttpServletRequest request) {
        return error(HttpStatus.UNPROCESSABLE_CONTENT, "QUIZ_INSUFFICIENT_QUESTIONS", exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(NoWrongQuestionsException.class)
    public ResponseEntity<ApiError> handleNoWrongQuestions(NoWrongQuestionsException exception, HttpServletRequest request) {
        return error(HttpStatus.UNPROCESSABLE_CONTENT, "QUIZ_NO_WRONG_QUESTIONS", exception.getMessage(), request, List.of());
    }

    @ExceptionHandler({
            LearningBadRequestException.class,
            QuizAnswerException.class,
            IllegalArgumentException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<ApiError> handleBadRequest(Exception exception, HttpServletRequest request) {
        String message = exception instanceof HttpMessageNotReadableException ? "Request contains an invalid value" : exception.getMessage();
        return error(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", message, request, List.of());
    }

    @ExceptionHandler(QuizExpiredException.class)
    public ResponseEntity<ApiError> handleQuizExpired(QuizExpiredException exception, HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, "QUIZ_EXPIRED", exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(ImportPreviewStaleException.class)
    public ResponseEntity<ApiError> handleImportPreviewStale(ImportPreviewStaleException exception, HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, "IMPORT_PREVIEW_STALE", exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(ImportBoundsException.class)
    public ResponseEntity<ApiError> handleImportBounds(ImportBoundsException exception, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, "IMPORT_BOUNDS_EXCEEDED", exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(QuizInvalidStateException.class)
    public ResponseEntity<ApiError> handleQuizState(QuizInvalidStateException exception, HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, "QUIZ_INVALID_STATE", exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(SearchReindexInProgressException.class)
    public ResponseEntity<ApiError> handleSearchReindexInProgress(
            SearchReindexInProgressException exception,
            HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, "SEARCH_REINDEX_IN_PROGRESS", exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(SearchNotReadyException.class)
    public ResponseEntity<ApiError> handleSearchNotReady(SearchNotReadyException exception, HttpServletRequest request) {
        return error(HttpStatus.SERVICE_UNAVAILABLE, "SEARCH_NOT_READY", exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(SearchUnavailableException.class)
    public ResponseEntity<ApiError> handleSearchUnavailable(SearchUnavailableException exception, HttpServletRequest request) {
        return error(HttpStatus.SERVICE_UNAVAILABLE, "SEARCH_UNAVAILABLE", exception.getMessage(), request, List.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        List<FieldViolationResponse> fields = exception.getBindingResult().getFieldErrors().stream()
                .map(field -> new FieldViolationResponse(field.getField(), field.getDefaultMessage()))
                .toList();
        return error(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Request validation failed", request, fields);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleConflict(DataIntegrityViolationException exception, HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, "DATA_CONFLICT", "The requested state conflicts with existing data", request, List.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception exception, HttpServletRequest request) {
        log.error("Unhandled API error", exception);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "API_ERROR", "Unexpected API error", request, List.of());
    }

    private ResponseEntity<ApiError> error(
            HttpStatus status,
            String code,
            String message,
            HttpServletRequest request,
            List<FieldViolationResponse> fields) {
        ApiError body = new ApiError(Instant.now(), status.value(), code, message, request.getRequestURI(), fields);
        return ResponseEntity.status(status).body(body);
    }
}
