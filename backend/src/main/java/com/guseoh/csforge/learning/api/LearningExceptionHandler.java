package com.guseoh.csforge.learning.api;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.guseoh.csforge.learning.application.LearningBadRequestException;
import com.guseoh.csforge.learning.application.LearningNotFoundException;

@RestControllerAdvice
public class LearningExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(LearningExceptionHandler.class);

    @ExceptionHandler(LearningNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(LearningNotFoundException exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, "LEARNING_NOT_FOUND", exception.getMessage(), request, List.of());
    }

    @ExceptionHandler({
            LearningBadRequestException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<ApiError> handleBadRequest(Exception exception, HttpServletRequest request) {
        String message = exception instanceof HttpMessageNotReadableException
                ? "Request contains an invalid value"
                : exception.getMessage();
        return error(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", message, request, List.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        List<ApiError.FieldViolation> fields = exception.getBindingResult().getFieldErrors().stream()
                .map(field -> new ApiError.FieldViolation(field.getField(), field.getDefaultMessage()))
                .toList();
        return error(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Request validation failed", request, fields);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleConflict(
            DataIntegrityViolationException exception,
            HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, "LEARNING_CONFLICT", "The requested learning state conflicts with existing data", request, List.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception exception, HttpServletRequest request) {
        log.error("Unhandled learning API error", exception);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "LEARNING_ERROR", "Unexpected learning API error", request, List.of());
    }

    private ResponseEntity<ApiError> error(
            HttpStatus status,
            String code,
            String message,
            HttpServletRequest request,
            List<ApiError.FieldViolation> fields) {
        ApiError body = new ApiError(Instant.now(), status.value(), code, message, request.getRequestURI(), fields);
        return ResponseEntity.status(status).body(body);
    }
}
