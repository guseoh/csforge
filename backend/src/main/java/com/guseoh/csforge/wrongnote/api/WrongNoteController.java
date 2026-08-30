package com.guseoh.csforge.wrongnote.api;

import java.time.Clock;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.guseoh.csforge.quiz.api.QuizApiMapper;
import com.guseoh.csforge.quiz.api.QuizCreatedResponse;
import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.wrongnote.application.WrongNoteCommandService;
import com.guseoh.csforge.wrongnote.application.WrongNoteListCriteria;
import com.guseoh.csforge.wrongnote.application.WrongNoteQueryService;
import com.guseoh.csforge.wrongnote.application.WrongNoteReviewFilter;
import com.guseoh.csforge.wrongnote.application.WrongNoteSort;
import com.guseoh.csforge.wrongnote.domain.WrongNoteStatus;
import jakarta.validation.Valid;

/**
 * 오답 노트 목록, 상세, 메모와 한 문제 재시작 HTTP API이다.
 */
@RestController
@RequestMapping("/api/wrong-notes")
@RequiredArgsConstructor
public class WrongNoteController {

    private final WrongNoteQueryService queryService;
    private final WrongNoteCommandService commandService;
    private final WrongNoteApiMapper apiMapper;
    private final QuizApiMapper quizApiMapper;
    private final Clock clock;

    @GetMapping
    public WrongNoteListResponse list(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) Long topic,
            @RequestParam(required = false) Short level,
            @RequestParam(required = false) QuestionDifficulty difficulty,
            @RequestParam(required = false) WrongNoteStatus status,
            @RequestParam(defaultValue = "ALL") WrongNoteReviewFilter review,
            @RequestParam(defaultValue = "RECENT") WrongNoteSort sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        int boundedSize = bounded(size);
        if (page < 0) throw new IllegalArgumentException("page must not be negative");
        return apiMapper.toResponse(queryService.list(new WrongNoteListCriteria(area, topic, level, difficulty, status, review, sort, java.time.Instant.now(clock)), page, boundedSize));
    }

    @GetMapping("/{questionId}")
    public WrongNoteDetailResponse detail(@PathVariable long questionId) {
        return apiMapper.toResponse(queryService.detail(questionId));
    }

    @GetMapping("/{questionId}/attempts")
    public WrongNoteAttemptPageResponse attempts(@PathVariable long questionId, @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int size) {
        return apiMapper.toResponse(queryService.attempts(questionId, cursor, bounded(size)));
    }

    @PutMapping("/{questionId}/note")
    public WrongNoteNoteResponse note(@PathVariable long questionId, @Valid @RequestBody WrongNoteNoteRequest request) {
        return apiMapper.toResponse(commandService.saveNote(questionId, request.content()));
    }

    @PostMapping("/{questionId}/retry")
    public ResponseEntity<QuizCreatedResponse> retry(@PathVariable long questionId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizApiMapper.toCreatedResponse(commandService.retry(questionId)));
    }

    private static int bounded(int size) {
        if (size < 1 || size > 50) throw new IllegalArgumentException("size must be between 1 and 50");
        return size;
    }
}
