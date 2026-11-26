# Database 시각화 G1 전수 조사 및 개선 기록

기준: `refactor` @ `997393f8663c080dee4cf76818d0aa7ec7db855d`; 12 Topic / **38 Concept** / PostgreSQL 16+.

## 조사 및 분류

38개 Concept의 Markdown 코드 블록·이미지·시각화 선언을 전수 조사했습니다. 별도의 이미지 또는 `csforge-viz` 선언은 없고, 기존 `text`/SQL 설명이 있습니다.

| 분류 | 개수 |
| --- | ---: |
| REBUILD | 9 |
| ADD | 2 |
| KEEP | 21 |
| POLISH | 5 |
| REWORK | 1 |

| Concept | 분류 | 상태 |
| --- | --- | --- |
| `index/btree.md` | REBUILD | G1 SVG 반영 |
| `index/composite-index.md` | ADD | G1 SVG 반영 |
| `index/covering-index.md` | KEEP | 원본 유지·추가 검토 대상 |
| `index/partial-index.md` | KEEP | 원본 유지·추가 검토 대상 |
| `isolation/anomalies.md` | REBUILD | G1 SVG 반영 |
| `isolation/read-committed.md` | REBUILD | G1 SVG 반영 |
| `isolation/serializable.md` | POLISH | G1 SVG 반영 |
| `locking/deadlock.md` | REBUILD | G1 SVG 반영 |
| `locking/pessimistic.md` | KEEP | 원본 유지·추가 검토 대상 |
| `locking/row-lock.md` | POLISH | G1 SVG 반영 |
| `model/normalization.md` | KEEP | 원본 유지·추가 검토 대상 |
| `model/null-three-valued.md` | KEEP | 원본 유지·추가 검토 대상 |
| `model/relation-tuple.md` | KEEP | 원본 유지·추가 검토 대상 |
| `mvcc/cleanup.md` | POLISH | G1 SVG 반영 |
| `mvcc/versions.md` | REBUILD | G1 SVG 반영 |
| `mvcc/visibility.md` | REBUILD | G1 SVG 반영 |
| `optimizer/cost-estimate.md` | KEEP | 원본 유지·추가 검토 대상 |
| `optimizer/explain.md` | REWORK | G1 SVG 반영 |
| `optimizer/statistics.md` | KEEP | 원본 유지·추가 검토 대상 |
| `query-patterns/batch-n-plus-one.md` | KEEP | 원본 유지·추가 검토 대상 |
| `query-patterns/keyset-pagination.md` | ADD | G1 SVG 반영 |
| `query-patterns/offset-pagination.md` | KEEP | 원본 유지·추가 검토 대상 |
| `replication/failover.md` | KEEP | 원본 유지·추가 검토 대상 |
| `replication/lag.md` | KEEP | 원본 유지·추가 검토 대상 |
| `replication/primary-replica.md` | REBUILD | G1 SVG 반영 |
| `schema/foreign-key.md` | KEEP | 원본 유지·추가 검토 대상 |
| `schema/primary-key.md` | KEEP | 원본 유지·추가 검토 대상 |
| `schema/unique-check.md` | KEEP | 원본 유지·추가 검토 대상 |
| `sql/aggregate.md` | KEEP | 원본 유지·추가 검토 대상 |
| `sql/join-semantics.md` | POLISH | G1 SVG 반영 |
| `sql/select-order.md` | KEEP | 원본 유지·추가 검토 대상 |
| `sql/window-function.md` | KEEP | 원본 유지·추가 검토 대상 |
| `storage/checkpoint-recovery.md` | KEEP | 원본 유지·추가 검토 대상 |
| `storage/pages-buffer.md` | REBUILD | G1 SVG 반영 |
| `storage/wal.md` | REBUILD | G1 SVG 반영 |
| `transaction/acid.md` | KEEP | 원본 유지·추가 검토 대상 |
| `transaction/atomic-write.md` | POLISH | G1 SVG 반영 |
| `transaction/autocommit.md` | KEEP | 원본 유지·추가 검토 대상 |

## G1 구현 범위

총 17개 Database Concept의 첫 ASCII 도식을 교재형 SVG 이미지로 대체했습니다. 독립 SVG의 접근성 `title`/`desc`, 가변 `viewBox`, 한국어 라벨, 별도 라이트/다크 팔레트를 설정했습니다. 페이지, 트리, 스냅샷, wait-for 관계, 플랜 트리, WAL, 복제 지연 등 각 개념의 실제 관계를 그림으로 표현합니다.

