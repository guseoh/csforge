package com.guseoh.csforge.review.api;

import java.time.Clock;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.review.application.ReviewCommandService;
import com.guseoh.csforge.review.application.ReviewDueWindow;
import com.guseoh.csforge.review.application.ReviewListCriteria;
import com.guseoh.csforge.review.application.ReviewQuizMode;
import com.guseoh.csforge.review.application.ReviewQuizSetupCommand;
import com.guseoh.csforge.review.application.ReviewQueryService;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;
import jakarta.validation.Valid;

/**
 * 복습 요약, 일정, 퀴즈 시작 HTTP API이다.
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewQueryService queryService;
    private final ReviewCommandService commandService;
    private final ReviewApiMapper apiMapper;
    private final Clock clock;

    @GetMapping("/summary")
    public ReviewSummaryResponse summary() {
        return apiMapper.toResponse(queryService.summary());
    }

    @GetMapping
    public ReviewListResponse list(
            @RequestParam(defaultValue = "ALL") ReviewDueWindow due,
            @RequestParam(defaultValue = "SCHEDULED") ReviewScheduleStatus status,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) Long topic,
            @RequestParam(required = false) Short level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (page < 0) throw new IllegalArgumentException("page must not be negative");
        int boundedSize = bounded(size);
        return apiMapper.toResponse(queryService.list(new ReviewListCriteria(due, status, area, topic, level, java.time.Instant.now(clock)), page, boundedSize));
    }

    @PostMapping("/quizzes")
    public ResponseEntity<ReviewQuizCreatedResponse> createQuiz(@Valid @RequestBody(required = false) ReviewQuizRequest request) {
        int count = request == null || request.count() == null ? 10 : request.count();
        ReviewQuizMode mode = request == null || request.mode() == null || request.mode().isBlank()
                ? ReviewQuizMode.DUE : ReviewQuizMode.valueOf(request.mode().trim().toUpperCase());
        return ResponseEntity.status(HttpStatus.CREATED).body(apiMapper.toResponse(commandService.createQuiz(new ReviewQuizSetupCommand(count, mode))));
    }

    @PostMapping("/questions/{questionId}/schedule")
    public ReviewScheduledResponse schedule(@PathVariable long questionId) {
        return apiMapper.toResponse(commandService.schedule(questionId));
    }

    private static int bounded(int size) {
        if (size < 1 || size > 50) throw new IllegalArgumentException("size must be between 1 and 50");
        return size;
    }
}
