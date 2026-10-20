# Issue #202 — Database 정밀 교정 checkpoint

> Draft / 미병합. 이 문서는 Database Slice의 변경 증거이며 Issue #202 전체 완료 또는 Production 반영 승인이 아니다.

## 기준과 검토 범위

- 교정 기준 `main`: `392ffccf90b733dfe191e222b2af15b407e42033`.
- 상위 계약: [Issue #202](https://github.com/guseoh/csforge/issues/202).
- 기존 [Wave 2 Database 전수 감사](../../content-audit/learning-experience-2026/wave-2/database.json)의 **12 Topic · 38 Concept · 75 Question** 검토 근거를 현재 canonical과 대조.
- 이번 Slice는 신규 Concept/Question을 생성하거나 Curriculum/Topic 소유권을 바꾸지 않는다. **6 Concept Markdown + 4 Question**의 내용만 변경한다. 원래 contentKey, Level, 질문 유형·난도·상태, Concept 연결, 정답 키와 기존 Reference frontmatter 보존.
- 기존 W2-DB 10건 중 P0 2 / P1 7 / P2 1을 모두 적용 대상으로 채택. 별도 신규 수기 전수 재채점을 했다고 주장하지 않는다.

## 발견별 교정 재판정 및 결과

| Finding | Priority | 대상 key | 교정 내용 |
| --- | --- | --- | --- |
| W2-DB-001 | P1 | `database.core.model.normalization` | 기존 주문·회원 예로 주문 없는 회원의 삽입 이상, 마지막 주문 삭제 시 회원 사실 상실과 별도 FK 삭제 정책 설명 |
| W2-DB-002 | P1 | `database.core.model.relation-tuple.q2` | 정렬 반복 대신 SQL bag, DISTINCT 결과 중복 제거, PK/UNIQUE 저장 제약 구별 |
| W2-DB-003 | P0 | `database.core.sql.select-order.q1` | HAVING을 언급하지 않은 비응답 acceptedAnswers 제거 |
| W2-DB-004 | P1 | `database.core.sql.window-function` | 같은 created_at의 기본 RANGE peer 누적합과 ROWS·유일 정렬 비교 |
| W2-DB-005 | P2 | `database.core.index.covering-index.q2` | 기존 visibility map 중복 문항을 INCLUDE 키/payload와 큰 컬럼 비용 trade-off로 전환 |
| W2-DB-006 | P1 | `database.core.optimizer.statistics` | 최신 통계여도 값별 custom/generic plan 차이, EXPLAIN EXECUTE와 측정 경계 설명 |
| W2-DB-007 | P1 | `database.core.isolation.serializable` | 최종 40001 재시도 예산 소진 시 예외 전달, 다음 시도가 있을 때만 backoff |
| W2-DB-008 | P0 | `database.core.locking.row-lock.q2` | 충돌 원인만 설명하고 대기 동작이 없는 오답 acceptedAnswers 제거 |
| W2-DB-009 | P1 | `database.core.mvcc.visibility` | old/new tuple의 xmin/xmax, 미커밋/커밋/롤백/고정 스냅샷 상태 및 xmax lock 주의 |
| W2-DB-010 | P1 | `database.core.query-patterns.keyset-pagination` | 정렬 경계를 cursor 800의 **뒤**로 이동, strict tuple < 조건의 중복 방지 명시 |

## 검토 근거

PostgreSQL 공식 계약 기준으로 내용과 구현 의존성을 구별한다.

- [Window Functions Tutorial](https://www.postgresql.org/docs/current/tutorial-window.html): 기본 frame의 peer 포함, PARTITION/ORDER 구별.
- [PREPARE](https://www.postgresql.org/docs/current/sql-prepare.html), [EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html): custom/generic plan, parameter 선택도, 실제 측정 방식.
- [Index-Only Scans](https://www.postgresql.org/docs/current/indexes-index-only-scans.html): INCLUDE payload, visibility map과 폭넓은 인덱스 비용.
- [Serialization Failure Handling](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html): SQLSTATE 40001, 전체 transaction 재시도 및 실패 가능성.
- [Storage Page Layout](https://www.postgresql.org/docs/current/storage-page-layout.html), [Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html): heap tuple 생성/무효화 트랜잭션 필드, 문장·트랜잭션 스냅샷.
- [Row Locking](https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-ROWS), [Index-Only Scans](https://www.postgresql.org/docs/current/indexes-index-only-scans.html), [Row Comparison](https://www.postgresql.org/docs/current/functions-comparisons.html#ROW-WISE-COMPARISON): 대기, INCLUDE, 커서 경계.

## 구조 확인

- Question JSON 12개 전체 파싱: 75 문항 유지 (MULTIPLE_CHOICE 13 / SHORT_ANSWER 22 / DESCRIPTIVE 19 / SCENARIO 21), 필수 필드·정답 키·MC rationale·SHORT_ANSWER 필수 답안 검사 오류 0.
- 전체 38 Concept MD frontmatter/Reference URL 유일성/코드 펜스/ContentKey 구조 검사 오류 0.
- P0 두 문항의 acceptedAnswers는 각각 `HAVING` 포함 또는 T2의 **대기 동작**을 명시하는 답만 남김.
- 기존 38/75 전수 감사 ledger의 구조·판정 범위에 이번 변경 영향 비교를 더했으며 모든 Concept/Question의 최신 본문과 정답을 별도로 독립 수기 재채점했다는 의미는 아니다.

## 남은 검증·병합 Gate

1. 최종 HEAD Repository Validation PASS 및 changed-key/metadata 불변 확인.
2. 과거 `main` canonical → 수정 Database Pack의 **격리 PostgreSQL Preview/Apply/exact reimport UNCHANGED**, 개인/history 및 stable ID 보존 확인.
3. 실제 Reader/Quiz를 375/1280px 및 light/dark에서 본문·단답 문항·누적합 표·코드 출력 검증. 자동 UI fixture QA와 실제 백엔드 연계 Human Usage Check를 구분.
4. 사용자 승인 없이 PR merge 또는 Production Import 금지. Network PR #253과 충돌 없이 별도 Slice 진행.
5. #202의 DSA 84 Concept/전체 문항 작업은 별도 Slice로 남음. Issue #202는 Open 유지.
