# Issue #206 — Performance latency attribution Content Pack 리뷰

## 범위·학습 목표

- 기준 `main a0bb36fdc00bbc8228220cbbbcafa3c785929df1`. 기존 Performance/Observability/Operations **3 Topics / 9 Concepts / 27 Questions** 전체의 커리큘럼 목적, Question 정답·설명을 확인.
- 기존 `latency-throughput`, `saturation-queueing`, `profiling-load-testing`, `signals-context`, `sli-slo-error-budget`, `metric-cardinality`, `alert-runbook`, `incident-response`, `capacity-autoscaling` **KEEP**. p99 집계, Little's Law, JFR/JMH, SLO, HPA·Runbook 재설명하지 않음.
- 신규 공백: 단일 HTTP 요청의 구간별 지연을 겹침·측정 범위에 따라 분리하고, **HikariCP 연결 획득 대기 ≠ SQL 실행**이라는 반례로 원인 가설을 검증하는 절차.
- 신규 `performance.core.measurement.latency-attribution`, Level 2/CORE/order 40, 기존 measurement Topic. **DIAGRAM: 본문 ASCII 부모/자식 Span의 겹치는 시간선, DB pool wait→SQL 실행 요청 경로**. 새 외부 그래픽 asset 없음.
- 신규 질문 MC/EASY 정답 **D**, SCENARIO/MEDIUM (HTTP parent 200ms + child DB 150ms는 **200ms**, 350ms가 아님), DESCRIPTIVE/HARD (p99 회귀, pool 대기와 SQL/외부 I/O 반증, 동일 부하 검증) 각 1개. 이전 contentKey/Question 타입·난도·정답·연결 보존.

## 기술적 검증

- [OpenTelemetry: Traces](https://opentelemetry.io/docs/concepts/signals/traces/) — Span parent/child의 start/end와 context, sampling 및 시간선 중첩.
- [Spring Boot: Metrics](https://docs.spring.io/spring-boot/reference/actuator/metrics.html) — DataSource/HikariCP 관측과 HTTP 요청 지표 대조.
- [Spring Boot: SQL Databases](https://docs.spring.io/spring-boot/reference/data/sql.html) — Spring Data JPA와 HikariCP의 연결 풀 경계.
- 가상 관측값에서 15+170+12+18+35=250ms(서버 구간)이며 280ms(클라이언트 전체)와의 **차이 30ms는 미계측 후보이지 근본 원인을 증명하지 않는다**. 자식 Span 시간은 부모 안에 포함되며 병렬 자식은 서로 겹친다. SQL 인덱스 추가/풀 무제한 확장은 선제 정답으로 제시하지 않는다.
- 기존 Reference를 수정·재식별하지 않음. 새 이미지 ALT·다크/모바일 요구 없음; **Human Usage Check는 명시적으로 생략했으며 검증한 것으로 기록하지 않는다.**

## 실제 독립 Import QA

- [Actions #39553050105](https://github.com/guseoh/csforge/actions/runs/39553050105) **SUCCESS**. 격리 PostgreSQL 16 / Java 25 Spring Boot LOCAL에서 이전 canonical **3,388 items CREATED** 후 신규 Concept Markdown + 기존 measurement `questions.json`의 실제 Preview/Apply: **4 CREATED / 9 existing Questions UNCHANGED** / 0 errors.
- 동일 source exact import **13 UNCHANGED / 0 UPDATED**, 기존 personal note / WrongNote / ReviewSchedule / Quiz result 및 10개 개인·관계 테이블 digest 불변. 기존 Concept·Question ID stable 및 신규 객관식 실제 정답 채점 확인.
- 임시 Actions QA workflow는 성공 후 삭제. Production PostgreSQL 연결/Import 없음. 현재 단독 브랜치 테스트 inventory **873 files / 724 Concepts / 2,534 Questions / 3,392 canonical items**이며, Infrastructure PR 병합 뒤 **874 / 725 / 2,537 / 3,396**으로 조정해야 한다.

## 병합 전 게이트
- [x] Area 전체 학습 목표·Question review, 공식 근거, 수치·반례·도식 검토
- [x] 격리 Import Preview/Apply/exact replay/개인 이력 보존
- [ ] Infrastructure PR 병합 뒤 통합 소스·test inventory 재검증
- [ ] 최종 HEAD Repository Validation, conflict/review threads 및 squash merge
