package com.guseoh.csforge.publiccontent.application;

import com.guseoh.csforge.learning.application.ConceptNavigationView;
import com.guseoh.csforge.learning.application.LearningAreaBreadcrumbView;
import com.guseoh.csforge.learning.application.ReferenceView;
import com.guseoh.csforge.learning.application.TopicBreadcrumbView;
import java.util.List;

/** 개인 데이터가 없는 공개 canonical 조회 결과이다. */
public record PublicConceptDetailView(
        long id,
        String contentKey,
        String slug,
        String title,
        String summary,
        String contentMarkdown,
        short level,
        LearningAreaBreadcrumbView area,
        TopicBreadcrumbView topic,
        List<ReferenceView> references,
        ConceptNavigationView previous,
        ConceptNavigationView next,
        List<ConceptNavigationView> relatedConcepts) {
}
