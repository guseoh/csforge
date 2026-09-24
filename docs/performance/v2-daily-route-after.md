# Daily route query audit

PostgreSQL 16.4 Testcontainers; full canonical bootstrap; seeded 20 then 100 wrong notes, reviews, attempts, concept progress/views and personal notes. Each route has one warm-up and three measured HTTP calls. SQL count is Hibernate StatementInspector count for the last call; entity loads are Hibernate statistics for that call. Elapsed time is median HTTP wall time in milliseconds.

| Dataset | Route | SQL | Repeated SQL shapes | Entities | Response bytes | HTTP p50 ms |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| history20 | Dashboard | 11 | 0 | 3 | 35018 | 34 |
| history20 | Learning areas | 3 | 0 | 0 | 6576 | 22 |
| history20 | Learning area detail | 2 | 0 | 1 | 6362 | 8 |
| history20 | Concept list | 2 | 0 | 0 | 13599 | 11 |
| history20 | Concept detail | 7 | 0 | 7 | 4667 | 19 |
| history20 | Search | 2 | 0 | 0 | 13118 | 413 |
| history20 | Quiz generation | 22 | 2 | 0 | 150 | 37 |
| history20 | Quiz resume | 5 | 0 | 71 | 8204 | 27 |
| history20 | Quiz result | 6 | 0 | 81 | 21596 | 29 |
| history20 | Wrong note list | 5 | 0 | 80 | 11618 | 35 |
| history20 | Wrong note detail | 6 | 0 | 10 | 2653 | 19 |
| history20 | Review list | 3 | 0 | 40 | 9578 | 19 |
| history100 | Dashboard | 11 | 0 | 6 | 36812 | 22 |
| history100 | Learning areas | 3 | 0 | 0 | 6578 | 12 |
| history100 | Learning area detail | 2 | 0 | 1 | 6362 | 7 |
| history100 | Concept list | 2 | 0 | 0 | 13680 | 11 |
| history100 | Concept detail | 7 | 0 | 7 | 4667 | 13 |
| history100 | Search | 2 | 0 | 0 | 12417 | 393 |
| history100 | Quiz generation | 22 | 2 | 0 | 154 | 24 |
| history100 | Quiz resume | 5 | 0 | 71 | 8204 | 14 |
| history100 | Quiz result | 6 | 0 | 81 | 21596 | 16 |
| history100 | Wrong note list | 5 | 0 | 80 | 11618 | 24 |
| history100 | Wrong note detail | 6 | 0 | 10 | 2653 | 13 |
| history100 | Review list | 3 | 0 | 40 | 8518 | 15 |
| history100 | Wrong note list 50 | 5 | 0 | 200 | 27840 | 21 |
| history100 | Review list 50 | 3 | 0 | 100 | 22070 | 16 |

## Repeated SQL

- `history20 / Quiz generation ×10: insert into quiz_question (position,question_id,quiz_session_id) values (?,?,?)`
- `history20 / Quiz generation ×10: insert into attempt (answer_text,answered_at,correct,created_at,graded_at,grading_status,outcome_processed_at,question_id,quiz_session_id,review_needed,selected_choice_id,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?)`
- `history100 / Quiz generation ×10: insert into quiz_question (position,question_id,quiz_session_id) values (?,?,?)`
- `history100 / Quiz generation ×10: insert into attempt (answer_text,answered_at,correct,created_at,graded_at,grading_status,outcome_processed_at,question_id,quiz_session_id,review_needed,selected_choice_id,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?)`
