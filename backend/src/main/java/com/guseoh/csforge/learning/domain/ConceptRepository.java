package com.guseoh.csforge.learning.domain;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** contentKey로 Concept canonical aggregate를 묶음 조회하는 저장소이다. */
public interface ConceptRepository extends JpaRepository<Concept, Long> {

    List<Concept> findByContentKeyIn(Collection<String> contentKeys);

    @EntityGraph(attributePaths = {"topic", "topic.learningArea"})
    @Query("""
            select c
            from Concept c
            where c.id = :id
              and c.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
            """)
    Optional<Concept> findPublishedById(@Param("id") Long id);

    @Query("""
            select c
            from Concept c
            join c.topic t
            join t.learningArea a
            where c.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
              and t.active = true
              and a.active = true
              and (
                    a.displayOrder < :areaOrder
                 or (a.displayOrder = :areaOrder and t.displayOrder < :topicOrder)
                 or (a.displayOrder = :areaOrder and t.displayOrder = :topicOrder and c.displayOrder < :conceptOrder)
                 or (a.displayOrder = :areaOrder and t.displayOrder = :topicOrder and c.displayOrder = :conceptOrder and c.id < :conceptId)
              )
            order by a.displayOrder desc, t.displayOrder desc, c.displayOrder desc, c.id desc
            """)
    List<Concept> findPreviousPublished(
            @Param("conceptId") long conceptId,
            @Param("areaOrder") short areaOrder,
            @Param("topicOrder") int topicOrder,
            @Param("conceptOrder") int conceptOrder,
            Pageable pageable);

    @Query("""
            select c
            from Concept c
            join c.topic t
            join t.learningArea a
            where c.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
              and t.active = true
              and a.active = true
              and (
                    a.displayOrder > :areaOrder
                 or (a.displayOrder = :areaOrder and t.displayOrder > :topicOrder)
                 or (a.displayOrder = :areaOrder and t.displayOrder = :topicOrder and c.displayOrder > :conceptOrder)
                 or (a.displayOrder = :areaOrder and t.displayOrder = :topicOrder and c.displayOrder = :conceptOrder and c.id > :conceptId)
              )
            order by a.displayOrder, t.displayOrder, c.displayOrder, c.id
            """)
    List<Concept> findNextPublished(
            @Param("conceptId") long conceptId,
            @Param("areaOrder") short areaOrder,
            @Param("topicOrder") int topicOrder,
            @Param("conceptOrder") int conceptOrder,
            Pageable pageable);

    @Query("""
            select c
            from Concept c
            where c.topic.id = :topicId
              and c.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
              and c.id <> :conceptId
            order by abs(c.displayOrder - :displayOrder), c.displayOrder, c.id
            """)
    List<Concept> findRelatedPublished(
            @Param("conceptId") long conceptId,
            @Param("topicId") long topicId,
            @Param("displayOrder") int displayOrder,
            Pageable pageable);
}
