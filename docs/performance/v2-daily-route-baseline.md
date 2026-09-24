# Daily route query audit

PostgreSQL 16.4 Testcontainers; full canonical bootstrap; seeded 20 then 100 wrong notes, reviews, attempts, concept progress/views and personal notes. Each route has one warm-up and three measured HTTP calls. SQL count is Hibernate StatementInspector count for the last call; entity loads are Hibernate statistics for that call. Elapsed time is median HTTP wall time in milliseconds.

| Dataset | Route | SQL | Repeated SQL shapes | Entities | Response bytes | HTTP p50 ms |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| history20 | Dashboard | 11 | 0 | 3 | 35018 | 27 |
| history20 | Learning areas | 3 | 0 | 0 | 6576 | 18 |
| history20 | Learning area detail | 2 | 0 | 1 | 6362 | 8 |
| history20 | Concept list | 2 | 0 | 0 | 13599 | 12 |
| history20 | Concept detail | 12 | 1 | 12 | 4667 | 24 |
| history20 | Search | 2 | 0 | 0 | 13118 | 391 |
| history20 | Quiz generation | 22 | 2 | 0 | 153 | 30 |
| history20 | Quiz resume | 15 | 1 | 103 | 8204 | 30 |
| history20 | Quiz result | 16 | 1 | 113 | 21596 | 32 |
| history20 | Wrong note list | 24 | 1 | 142 | 11618 | 54 |
| history20 | Wrong note detail | 7 | 0 | 14 | 2653 | 18 |
| history20 | Review list | 22 | 1 | 102 | 9578 | 32 |
| history100 | Dashboard | 11 | 0 | 6 | 36812 | 21 |
| history100 | Learning areas | 3 | 0 | 0 | 6578 | 11 |
| history100 | Learning area detail | 2 | 0 | 1 | 6362 | 6 |
| history100 | Concept list | 2 | 0 | 0 | 13680 | 10 |
| history100 | Concept detail | 12 | 1 | 13 | 4667 | 17 |
| history100 | Search | 2 | 0 | 0 | 12417 | 393 |
| history100 | Quiz generation | 22 | 2 | 0 | 154 | 25 |
| history100 | Quiz resume | 15 | 1 | 105 | 8204 | 23 |
| history100 | Quiz result | 16 | 1 | 115 | 21596 | 28 |
| history100 | Wrong note list | 24 | 1 | 145 | 11618 | 44 |
| history100 | Wrong note detail | 7 | 0 | 14 | 2653 | 17 |
| history100 | Review list | 23 | 1 | 105 | 8518 | 35 |
| history100 | Wrong note list 50 | 53 | 1 | 349 | 27840 | 92 |
| history100 | Review list 50 | 49 | 1 | 240 | 22070 | 55 |

## Repeated SQL

