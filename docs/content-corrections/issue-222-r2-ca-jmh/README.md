# Issue #222 R2 — OpenJDK JMH Reference 학습 경로 개선

기준 main 2862a92d9208153678f3b618df90fafe37cb2e09. 감사 PR #228의 CA 46관계 중 JMH 1관계만 교정.

기존 https://openjdk.org/projects/code-tools/jmh/ 주소는 이 검토 환경에서 HTTP 403이고, 해당 홈페이지의 자료가 존재하지 않는다고 판정한 적은 없다. 다만 **공식 OpenJDK 프로젝트가 관리하는 https://github.com/openjdk/jmh 저장소의 README는 직접 열람 가능**하며 benchmarking setup, synthetic code generation, standalone execution, samples와 측정상의 함정을 설명한다.

## 변경 계약

- computer-architecture.core.performance.microbenchmark-boundary의 단일 Reference URL을 공식 GitHub 저장소의 직접 학습 경로로 바꾸고 title/recommendation/relationNote를 목적에 맞게 보강한다.
- **동일 URL은 이미 Performance / Observability / Operations의 profiling-load-testing에서 사용 중**이다. 그래서 global title을 기존 `OpenJDK Java Microbenchmark Harness (JMH)`로 정확히 공유하고, 기존 글로벌 depth/recommendation은 비어 있는 상태를 그대로 따른다. Computer Architecture에 특화된 읽을 범위만 `relationNote`로 표현한다. Concept 본문/summary/contentKey, Question, Curriculum, schema, 제품 코드/Import 구현은 수정하지 않는다.
- Reader에서 JMH 사용법·초기화·benchmark 과최적화를 학습하는 데 실제 유효한 경로이며 사용자가 동일 문제를 재현하지 않는 한 과거 URL을 broken이라고 단정하지 않는다.
- 공식 근거: [OpenJDK JMH README](https://github.com/openjdk/jmh/blob/master/README.md) 및 [JMH Samples](https://github.com/openjdk/jmh/tree/master/jmh-samples).

## 병합 게이트

- [ ] Repository Validation SUCCESS.
- [x] 격리 PostgreSQL old→new Preview/Apply 및 full canonical 3,380 exact UNCHANGED, Concept/개인·퀴즈·오답 history 보존.
- [x] 비운영 React Reader 실제 URL·note·title, 375/768/1280px light/dark/키보드 외부 새 탭 acceptance.
- [x] QA 임시 파일 삭제 후 PR diff는 Content 1개 + 회귀 Test 1 + 증거 README 1; global URL metadata·복수 relation/order 0.

**Draft·사용자 승인 전 병합 금지 / Production DB Import·배포 금지.** UMD 44개 관계는 별도 감사 추적표에서 ACCESS_UNRESOLVED 유지.

## URL 전역 metadata 충돌 회귀 (2026-10-18)

초기 교정 커밋에서는 새 GitHub URL이 실제 Performance 영역에서 기존에 사용 중임을 놓치고 다른 global title/recommendation/depth를 선언했다. [초기 Repository Validation #39137372365](https://github.com/guseoh/csforge/actions/runs/39137372365)에서 `CaJmhReferenceCorrectionIntegrationTest` 포함 5개 테스트의 **full-pack exact reimport 3,380 UNCHANGED 조건 실패**로 바로 발견됐다. 외부 자료 문제나 콘텐츠 본문 문제가 아니라 **같은 URL 전역 Reference 엔티티의 metadata collision**이다. 이 버전을 PASS로 취급하지 않는다.

수정: 전역 메타데이터를 기존 Performance 영역과 동일하게 하고 관계별 읽을 범위만 `relationNote`로 설정. 새로운 최종 CI가 SUCCESS일 때만 완료를 승인하며, 처음 실패한 근거도 보존한다.

## 충돌 교정 이후 실제 검증 결과 — 2026-10-18

- [격리 Import + Chromium QA #39137783241](https://github.com/guseoh/csforge/actions/runs/39137783241) **SUCCESS**. Backend tests에서 JMH 교정 old→new preview/apply, 같은 URL의 Performance 영역 global metadata 공유, full canonical exact 재import **3,380 UNCHANGED / ERROR 0**, Concept 및 personal_note/attempt/wrong_note 이력 보존 검증.
- 격리 PostgreSQL 16.4에서 `EMPTY → 3,380 CREATED / ERROR0 → READY`. React API에서 `microbenchmark-boundary`의 JMH URL·title·relationNote 실제 읽힘. 375/768/1280px × light/dark 6화면, overflow 0, keyboard focus→Enter→공식 GitHub 새 탭→Reader 복귀 모두 PASS. JS page errors 0.
- [같은 실행의 GitHub Actions Artifact](https://github.com/guseoh/csforge/actions/runs/39137783241): `pr234-ca-jmh-browser-evidence`에 `report.json`과 한국어 스크린샷 6장. ZIP을 내려받아 375 light와 1280 dark 등 실제 화면을 육안 확인. 개발 서버의 비차단 console 404 warning 1건은 여전히 존재하므로 무경고로 보고하지 않음.
- 검증에만 사용한 PostgreSQL service/workflow 변경/브라우저 스크립트는 [커밋 `4e2c96cb`](https://github.com/guseoh/csforge/commit/4e2c96cbf5a5f3e555868a17dd8ba59fd27ee862)에서 PR diff에서 원복. Production DB/배포/병합 작업은 하지 않음.
- 남은 단일 게이트: **임시 스크립트 원복 후 최종 HEAD의 일반 Repository Validation SUCCESS**, changed file scope/PR state 확인 및 사용자의 merge 승인.