변경 경계: `content/database/**`, `frontend/public/learning/database/**`, `docs/content-audit/database-visualization-g1.md`뿐입니다. 다른 LearningArea, 공통 렌더러, API/DB, 개인 이력·canonical ID는 변경하지 않습니다.

## 공식 검증 근거

- B-tree 내부·리프 페이지: https://www.postgresql.org/docs/16/btree-implementation.html
- 다중 컬럼 B-tree: https://www.postgresql.org/docs/16/indexes-multicolumn.html
- 격리 수준·스냅샷: https://www.postgresql.org/docs/16/transaction-iso.html
- 행 버전과 HOT: https://www.postgresql.org/docs/16/storage-hot.html
- 행 잠금·교착 상태: https://www.postgresql.org/docs/16/explicit-locking.html
- EXPLAIN rows/loops: https://www.postgresql.org/docs/16/using-explain.html
- WAL 기록 및 flush: https://www.postgresql.org/docs/16/wal-intro.html
- 비동기 Streaming Replication: https://www.postgresql.org/docs/16/warm-standby.html

이 그림들은 PostgreSQL 16을 기준으로 하며 MySQL/InnoDB의 undo, next-key lock, 격리 수준 구현이 동일하다고 주장하지 않습니다. 특히 `REPEATABLE READ`는 첫 쿼리 시점 스냅샷, `READ COMMITTED`는 문장별 스냅샷이고, `EXPLAIN ANALYZE` 노드의 actual rows는 loops당 평균입니다.

## 검증 상태 및 남은 과제

- 정적 검사: 17개 SVG의 title/desc/viewBox·금지 요소·텍스트 위치 기초 검사, 17개 canonical MD의 이미지 경로·frontmatter·코드 펜스 확인
- 자동 정적 QA: SVG 17개 모두 기본 태그 균형, 고유 ID, 접근성 title/desc, viewBox, 금지 태그·외부 리소스, 텍스트/도형의 화면 범위 추정 검사를 통과했습니다. 전체 XML 스키마 검증과 실제 렌더링을 대체하지는 않습니다.
- 17개 변경 Markdown의 이미지 연결·frontmatter·코드 펜스를 확인했습니다. refactor 기준 변경은 35개 Database 전용 파일로 제한됩니다.
- commit `f9d5b477cd18d3a584f2440fbf64568c9d9c0e52`의 Vercel 미리보기는 READY입니다. 이는 콘텐츠 Import 및 자동 테스트 통과를 뜻하지 않습니다.
- Reader 라이트/다크·900px/1280px 실화면 QA, Import Preview/Apply/동일 파일 재import, Repository Validation은 미실행으로 유지합니다.
- 외부 SVG의 `prefers-color-scheme`은 OS 테마를 기준으로 하므로 Reader의 앱 내부 테마와 다른 경우 팔레트가 일치하지 않을 수 있음
- KEEP 21개 Concept는 원본을 유지했고, REBUILD/REWORK/POLISH/ADD로 분류된 나머지 17개에 SVG를 반영했습니다.

## G1 보강

추가 6개 Concept에 독립 SVG를 적용해 전수 분류의 17개 REBUILD/REWORK/POLISH/ADD 대상을 모두 반영했습니다. 비대상 21개 KEEP Concept는 그대로 유지했습니다. 다만 모든 변경의 브라우저·Import 검증은 별도 증거가 확인되기 전까지 미완료입니다.

## 후속 정적 QA 정리

- 복합 인덱스 그림에서 2픽셀짜리 의미 없는 화살표를 제거했습니다.
- Keyset 그림을 행별 복합 키와 정확한 커서 경계가 보이도록 수정했습니다.
- 현 단계에서 자동 정적 검사와 Markdown 연결 검사는 가능하지만, Reader 실제 화면의 라이트·다크·두 데스크톱 폭 테스트 및 격리 Import/재import는 **미검증**입니다.
- `repository-validation.yml`은 `refactor` 대상 PR 이벤트에서 실행되지 않도록 구성되어 있으므로, 별도 CI가 자동으로 시작되지 않는 것을 통과로 간주하지 않습니다. Vercel 상태와 Repository Validation 테스트를 구별합니다.

