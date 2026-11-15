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
