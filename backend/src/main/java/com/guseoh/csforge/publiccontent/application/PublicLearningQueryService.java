package com.guseoh.csforge.publiccontent.application;

import java.util.List;

import com.guseoh.csforge.learning.application.ConceptNavigationView;
import com.guseoh.csforge.learning.application.ConceptSearchCriteria;
import com.guseoh.csforge.learning.application.LearningAreaBreadcrumbView;
import com.guseoh.csforge.learning.application.LearningNotFoundException;
import com.guseoh.csforge.learning.application.LearningBadRequestException;
import com.guseoh.csforge.learning.application.ConceptSort;
import com.guseoh.csforge.learning.application.PageMetadataView;
import com.guseoh.csforge.learning.application.ReferenceView;
import com.guseoh.csforge.learning.application.TopicBreadcrumbView;
import com.guseoh.csforge.learning.domain.ConceptNavigationSummary;
import com.guseoh.csforge.learning.domain.ConceptReferenceRepository;
import com.guseoh.csforge.learning.domain.ConceptRepository;
import com.guseoh.csforge.publiccontent.infrastructure.PublicCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 소유자의 기록 조회나 변경 없이 공개 Reader 데이터를 제공한다. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicLearningQueryService {

    private final PublicCatalogRepository catalog;
    private final ConceptRepository concepts;
    private final ConceptReferenceRepository references;

    public List<PublicAreaSummaryView> areas() {
        return catalog.areas();
    }

    public PublicAreaDetailView area(String slug) {
        var area = catalog.area(slug).orElseThrow(() -> new LearningNotFoundException("Learning area not found: " + slug));
        return new PublicAreaDetailView(area.getId(), area.getSlug(), area.getName(), area.getDescription(), catalog.topics(slug));
    }

    public PublicConceptPageView concepts(ConceptSearchCriteria criteria) {
        if (criteria.sort() == ConceptSort.VIEWED || (long) criteria.page() * criteria.size() > 10_000) {
            throw new LearningBadRequestException("Public concepts require canonical sorting and an offset at most 10000");
        }
        long total = catalog.count(criteria);
        int pages = Math.toIntExact((total + criteria.size() - 1) / criteria.size());
        return new PublicConceptPageView(catalog.concepts(criteria), new PageMetadataView(
                criteria.page(), criteria.size(), total, pages, criteria.page() + 1 < pages, criteria.page() > 0));
    }

    public PublicConceptPageView outline(String slug, int page, int size) {
        if (catalog.area(slug).isEmpty()) {
            throw new LearningNotFoundException("Learning area not found: " + slug);
        }
        return concepts(new ConceptSearchCriteria(slug, null, null, null, null, null, page, size, ConceptSort.CURRICULUM));
    }

    public PublicConceptDetailView concept(long id) {
        var concept = concepts.findPublishedById(id)
                .filter(c -> c.getTopic().isActive() && c.getTopic().getLearningArea().isActive())
                .orElseThrow(() -> new LearningNotFoundException("Published concept not found: " + id));
        var topic = concept.getTopic();
        var area = topic.getLearningArea();
        var previous = concepts.findPreviousPublished(id, area.getId(), topic.getDisplayOrder(), concept.getDisplayOrder(), PageRequest.of(0, 1));
        var next = concepts.findNextPublished(id, area.getId(), topic.getDisplayOrder(), concept.getDisplayOrder(), PageRequest.of(0, 1));
        return new PublicConceptDetailView(id, concept.getContentKey(), concept.getSlug(), concept.getTitle(),
                concept.getSummary(), concept.getContentMarkdown(), concept.getLevel(),
                new LearningAreaBreadcrumbView(area.getId(), area.getSlug(), area.getName()),
                new TopicBreadcrumbView(topic.getId(), topic.getSlug(), topic.getTitle()),
                references.findAllByConceptId(id).stream().map(link -> {
                    var reference = link.getReference();
                    return new ReferenceView(reference.getId(), reference.getUrl(), reference.getTitle(),
                            reference.getReferenceType(), reference.getLanguageCode(), reference.getDepth(),
                            reference.getRecommendation(), link.getDisplayOrder(), link.getRelationNote());
                }).toList(),
                previous.stream().map(this::navigation).findFirst().orElse(null),
                next.stream().map(this::navigation).findFirst().orElse(null),
                concepts.findRelatedPublished(id, topic.getId(), concept.getDisplayOrder(), PageRequest.of(0, 5))
                        .stream().map(this::navigation).toList());
    }

    private ConceptNavigationView navigation(ConceptNavigationSummary concept) {
        return new ConceptNavigationView(concept.id(), concept.title(), concept.level());
    }
}
