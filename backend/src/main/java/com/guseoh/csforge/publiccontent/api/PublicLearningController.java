package com.guseoh.csforge.publiccontent.api;

import java.util.List;

import com.guseoh.csforge.learning.application.ConceptSearchCriteria;
import com.guseoh.csforge.learning.application.ConceptSort;
import com.guseoh.csforge.publiccontent.application.PublicLearningQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 읽기 전용 공개 커리큘럼 HTTP 계약을 제공한다. */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicLearningController {

    private final PublicLearningQueryService service;

    @GetMapping("/learning-areas")
    public List<PublicAreaSummaryResponse> areas() {
        return service.areas().stream().map(PublicAreaSummaryResponse::from).toList();
    }

    @GetMapping("/learning-areas/{areaSlug}")
    public PublicAreaDetailResponse area(@PathVariable String areaSlug) {
        return PublicAreaDetailResponse.from(service.area(areaSlug));
    }

    @GetMapping("/learning-areas/{areaSlug}/outline")
    public PublicConceptPageResponse outline(@PathVariable String areaSlug,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size) {
        return PublicConceptPageResponse.from(service.outline(areaSlug, page, size));
    }

    @GetMapping("/concepts")
    public PublicConceptPageResponse concepts(@RequestParam(required = false) String area,
            @RequestParam(required = false) Long topic, @RequestParam(required = false) Short level,
            @RequestParam(required = false) String q, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size, @RequestParam(defaultValue = "CURRICULUM") String sort) {
        return PublicConceptPageResponse.from(service.concepts(new ConceptSearchCriteria(
                area, topic, level, null, null, q, page, size, ConceptSort.from(sort))));
    }

    @GetMapping("/concepts/{conceptId}")
    public PublicConceptDetailResponse concept(@PathVariable long conceptId) {
        return PublicConceptDetailResponse.from(service.concept(conceptId));
    }
}
