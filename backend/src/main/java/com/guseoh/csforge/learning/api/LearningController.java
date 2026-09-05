package com.guseoh.csforge.learning.api;

import java.util.List;

import com.guseoh.csforge.learning.application.ConceptSearchCriteria;
import com.guseoh.csforge.learning.application.ConceptSort;
import com.guseoh.csforge.learning.application.LearningCommandService;
import com.guseoh.csforge.learning.application.LearningQueryService;
import com.guseoh.csforge.learning.application.PersonalNoteView;
import com.guseoh.csforge.learning.domain.LearningStatus;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Learning/Concept HTTP 요청을 application use case에 연결한다. */
@RestController
@RequestMapping("/api")
public class LearningController {

    private final LearningQueryService queryService;
    private final LearningCommandService commandService;
    private final LearningApiMapper apiMapper;

    public LearningController(
            LearningQueryService queryService,
            LearningCommandService commandService,
            LearningApiMapper apiMapper) {
        this.queryService = queryService;
        this.commandService = commandService;
        this.apiMapper = apiMapper;
    }

    @GetMapping("/learning-areas")
    public List<LearningAreaSummaryResponse> listAreas() {
        return queryService.listAreas().stream().map(apiMapper::toResponse).toList();
    }

    @GetMapping("/learning-areas/{areaSlug}")
    public LearningAreaDetailResponse getArea(@PathVariable String areaSlug) {
        return apiMapper.toResponse(queryService.getArea(areaSlug));
    }

    @GetMapping("/concepts")
    public ConceptPageResponse listConcepts(
            @RequestParam(required = false) String area,
            @RequestParam(name = "topic", required = false) Long topicId,
            @RequestParam(required = false) Short level,
            @RequestParam(required = false) LearningStatus learningStatus,
            @RequestParam(required = false) Boolean bookmarked,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(defaultValue = "CURRICULUM") String sort) {
        return apiMapper.toResponse(queryService.listConcepts(new ConceptSearchCriteria(
                area, topicId, level, learningStatus, bookmarked, q, page, size, ConceptSort.from(sort))));
    }

    @GetMapping("/concepts/{conceptId}")
    public ConceptDetailResponse getConcept(@PathVariable long conceptId) {
        return apiMapper.toResponse(queryService.getConcept(conceptId));
    }

    @PostMapping("/concepts/{conceptId}/view")
    public ConceptProgressResponse recordView(@PathVariable long conceptId) {
        return apiMapper.toResponse(commandService.recordView(conceptId));
    }

    @PatchMapping("/concepts/{conceptId}/progress")
    public ConceptProgressResponse updateProgress(
            @PathVariable long conceptId,
            @RequestBody ConceptProgressUpdateRequest request) {
        return apiMapper.toResponse(commandService.updateProgress(conceptId, request.status(), request.bookmarked()));
    }

    @PutMapping("/concepts/{conceptId}/note")
    public PersonalNoteResponse upsertNote(
            @PathVariable long conceptId,
            @Valid @RequestBody PersonalNoteUpsertRequest request) {
        PersonalNoteView view = commandService.upsertNote(conceptId, request.content());
        return apiMapper.toResponse(view);
    }
}