- `history20 / Concept detail ×6: select cp1_0.concept_id,cp1_0.bookmarked,cp1_0.completed_at,c1_0.id,c1_0.content_key,c1_0.content_markdown,c1_0.created_at,c1_0.display_order,c1_0.level,c1_0.slug,c1_0.status,c1_0.summary,c1_0.title,c1_0.topic_id,c1_0.updated_at,cp1_0.created_at,cp1_0.first_viewed_at,cp1_0.last_viewed_at,cp1_0.status,cp1_0.updated_at from concept_progress cp1_0 join concept c1_0 on c1_0.id=cp1_0.concept_id where cp1_0.concept_id=?`
- `history20 / Quiz generation ×10: insert into quiz_question (position,question_id,quiz_session_id) values (?,?,?)`
- `history20 / Quiz generation ×10: insert into attempt (answer_text,answered_at,correct,created_at,graded_at,grading_status,outcome_processed_at,question_id,quiz_session_id,review_needed,selected_choice_id,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?)`
- `history20 / Quiz resume ×10: select cp1_0.concept_id,cp1_0.bookmarked,cp1_0.completed_at,c1_0.id,c1_0.content_key,c1_0.content_markdown,c1_0.created_at,c1_0.display_order,c1_0.level,c1_0.slug,c1_0.status,c1_0.summary,c1_0.title,c1_0.topic_id,c1_0.updated_at,cp1_0.created_at,cp1_0.first_viewed_at,cp1_0.last_viewed_at,cp1_0.status,cp1_0.updated_at from concept_progress cp1_0 join concept c1_0 on c1_0.id=cp1_0.concept_id where cp1_0.concept_id=?`
- `history20 / Quiz result ×10: select cp1_0.concept_id,cp1_0.bookmarked,cp1_0.completed_at,c1_0.id,c1_0.content_key,c1_0.content_markdown,c1_0.created_at,c1_0.display_order,c1_0.level,c1_0.slug,c1_0.status,c1_0.summary,c1_0.title,c1_0.topic_id,c1_0.updated_at,cp1_0.created_at,cp1_0.first_viewed_at,cp1_0.last_viewed_at,cp1_0.status,cp1_0.updated_at from concept_progress cp1_0 join concept c1_0 on c1_0.id=cp1_0.concept_id where cp1_0.concept_id=?`
- `history20 / Wrong note list ×19: select cp1_0.concept_id,cp1_0.bookmarked,cp1_0.completed_at,c1_0.id,c1_0.content_key,c1_0.content_markdown,c1_0.created_at,c1_0.display_order,c1_0.level,c1_0.slug,c1_0.status,c1_0.summary,c1_0.title,c1_0.topic_id,c1_0.updated_at,cp1_0.created_at,cp1_0.first_viewed_at,cp1_0.last_viewed_at,cp1_0.status,cp1_0.updated_at from concept_progress cp1_0 join concept c1_0 on c1_0.id=cp1_0.concept_id where cp1_0.concept_id=?`
- `history20 / Review list ×19: select cp1_0.concept_id,cp1_0.bookmarked,cp1_0.completed_at,c1_0.id,c1_0.content_key,c1_0.content_markdown,c1_0.created_at,c1_0.display_order,c1_0.level,c1_0.slug,c1_0.status,c1_0.summary,c1_0.title,c1_0.topic_id,c1_0.updated_at,cp1_0.created_at,cp1_0.first_viewed_at,cp1_0.last_viewed_at,cp1_0.status,cp1_0.updated_at from concept_progress cp1_0 join concept c1_0 on c1_0.id=cp1_0.concept_id where cp1_0.concept_id=?`
- `history100 / Concept detail ×6: select cp1_0.concept_id,cp1_0.bookmarked,cp1_0.completed_at,c1_0.id,c1_0.content_key,c1_0.content_markdown,c1_0.created_at,c1_0.display_order,c1_0.level,c1_0.slug,c1_0.status,c1_0.summary,c1_0.title,c1_0.topic_id,c1_0.updated_at,cp1_0.created_at,cp1_0.first_viewed_at,cp1_0.last_viewed_at,cp1_0.status,cp1_0.updated_at from concept_progress cp1_0 join concept c1_0 on c1_0.id=cp1_0.concept_id where cp1_0.concept_id=?`
- `history100 / Quiz generation ×10: insert into quiz_question (position,question_id,quiz_session_id) values (?,?,?)`
- `history100 / Quiz generation ×10: insert into attempt (answer_text,answered_at,correct,created_at,graded_at,grading_status,outcome_processed_at,question_id,quiz_session_id,review_needed,selected_choice_id,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?)`
- `history100 / Quiz resume ×10: select cp1_0.concept_id,cp1_0.bookmarked,cp1_0.completed_at,c1_0.id,c1_0.content_key,c1_0.content_markdown,c1_0.created_at,c1_0.display_order,c1_0.level,c1_0.slug,c1_0.status,c1_0.summary,c1_0.title,c1_0.topic_id,c1_0.updated_at,cp1_0.created_at,cp1_0.first_viewed_at,cp1_0.last_viewed_at,cp1_0.status,cp1_0.updated_at from concept_progress cp1_0 join concept c1_0 on c1_0.id=cp1_0.concept_id where cp1_0.concept_id=?`
- `history100 / Quiz result ×10: select cp1_0.concept_id,cp1_0.bookmarked,cp1_0.completed_at,c1_0.id,c1_0.content_key,c1_0.content_markdown,c1_0.created_at,c1_0.display_order,c1_0.level,c1_0.slug,c1_0.status,c1_0.summary,c1_0.title,c1_0.topic_id,c1_0.updated_at,cp1_0.created_at,cp1_0.first_viewed_at,cp1_0.last_viewed_at,cp1_0.status,cp1_0.updated_at from concept_progress cp1_0 join concept c1_0 on c1_0.id=cp1_0.concept_id where cp1_0.concept_id=?`
- `history100 / Wrong note list ×19: select cp1_0.concept_id,cp1_0.bookmarked,cp1_0.completed_at,c1_0.id,c1_0.content_key,c1_0.content_markdown,c1_0.created_at,c1_0.display_order,c1_0.level,c1_0.slug,c1_0.status,c1_0.summary,c1_0.title,c1_0.topic_id,c1_0.updated_at,cp1_0.created_at,cp1_0.first_viewed_at,cp1_0.last_viewed_at,cp1_0.status,cp1_0.updated_at from concept_progress cp1_0 join concept c1_0 on c1_0.id=cp1_0.concept_id where cp1_0.concept_id=?`
- `history100 / Review list ×20: select cp1_0.concept_id,cp1_0.bookmarked,cp1_0.completed_at,c1_0.id,c1_0.content_key,c1_0.content_markdown,c1_0.created_at,c1_0.display_order,c1_0.level,c1_0.slug,c1_0.status,c1_0.summary,c1_0.title,c1_0.topic_id,c1_0.updated_at,cp1_0.created_at,cp1_0.first_viewed_at,cp1_0.last_viewed_at,cp1_0.status,cp1_0.updated_at from concept_progress cp1_0 join concept c1_0 on c1_0.id=cp1_0.concept_id where cp1_0.concept_id=?`
- `history100 / Wrong note list 50 ×48: select cp1_0.concept_id,cp1_0.bookmarked,cp1_0.completed_at,c1_0.id,c1_0.content_key,c1_0.content_markdown,c1_0.created_at,c1_0.display_order,c1_0.level,c1_0.slug,c1_0.status,c1_0.summary,c1_0.title,c1_0.topic_id,c1_0.updated_at,cp1_0.created_at,cp1_0.first_viewed_at,cp1_0.last_viewed_at,cp1_0.status,cp1_0.updated_at from concept_progress cp1_0 join concept c1_0 on c1_0.id=cp1_0.concept_id where cp1_0.concept_id=?`
- `history100 / Review list 50 ×46: select cp1_0.concept_id,cp1_0.bookmarked,cp1_0.completed_at,c1_0.id,c1_0.content_key,c1_0.content_markdown,c1_0.created_at,c1_0.display_order,c1_0.level,c1_0.slug,c1_0.status,c1_0.summary,c1_0.title,c1_0.topic_id,c1_0.updated_at,cp1_0.created_at,cp1_0.first_viewed_at,cp1_0.last_viewed_at,cp1_0.status,cp1_0.updated_at from concept_progress cp1_0 join concept c1_0 on c1_0.id=cp1_0.concept_id where cp1_0.concept_id=?`
