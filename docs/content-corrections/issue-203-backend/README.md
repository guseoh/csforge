# Issue #203 — Backend Engineering 정밀 교정 기록

> Spring과 독립된 Backend Engineering Content Slice. 최신 사용자 결정: **Human Usage Check는 이번 개선 속도 우선 단계의 필수 게이트에서 제외**한다. 격리 Import/CI·Content Review는 계속 필요하며, merge는 별도 명시적 승인 이전에 진행하지 않는다.

## 기준과 전체 범위
- Base `main`: `fffa3e789df5ce00b3708af073481d6de1c7d8e6`; parent [Issue #203](https://github.com/guseoh/csforge/issues/203).
- 이전 [Wave 2 Backend Engineering 전 범위 감사](../../content-audit/learning-experience-2026/wave-2/backend-engineering.json) 13 Topic / 40 Concept / 108 Question 및 [발견 ledger](../../content-audit/learning-experience-2026/wave-2-findings.json)를 재사용했다. #181 병합 콘텐츠를 임의 재작성하지 않는다.
- 기존 W2-BE findings 총 **P0 1 / P1 6 / P2 1**. 현재 canonical에서 P0/P1 7개 재현 확인, 최소 수정. P2 한 건은 공식 Version API URL 직접 접근 결과 정상으로 확인하여 유지했다.
- **6개 Concept MD + 1개 Question JSON**만 변경한다. 기존 key/slug/level/status/order/reference/YAML/Curriculum/SVG/Question 정답·유형·난도·해설·model은 보존한다.

## Findings disposition

| ID | 판정 | 내용 및 정확한 변경 key |
| --- | --- | --- |
| W2-BE-001 · P0 | FIX | `backend.core.layering.orchestration-rule`: DB commit 후 outbox를 기록하던 잘못된 순서 분리. 비원자적 직접 환불 방식과 **상태 변경 + outbox 의도 같은 TX 저장 → commit → 별도 relay**를 구분하고 중복 전달·응답 유실을 별도 정책으로 처리 |
| W2-BE-002 · P1 | FIX | `backend.core.domain.invariant-lifecycle.q3`: 기존 HARD 시나리오·모범답안 보존. 기존 `invariant-lifecycle` 외에 `optimistic`, `idempotency-key`, `failure-recovery` 3개 Concept 관계 추가. 기술 심화 요구와 실제 학습 연결 정합성 보강 |
| W2-BE-003 · P1 | FIX | `backend.core.api.methods-status`: HTTP의 read-only 요청 의도와 access log 부수효과, GET cancel 실패/prefetch 위험, PUT은 unsafe지만 idempotent라는 의미 분리 |
| W2-BE-004 · P2 | KEEP | `backend.core.concurrency-transaction.optimistic`: 기존 official Jakarta Persistence 3.2 `@Version` API URL **2026-10-21 열림**, 계약 내용도 정확. Reference URL·메타데이터 변경 불필요 |
| W2-BE-005 · P1 | FIX | `backend.core.bulk-batch.file-api`: request 전체 bytes / file bytes / part 수·file 수 / 동시성·임시 공간 / 처리 시간·거절·임시 데이터 정리 경계 보강 |
| W2-BE-006 · P1 | FIX | `backend.core.time-money.instant-zone`: America/New_York 2026-03-08 02:30 gap과 2026-11-01 01:30 overlap 실제 조건, `ZoneRules.getValidOffsets`·거절/명시적 선택·Instant 결정과 기본 resolver 구별 |
| W2-BE-007 · P1 | FIX | `backend.core.evolution.migration`: 기존 writer의 `name` 변경과 `first/last` backfill 간 정합성 불일치 timeline, authoritative source, idempotent catch-up/dual-write 검증·rollback 후 contract 경계 |
| W2-BE-008 · P1 | FIX | `backend.core.testing-recovery.testing-strategy`: 순수 fake adapter와 실제 HTTP client + stub server 계약 테스트 구별. 200 필수 필드 누락/429/500/unknown timeout·fixture version 및 비밀값 제거 설명 |

## 기술 근거
- [Transactional Outbox Pattern](https://microservices.io/patterns/data/transactional-outbox.html): 업무 변경 및 outbox를 동일 트랜잭션 저장, 독립 relay 중복 처리.
- [RFC 9110 §9.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2): safe는 요청이 의도한 효과, idempotent는 반복 요청의 의도된 효과.
- [RFC 7578 multipart/form-data](https://www.rfc-editor.org/rfc/rfc7578): 업로드 전송 형식과 별개의 application/parser limits.
- [Jakarta Persistence 3.2 Version API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/version): 이 URL에서 실제로 `Annotation Interface Version` 및 optimistic lock failure 계약 직접 확인. 발견 당시 접근 미확정 상태를 현재 확인된 KEEP으로 재분류.
- [Java SE 25 ZoneRules](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/zone/ZoneRules.html): `getValidOffsets`의 gap / overlap 계약; [New York 2026 DST transitions](https://www.timeanddate.com/time/change/usa/new-york-state?year=2026)로 구체 날짜 대조.
- 기존 canonical의 Spring TestContext, JUnit, Flyway official Reference 메타데이터는 변경 없이 보존.

## 검증 범위 및 미완료
1. 13 Topic 전체 기존 수기 의미 감사의 findings/source를 이용해 **7건 수정/1건 유지**로 판정. 이번 변경만으로 108 Question을 새로 독립적으로 한 줄씩 채점했다고 주장하지 않는다.
2. Concept frontmatter, Markdown fenced code, Question JSON parse, changed keys/links and correct answers/type/difficulty/model/explanation 불변 확인.
3. **격리 PostgreSQL actual Preview → Apply → exact reimport, history/personal IDs/Reference 보존**: [자동 회귀 #39540979259](https://github.com/guseoh/csforge/actions/runs/39540979259) **SUCCESS**.
4. GitHub Repository Validation: 최종 정리 HEAD에서 PASS 여부 확인.
5. **Human Usage Check는 현재 사용자 요청으로 이 slice의 필수 검증에서 제외**한다. 자동화 UX나 실제 사용자 시연을 완료했다고 주장하지 않는다.
6. Production DB sync/import/deploy 금지. #203 전체 종료는 Spring·Security 영역과의 통합 상태도 별도 확인한 뒤 판정; 병합은 사용자 명시적 승인 뒤 수행.

## Spring / PostgreSQL 실제 Import 회귀 증거

[GitHub Actions #39540979259](https://github.com/guseoh/csforge/actions/runs/39540979259) — **SUCCESS** (검증 브랜치 임시 HEAD `1aa40fe0e75b8381a1f6b5979ec99067f33125a1`).

- Java 25 Spring Boot local mode, 새 Docker Compose PostgreSQL 16.4 및 Redis. `/api/auth/session`의 LOCAL 모드 확인, 빈 DB 최초 canonical **3,380 CREATED**.
- Backend Engineering 기존/교정 `6 Concept MD + 1 questions.json`을 실제 **Multipart Import Preview → Apply**로 순차 복원/적용: 원문 7 UPDATED, 교정본 7 UPDATED. JSON 파일 내 다른 8개 Question은 불변.
- 동일 7 source file 재import Preview **15 UNCHANGED / 0 UPDATED**, Apply **15 UNCHANGED / 0 UPDATED**. 전체 classpath canonical bootstrap **3,380 UNCHANGED / 0 UPDATED**.
- 다른 Backend Question의 실제 객관식 오답을 제출해 WrongNote·ReviewSchedule을 만든 뒤, Concept personal note와 WrongNote 메모를 저장하고 import 수행.
- `personal_note`, `concept_progress`, `quiz_session`, `attempt`, `wrong_note`, `review_schedule`, `review_history`, `question_answer`, `question_concept`, `concept_reference` 10개 테이블 전체 JSON-row digest와 6개 Concept stable ID, 기존 wrong Quiz result 그대로 보존됨. 추가 연결한 HARD Question의 4개 Concept 관계도 실제 DB 확인.
- 이 검증은 실제 API/DB import와 이력 보존 증거. **Human Usage Check는 최신 사용자 승인 정책상 요구하지 않으며 수행됐다고 주장하지 않는다**.
- 임시 workflow 제거 후 [최종 Repository Validation](https://github.com/guseoh/csforge/pull/257/checks) 결과를 따로 확인한다. Production 변경·병합 없음.
