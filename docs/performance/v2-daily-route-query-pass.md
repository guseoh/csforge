# V2 daily-route query pass (#156)

## 측정 조건

- PostgreSQL 16.4 Testcontainers 격리 DB에 전체 canonical 콘텐츠를 bootstrap했다. 대표 이력은 오답 노트·복습 일정·시도·개념 진행/조회·개인 노트를 20건, 이어서 100건까지 추가했다. 운영 데이터는 사용하지 않았다.
- `CSFORGE_PERF_AUDIT=1`로 `backend/gradlew test --tests com.guseoh.csforge.performance.DailyRouteQueryAuditTest`를 실행한다. 각 HTTP route는 1회 준비 호출 뒤 3회 측정한다. SQL 개수와 동일 SQL 반복은 Hibernate `StatementInspector`, entity load는 Hibernate statistics로 기록한다. p50은 HTTP 왕복시간이며 보조 지표다.
- [전체 baseline](v2-daily-route-baseline.md)과 [전체 after](v2-daily-route-after.md)에 두 이력 크기의 모든 route, SQL 반복, entity load, 응답 크기, p50을 보관했다. 아래 표는 이력 100건 기준이다.

| Route | SQL 전→후 | Entity load 전→후 | HTTP p50 ms 전→후 | 결정 |
| --- | ---: | ---: | ---: | --- |
| Dashboard | 11→11 | 6→6 | 21→22 | NO_CHANGE |
| Learning areas | 3→3 | 0→0 | 11→12 | NO_CHANGE |
| Learning area detail | 2→2 | 1→1 | 6→7 | NO_CHANGE |
| Concept list | 2→2 | 0→0 | 10→11 | NO_CHANGE |
| Concept detail | 12→7 | 13→7 | 17→13 | 변경 |
| Search | 2→2 | 0→0 | 393→393 | NO_CHANGE, 아래 제한 참조 |
| Quiz generation | 22→22 | 0→0 | 25→24 | NO_CHANGE |
| Quiz resume | 15→5 | 105→71 | 23→14 | 변경 |
| Quiz result | 16→6 | 115→81 | 28→16 | 변경 |
| Wrong note list 20 | 24→5 | 145→80 | 44→24 | 변경 |
| Wrong note detail | 7→6 | 14→10 | 17→13 | 변경 |
| Review list 20 | 23→3 | 105→40 | 35→15 | 변경 |
| Wrong note list 50 | 53→5 | 349→200 | 92→21 | 변경 |
| Review list 50 | 49→3 | 240→100 | 55→16 | 변경 |

## 원인과 변경

문제에 연결된 Concept entity를 목록용으로 전부 로딩하면 역방향 1:1 `Concept.progress` 확인 때문에 Concept마다 `concept_progress` SQL이 반복되었다. 문제-개념 관계를 문제 ID별로 한 번 조회하는 JPA constructor projection으로 바꾸고, Quiz/오답 노트/복습 API에 필요한 개념·토픽·영역 필드만 읽는다. AI 분석의 본문이 필요한 경로는 기존 entity 조회를 유지했다. Concept 상세의 인접·관련 개념도 전체 entity 대신 세 필드 projection으로 읽는다. 20→50건 페이지에서 SQL 개수가 일정하고 조회 SQL의 반복 shape가 0이다. 응답 크기는 baseline과 동일했다(Quiz 생성의 ID 값 길이 차이는 제외).

새 projection의 `question_id IN (...)` 및 `question_id, concept_id` 정렬에는 기존 `question_concept` 기본키 `(question_id, concept_id)`가 맞아 새 인덱스를 추가하지 않았다.

Dashboard, Learning Area/Concept 목록은 SQL 개수가 낮고 데이터 증가에도 일정했다. Quiz 생성의 반복 SQL은 10개 QuizQuestion 및 Attempt의 insert이며 읽기 N+1이 아니다. 따라서 이 route는 변경하지 않았다.

Search는 조회 2회(count와 page)로 일정하지만 약 400 ms다. [검색 count 실행 계획](v2-daily-route-search-count-plan.md)은 이력 100건·`q=cache`에서 약 194 ms, view 결과 약 4,021행을 계산한 뒤 477행을 남긴다. `search_document_view`가 여러 canonical 테이블을 집계·결합해 `search_text`를 계산하며, reference의 relation note lateral 집계도 991회 수행한다. `%cache%` 조건은 계산된 view 텍스트에 적용되므로 현재 base-table 인덱스 하나를 추가해서 제거할 수 있는 scan이 아니다. 검색 view 재설계는 이번 JPA daily-route 조회 수정 범위를 넘고 검색 결과 의미의 회귀 위험이 있어 NO_CHANGE로 남긴다. 현재 데이터에서 직접 검색은 작동하지만 검색 지연은 남은 제한이다.

## 회귀 확인

Opt-in audit는 개선 route의 SQL 상한과 중복 조회 부재를 검사한다. 기존 integration tests는 응답 계약을 확인한다. 벤치마크 시간은 단일 로컬 실행의 보조 수치이며 동시 부하 처리량을 뜻하지 않는다.