## Preview API/정적 파일 분리 진단

- `/learning/database/g1-check.html?id=122`에 Database 전용 읽기 전용 검증 화면을 추가했습니다. 17개 SVG 원본, Preview 빌드 SHA, `/api/public/concepts/:id`의 실제 `contentKey`와 본문에 포함된 새 이미지 경로를 **브라우저에서** 비교합니다.
- 이 화면은 Import 권한이나 비밀 키를 사용하지 않으며 Production DB에 쓰지 않습니다. 정적 SVG 자체의 접근성과 API 본문 출처를 분리하여 진단합니다.
- 원인 구조: `frontend/vercel.ts`는 `/api/` 요청을 `CSFORGE_BACKEND_ORIGIN`의 백엔드로 전달합니다. `.github/workflows/content-sync.yml`은 `main`에서 Repository Validation 성공 후의 동기화만 허용합니다.
- 현재 사용 가능한 Neon 연결에서 CSForge 프로젝트가 조회되지 않았으므로 안전한 격리 DB의 Preview/Apply/UNCHANGED 검증과 실제 Reader 재연결은 **미완료**입니다. 정적 진단 화면을 정식 Reader E2E 검증으로 간주하지 않습니다.


## 격리 QA 최종 결과 (2026-11-15)

이 절은 위의 초기 `미실행/미검증` 상태 이후에 수행한 **독립 검증 결과**이며, 브랜치 Preview와 운영 DB의 일치를 의미하지 않습니다.

