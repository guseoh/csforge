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


## 격리 PostgreSQL 및 Chromium 자동 검증 증거 (2026-10-20)

- [Database correction historical import #39417962339](https://github.com/guseoh/csforge/actions/runs/39417962339): **SUCCESS**, `historical-database-import`와 `database-reader-quiz` 모두 PASS. 검증 당시 HEAD `b34b4771e31a46f6471dc81e8005f7db6d6cf01e`.
- 기준 원본은 불변 `main 392ffccf90b733dfe191e222b2af15b407e42033`의 `content/database`를 `git archive`로 추출했다. Testcontainers PostgreSQL 16.4에서 교정된 canonical 전체 3,380개 bootstrap 후 6 Concept/4 Question의 이전 파일 내용을 복원·적용했다.
- 이전 상태로 되돌리기와 교정본 복귀 각각 **10 UPDATED, 0 ERROR/FAILED**. 동일 교정 파일의 반복 Import는 UPDATED 0, 전체 canonical bootstrap 반복은 **3,380 UNCHANGED**를 확인했다.
- `personal_note`, `quiz_session`, `attempt`, `wrong_note`, `review_schedule`, `review_history`, `concept_progress` 테이블 내용과 전체 Concept/Question stable ID, Reference 관계 총수 불변을 검증했다.
- Chromium Reader는 MVCC visibility / window function / serializable 3개 본문 × 375/1280px × light/dark 총 12개 조건에서 표시, 오류 없음 및 수평 overflow 여부를 검사했다.
- Quiz는 `database.core.sql.select-order.q1` 실제 교정 JSON의 단답형 입력을 375/1280px × light/dark 4개 조건에서 점검했다. 총 **16개 브라우저 조건 PASS**, 16개 screenshot을 `database-reader-quiz-screenshots` artifact에 보존했다.
- 검증 화면은 실제 React Reader/Quiz 경로이지만 **API fixture** 기반이며 실제 backend 연결/Production 이용자 Human Usage Check를 대체하지 않는다. PostgreSQL 역시 격리 컨테이너이며 운영 DB를 변경하지 않았다.
- 일회성 regression test/script/workflow는 성공 후 삭제하되 GitHub Actions 실행 이력·artifact와 본 증거 문서는 유지한다. 이후 최종 정리 HEAD에서 Repository Validation을 재검증한다.

## 최종 통합 리뷰 보완 (2026-10-21)

- `normalization.md`의 삽입/삭제 이상 설명을 점검하면서 FK `ON DELETE CASCADE`의 **삭제 방향**이 모호하게 읽힐 수 있음을 추가 발견했다.
- `orders.member_id → member.id` 관계에서 **회원(참조 대상) 삭제 → 주문(참조 행) 삭제**로 방향을 명확히 했다. **주문 삭제 → 회원 삭제**가 CASCADE의 의미는 아니라는 점을 명시했다.
- 확인 근거: [PostgreSQL 16 §5.4 Foreign Keys](https://www.postgresql.org/docs/16/ddl-constraints.html).
- 동일한 기존 Concept의 본문만 보강했으며 contentKey, frontmatter, Reference, Question 및 메타데이터는 유지한다.
- 앞서 실행한 area 별 PostgreSQL·Chromium QA는 이전 교정 HEAD 기준이다. 이 추가 문구를 포함한 HEAD의 Repository Validation 및 3 Area 합본 라이브 QA는 후속 실행에서 별도 확인한다.

## Issue #202 — 실제 Human Usage Check 발견 단답형 오채점 교정 (2026-10-21)

- 근거: [Issue #202의 사용자 주도 Sandbox Human Usage Check](https://github.com/guseoh/csforge/issues/202#issuecomment-6305601913). `database.core.index.btree.q2`의 정렬/하한 탐색/인접 리프 순회 설명이 의미상 올바르지만 `ShortAnswerGradingStrategy`의 trim+lowercase 후 `acceptedAnswers` **완전 일치** 정책으로 오답 처리되는 false negative를 재현.
- 교정: `content/database/index/questions.json`의 기존 문항에 수동 검증 입력 `B-tree는 키를 정렬된 상태로 유지하므로 하한 위치를 찾은 뒤 인접한 리프 엔트리를 순서대로 스캔할 수 있다.`를 **정확히 하나의 acceptedAnswers로 추가**(8 → 9). 해당 문항 외 Question·Concept, 난도/유형, 정답 설명, contentKey, Reference, 채점 알고리즘은 변경하지 않았다.
- [일회성 격리 Spring/PostgreSQL/Chromium 회귀 #39530733270](https://github.com/guseoh/csforge/actions/runs/39530733270) **SUCCESS** (검증 HEAD `8d4c6e3c0c918e8c01e9b78e038145ec99860774`). Job `btree-live-postgres-browser` 성공; screenshot artifact `issue202-btree-corrected-result`, ID `12315218063`.
- 실증 순서: 새 격리 PostgreSQL에 이전 PR #254 HEAD(`9840cba0`)로 전체 canonical **3,380 CREATED, ERROR 0** → 해당 문항의 허용 답안 8개 확인 → 동일 답을 실제 API로 제출하여 **오답 판정, Wrong Note 1건, ReviewSchedule 1건** 생성 → 수정된 9개 허용 답안 파일의 실제 **Import Preview(1 UPDATED) → Apply(1 UPDATED)** → 재import **8 UNCHANGED, UPDATED 0** → 기존 question ID 및 허용 답안 행 ID·WrongNote/Attempt/ReviewSchedule/QuizSession 건수 보존 → 새 Quiz를 Chromium 실제 프런트에서 열어 동일 답을 입력·제출, **결과 `GRADED`, `correct=true`** 및 DB에 맞는 정답 Attempt가 저장됨을 확인. 이전 오답 기록은 오답 그대로 남음.
- `CanonicalBootstrapService`는 실행 중인 백엔드의 classpath 패키징된 `canonical-content`를 읽으므로, 실행 후 소스 파일을 수정하고 bootstrap 호출만으로 변경을 감지한다고 가정하면 안 된다. 이 테스트는 최종적으로 **Multipart `/api/imports/preview` + `/api/imports/apply`**의 실제 경로로 재검증했다.
- 실패한 앞선 회귀 시도는 테스트 하네스의 성공 응답 body 이중 소비 및 실행 중 패키징 리소스 갱신 가정 때문이며, 콘텐츠 교정 자체의 실패 증거가 아니다. 성공한 런의 증거를 기준으로 판정한다.
- 검증용 script/workflow는 실행 성공 후 제거하고 이 문서·실행 로그·스크린샷만 유지한다. 사용자 Work Sandbox의 데이터는 폐기되는 임시 환경으로, 여기서 기존 WrongNote를 직접 변경하거나 재채점하지 않았다.
- **한계/남은 게이트**: 이는 *해당 재현 답안 한 건*의 정답 false negative 해소이며 자유 서술 전체에 대한 의미 채점 보장은 아님. 3 Area 전체 Content Full Review, 사용자 승인, 합본 Preview/Apply 및 실사용 Human Usage Check 최종 판정은 Issue #202의 별도 게이트. 세 PR Draft·미병합, Production DB 변경 없음.
