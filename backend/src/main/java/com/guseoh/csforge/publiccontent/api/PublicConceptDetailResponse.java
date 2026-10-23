package com.guseoh.csforge.publiccontent.api;

import java.util.List;

import com.guseoh.csforge.learning.api.ConceptNavigationResponse;
import com.guseoh.csforge.learning.api.LearningAreaBreadcrumbResponse;
import com.guseoh.csforge.learning.api.ReferenceResponse;
import com.guseoh.csforge.learning.api.TopicBreadcrumbResponse;
import com.guseoh.csforge.learning.application.ConceptNavigationView;
import com.guseoh.csforge.publiccontent.application.PublicConceptDetailView;

/** 공개 콘텐츠의 HTTP 응답이다. */
public record PublicConceptDetailResponse(
        long id,
        String contentKey,
        String slug,
        String title,
        String summary,
        String contentMarkdown,
        short level,
        LearningAreaBreadcrumbResponse area,
        TopicBreadcrumbResponse topic,
        List<ReferenceResponse> references,
        ConceptNavigationResponse previous,
        ConceptNavigationResponse next,
        List<ConceptNavigationResponse> relatedConcepts) {
    static PublicConceptDetailResponse from(PublicConceptDetailView view) {
        return new PublicConceptDetailResponse(
                view.id(),
                view.contentKey(),
                view.slug(),
                view.title(),
                view.summary(),
                view.contentMarkdown(),
                view.level(),
                new LearningAreaBreadcrumbResponse(view.area().id(), view.area().slug(), view.area().name()),
                new TopicBreadcrumbResponse(view.topic().id(), view.topic().slug(), view.topic().title()),
                view.references().stream().map(reference -> new ReferenceResponse(reference.id(), reference.url(),
                        reference.title(), reference.type(), reference.language(), reference.depth(),
                        reference.recommendation(), reference.displayOrder(), reference.relationNote())).toList(),
                navigation(view.previous()),
                navigation(view.next()),
                view.relatedConcepts().stream().map(PublicConceptDetailResponse::navigation).toList());
    }

    private static ConceptNavigationResponse navigation(ConceptNavigationView view) {
        return view == null ? null : new ConceptNavigationResponse(view.id(), view.title(), view.level());
    }
}