- QA 커밋: [`ac4056d2`](https://github.com/guseoh/csforge/commit/ac4056d2ecdc1034ccd7f81f0a147d1664b9fc89).
- [Database 전용 GitHub Actions #43705932453](https://github.com/guseoh/csforge/actions/runs/43705932453) — 세 Job 모두 **SUCCESS**.
- Database 전용 `DatabaseG1FullPackIntegrationTest`를 추가했습니다. Testcontainers의 **PostgreSQL 16.4** 격리 DB에서 전체 canonical bootstrap 후 17개 Concept의 **합성된 도식 이전 버전**을 적용하고, G1 본문을 재수입하여 **17 UPDATED**, 나머지 Database Item `UNCHANGED`, 동일 전체 Database 소스의 두 번째 수입 **전부 UNCHANGED**를 검증했습니다.
- 해당 변경 전후 Database Concept·Question ID, 전체 Reference ID 및 관계, 개인 이력 9종(`concept_progress`, `concept_view_history`, `personal_note`, `quiz_session`, `quiz_question`, `attempt`, `wrong_note`, `review_schedule`, `review_history`) 내용 보존을 검증했습니다.
- 변경 대상 17개 각각을 실제 Spring **`GET /api/public/concepts/{id}` HTTP 200**으로 조회해 `contentKey`와 `contentMarkdown`의 SVG URI를 확인했습니다. 이 통합 테스트는 격리 DB를 사용하는 로컬 백엔드에서 실행되었으며, Vercel Preview의 연결된 DB에서 실행한 것이 아닙니다.
- frontend 전용 Job: 17 SVG의 XML 및 canonical 경로 1:1 연결 **PASS**, JDK 25 환경에서 TypeScript lint와 **102개 테스트 파일·823개 테스트 PASS**, Vite build **PASS**.
- full backend Job: 기존 전체 Gradle `build` (백엔드 전체 테스트 포함) **SUCCESS**.
- 초기 frontend CI 실패는 테스트에 필요한 JDK 25 설정 누락이 원인이었고, 임시 QA workflow에서 수정하여 재검증을 통과했습니다. 제품 프런트엔드 코드 변경은 없었습니다.
- 검증용 `.github/workflows/database-g1-qa.yml`은 GitHub Actions 실행 후 **최종 PR 변경 범위에서 제거**합니다. PASS 실행 기록은 남지만 해당 workflow가 최종 Git 트리에 남아 있는 것은 아닙니다.
- **독립적인 남은 경계:** Vercel Preview에는 `CSFORGE_BACKEND_ORIGIN` 공통 Preview 백엔드 설정이 있고, canonical 콘텐츠 동기화는 검증된 `main` 기준으로만 활성화됩니다. 따라서 G1 브랜치의 새 Markdown이 Vercel의 `/concepts/122`에 나타나는지 확인할 **전용 Preview DB/백엔드**는 아직 없습니다. 사용자 시각 확인은 접수했지만, Production·Preview DB 버전 일치와 실제 Reader 다크/라이트·900/1280px 전수 자동화는 별도 미검증입니다.
- 연결된 Neon Plugin 계정에서는 CSForge 프로젝트를 찾지 못했습니다. 격리 Import와 Reader HTTP QA는 Testcontainers로 대체해 검증했지만, **전용 Vercel Preview API 연결 자체**를 개통하려면 접근 가능한 격리 백엔드/DB가 필요합니다. 승인 없는 운영 DB 쓰기·PR 병합은 하지 않았습니다.


## 2026-11-25 — 영역 단위 도식 및 콘텐츠 통합 개선

기준 HEAD: `766c791ca6df97637c228cb133a8d7d857feade4`. [이전 Reader CI](https://github.com/guseoh/csforge/actions/runs/45433976417)는 Ubuntu 24.04에서 실행한 isolated-reader Job SUCCESS입니다. 해당 성공은 기존 17개 SVG 및 이전 소스의 증거이며, 신규 SVG와 본문·문항 교정의 실행 검증으로 확대하지 않습니다.

### 본문 검토 및 수정 범위

이전 Wave 2 감사 보고서의 수정 후보가 현재 소스에서 이미 해결된 경우 중복 수정하지 않았습니다. 전체 12 Topic·38 Concept의 본문을 읽고 다음과 같이 국소 수정했습니다. 표에서 유지한 24개 본문은 이번 소스 편집 대상에서 제외했으며 독립 최종 품질 승인을 의미하지 않습니다.

| Topic | 전체 Concept | 수정 | 주요 판단 |
| --- | ---: | ---: | --- |
| Model | 3 | 2 | 정규화 FK 대상 이름, NOT IN의 UNKNOWN과 NOT EXISTS 비교 |
| SQL | 4 | 2 | 집계와 함수적 종속성, RANGE/ROWS frame 및 출력 순서 |
| Schema | 3 | 0 | 기존 식별자·제약·참조 무결성 설명 유지 |
| Index | 4 | 2 | Index-only scan의 VM/힙 접근, 부분 인덱스 수치와 NOT NULL 전제 |
| Optimizer | 3 | 0 | 기존 cost·loops·통계·generic/custom plan 설명 유지 |
| Transaction | 3 | 3 | 0행 UPDATE의 의미, autocommit 메시지 경계, 원자적 UPDATE 실행 순서 |
| Isolation | 3 | 0 | 기존 문장 스냅샷·SSI 재시도 설명 유지 |
| Locking | 3 | 1 | 충돌하는 잠금 요청 및 없는 행의 잠금 범위 |
| MVCC | 3 | 0 | 기존 xmin/xmax·snapshot·정리 설명 유지, 문항에서 가시성 목표 보강 |
| Storage | 3 | 1 | WAL 내구화와 데이터 파일 기록·성공 응답의 서로 다른 조건 |
| Replication | 3 | 1 | WAL 생성/로컬 커밋/원격 write·flush·replay의 관계 |
| Query Patterns | 3 | 2 | Offset 삽입·삭제 효과 및 keyset의 일관된 복합 커서 |
| 합계 | 38 | 14 | 24개 본문 유지 |

### 도식 개선

기존 17개 SVG의 title/desc/텍스트와 연결 본문을 확인했습니다. 새 분류는 KEEP 15, REWORK 2, ADD 2입니다. 기존 17개 도식 중 나머지 15개는 유지하며 최종 실화면 감사에 포함합니다.

- ADD `index-covering.svg`: B-tree 키와 INCLUDE 값, visibility map의 all-visible 여부에 따른 힙 접근 분기. 실제 실행 계획이 Index Only Scan으로 선택되었다는 조건을 명시했습니다.
- ADD `sql-window-frame.svg`: 동일한 세 주문을 같은 위치에 두고 첫 행의 RANGE/ROWS frame 비교. 기본 RANGE의 결과 3000/3000/3500, 고유 정렬 기준과 ROWS의 결과 1000/3000/3500.
- REWORK `storage-wal.svg`: 변경 WAL flush → 데이터 페이지 기록과 커밋 레코드 flush → 성공 응답을 별개 경로로 표현했습니다. fsync=on·synchronous_commit=on의 일반 영구 테이블을 전제로 하며 두 경로의 완료 순서는 고정하지 않습니다.
- REWORK `transaction-atomic-update.svg`: A가 먼저 잠금 획득 → B 대기 → A 커밋 → B 조건 재평가의 가능한 실행 순서. A 롤백 시 결과가 달라질 수 있음을 본문에 명시했습니다.

총 19개 SVG, 각 Concept에 1개씩 연결됩니다. 기존 public 진단 HTML은 이번 변경에서 보존한 역사적 도구로 신규 19개 coverage의 증거가 아닙니다.

### 문항 및 참조

현재 77개 Question(객관식 15, 단답형 22, 서술형 19, 시나리오 21)의 정답/답안 구조와 15개 객관식 전체 선택지·rationale를 확인하고 수정 후보의 문항 및 해설을 개별 검토했습니다. 비객관식 62개 각각의 prompt·답안·해설 전체에 대한 최종 독립 검토는 미완료입니다. 기존 감사 보고서의 75개는 당시 기준입니다. 이번 수정은 고유 6문항입니다.

- normalization.q1: 갱신 이상 해설에 삽입·삭제 이상 추가.
- join-semantics.q3: 두 테이블인데 세 테이블이라고 한 문구 교정.
- window-function.q1: 기존 최신 주문 동률 선택과 연결되는 누적 frame 계산 비교 추가.
- partial-index.q2: NOT NULL 가정 명시.
- autocommit.q2: SQL 문을 각각 별도 요청으로 실행한다는 조건 명시.
- visibility.q2: 격리 수준 재질문 대신 행 버전 메타데이터와 트랜잭션 상태 판정으로 학습 목표 보강. 기존 식별자는 유지하되 변경된 질문에 과거 답안이 자동으로 유효하다고 보장하지 않습니다.

77개 고유 contentKey 및 객관식 정답 키·선택지 rationale/단답 acceptedAnswers/서술·시나리오 modelAnswer 존재를 정적 확인했습니다. 기존 YAML frontmatter, 공통 Reference 메타데이터, Question 식별자·유형·객관식 정답 키·Concept 연결은 유지했습니다. 전체 Reference 링크의 현행 접근성과 모든 기술 주장에 대한 독립 공식 자료 대조는 미완료입니다.

이번 고위험 수정에 직접 확인한 PostgreSQL 16 공식 자료:

- https://www.postgresql.org/docs/16/indexes-index-only-scans.html
- https://www.postgresql.org/docs/16/tutorial-window.html
- https://www.postgresql.org/docs/16/runtime-config-wal.html
- https://www.postgresql.org/docs/16/warm-standby.html
- https://www.postgresql.org/docs/16/queries-limit.html
- https://www.postgresql.org/docs/16/protocol-flow.html
- https://www.postgresql.org/docs/16/sql-select.html
- https://www.postgresql.org/docs/16/indexes-partial.html
- https://www.postgresql.org/docs/16/explicit-locking.html
- https://www.postgresql.org/docs/16/storage-page-layout.html

### 실행 QA 이관 및 한계

사용자 확정 영역 단위 개선·전체 통합 QA 일정(CSF-0007)에 따라 소스 변경을 [skip ci] 커밋으로 반영했습니다. 기존 통합 테스트의 도식 목록을 19개로 확대하고 실제 Reader API fixture replay의 2테마×2폭 조건을 76건으로 조정했습니다. 19개 합성 이미지 이전 본문 UPDATED/전체 Database Pack 동일 재import UNCHANGED 및 이력 보존을 검사하도록 되어 있으나 최신 소스에서는 아직 실행하지 않았습니다. 이는 변경된 모든 문항과 비도식 본문의 이전 버전 업데이트 검증까지 포괄하지 않습니다. 최종 통합 QA에서 문항·본문 업데이트 및 개인 이력 보존 검증을 별도로 포함해야 합니다.

최신 refactor 대비 기존 분기에서 한 커밋 뒤처진 상태이므로 전체 영역 통합 전에 base drift와 충돌을 재확인해야 합니다. SVG 형식·픽셀/실화면(19개 전수), 최신 Import/재import·회귀 테스트, Reference 전수 검증 및 승인 미완료. Draft #301 유지. 운영 DB 쓰기, 병합, 배포 없음.
