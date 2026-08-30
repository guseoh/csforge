package com.guseoh.csforge.quiz.api;

import java.util.List;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.quiz.application.QuizQuestionSelectionCriteria;
import com.guseoh.csforge.quiz.application.QuizQuestionState;
import com.guseoh.csforge.quiz.application.QuizQueryService;
import com.guseoh.csforge.quiz.application.QuizSessionCommandService;
import com.guseoh.csforge.quiz.application.QuizSetupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizSetupService setupService;
    private final QuizQueryService queryService;
    private final QuizSessionCommandService commandService;

    public QuizController(
            QuizSetupService setupService,
            QuizQueryService queryService,
            QuizSessionCommandService commandService) {
        this.setupService = setupService;
        this.queryService = queryService;
        this.commandService = commandService;
    }

    @GetMapping("/availability")
    public QuizAvailabilityResponse availability(
            @RequestParam(name = "area", required = false) List<String> areas,
            @RequestParam(name = "concept", required = false) List<Long> concepts,
            @RequestParam(name = "level", required = false) List<Short> levels,
            @RequestParam(name = "difficulty", required = false) List<QuestionDifficulty> difficulties,
            @RequestParam(name = "questionType", required = false) List<QuestionType> questionTypes,
            @RequestParam(name = "state", defaultValue = "ALL") QuizQuestionState state) {
        return new QuizAvailabilityResponse(setupService.availability(
                new QuizQuestionSelectionCriteria(areas, concepts, levels, difficulties, questionTypes, state)));
    }

    @PostMapping
    public ResponseEntity<QuizCreatedResponse> create(@Valid @RequestBody QuizCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(setupService.create(request.toSetupRequest()));
    }

    @GetMapping("/active")
    public ResponseEntity<QuizActiveResponse> active() {
        return queryService.active().map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/{quizId}")
    public QuizSessionResponse session(@PathVariable long quizId) {
        return queryService.session(quizId);
    }

    @PutMapping("/{quizId}/questions/{questionId}/answer")
    public QuizAnswerSavedResponse saveAnswer(
            @PathVariable long quizId,
            @PathVariable long questionId,
            @Valid @RequestBody QuizAnswerSaveRequest request) {
        return commandService.saveAnswer(quizId, questionId, request);
    }

    @PatchMapping("/{quizId}/position")
    public ResponseEntity<Void> savePosition(
            @PathVariable long quizId,
            @Valid @RequestBody QuizPositionUpdateRequest request) {
        commandService.savePosition(quizId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{quizId}/submit")
    public QuizSubmissionResponse submit(@PathVariable long quizId) {
        return commandService.submit(quizId);
    }

    @GetMapping("/{quizId}/result")
    public QuizResultResponse result(@PathVariable long quizId) {
        return queryService.result(quizId);
    }

    @PatchMapping("/{quizId}/questions/{questionId}/self-check")
    public QuizSelfCheckResponse selfCheck(
            @PathVariable long quizId,
            @PathVariable long questionId,
            @Valid @RequestBody QuizSelfCheckRequest request) {
        return commandService.selfCheck(quizId, questionId, request);
    }

    @PostMapping("/{quizId}/retry-wrong")
    public QuizRetryResponse retryWrong(@PathVariable long quizId) {
        return setupService.retryWrong(quizId);
    }
}
