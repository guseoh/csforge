package com.guseoh.csforge.learning.api;

import java.util.List;
import java.util.Locale;

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

import com.guseoh.csforge.learning.application.LearningBadRequestException;
import com.guseoh.csforge.learning.application.LearningService;
import com.guseoh.csforge.learning.domain.LearningStatus;
import com.guseoh.csforge.learning.infrastructure.LearningQueryRepository.ConceptFilter;

@RestController
@RequestMapping("/api")
public class LearningController {

    private final LearningService learningService;

    public LearningController(LearningService learningService) {
        this.learningService = learningService;
    }

    @GetMapping("/learning-areas")
    public List<LearningDtos.AreaSummary> listAreas() {
        return learningService.listAreas();
    }

    @GetMapping("/learning-areas/{areaSlug}")
    public LearningDtos.AreaDetail getArea(@PathVariable String areaSlug) {
        return learningService.getArea(areaSlug);
    }

    @GetMapping("/concepts")
    public LearningDtos.ConceptPage listConcepts(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) Long topic,
            @RequestParam(required = false) Short level,
            @RequestParam(required = false) String learningStatus,
            @RequestParam(required = false) Boolean bookmarked,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(defaultValue = "CURRICULUM") String sort) {
        ConceptFilter filter = new ConceptFilter(
                blankToNull(area),
                topic,
                level,
                parseLearningStatus(learningStatus),
                bookmarked,
                blankToNull(q),
                page,
                size,
                parseSort(sort));
        return learningService.listConcepts(filter);
    }

    @GetMapping("/concepts/{conceptId}")
    public LearningDtos.ConceptDetail getConcept(@PathVariable long conceptId) {
        return learningService.getConcept(conceptId);
    }

    @PostMapping("/concepts/{conceptId}/view")
    public LearningDtos.ProgressResponse recordView(@PathVariable long conceptId) {
        return learningService.recordView(conceptId);
    }

    @PatchMapping("/concepts/{conceptId}/progress")
    public LearningDtos.ProgressResponse updateProgress(
            @PathVariable long conceptId,
            @RequestBody LearningDtos.ProgressUpdateRequest request) {
        return learningService.updateProgress(conceptId, request.status(), request.bookmarked());
    }

    @PutMapping("/concepts/{conceptId}/note")
    public LearningDtos.NoteResponse upsertNote(
            @PathVariable long conceptId,
            @Valid @RequestBody LearningDtos.NoteUpsertRequest request) {
        return learningService.upsertNote(conceptId, request.content());
    }

    private LearningStatus parseLearningStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LearningStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new LearningBadRequestException("Unsupported learningStatus: " + value);
        }
    }

    private ConceptSort parseSort(String value) {
        if (value == null || value.isBlank()) {
            return ConceptSort.CURRICULUM;
        }
        try {
            return ConceptSort.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new LearningBadRequestException("Unsupported sort: " + value);
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
