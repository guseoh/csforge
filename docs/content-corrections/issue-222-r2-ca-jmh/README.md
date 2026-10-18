# Issue #222 R2 — OpenJDK JMH Reference 학습 경로 개선

기준 main 2862a92d9208153678f3b618df90fafe37cb2e09. 감사 PR #228의 CA 46관계 중 JMH 1관계만 교정.

기존 https://openjdk.org/projects/code-tools/jmh/ 주소는 이 검토 환경에서 HTTP 403이고, 해당 홈페이지의 자료가 존재하지 않는다고 판정한 적은 없다. 다만 **공식 OpenJDK 프로젝트가 관리하는 https://github.com/openjdk/jmh 저장소의 README는 직접 열람 가능**하며 benchmarking setup, synthetic code generation, standalone execution, samples와 측정상의 함정을 설명한다.

## 변경 계약

- computer-architecture.core.performance.microbenchmark-boundary의 단일 Reference URL을 공식 GitHub 저장소의 직접 학습 경로로 바꾸고 title/recommendation/relationNote를 목적에 맞게 보강한다.
- 같은 URL의 다른 canonical 사용처는 없으며, Concept 본문/summary/contentKey, Question, Curriculum, schema, 생산 코드/Import 구현은 전혀 수정하지 않는다.
- Reader에서 JMH 사용법·초기화·benchmark 과최적화를 학습하는 데 실제 유효한 경로이며 사용자가 동일 문제를 재현하지 않는 한 과거 URL을 broken이라고 단정하지 않는다.
- 공식 근거: [OpenJDK JMH README](https://github.com/openjdk/jmh/blob/master/README.md) 및 [JMH Samples](https://github.com/openjdk/jmh/tree/master/jmh-samples).

## 병합 게이트

- [ ] Repository Validation SUCCESS.
- [ ] 격리 PostgreSQL old→new Preview/Apply 및 full canonical 3,380 exact UNCHANGED, Concept/개인·퀴즈·오답 history 보존.
- [ ] 비운영 React Reader 실제 URL·note·title, 375/768/1280px light/dark/키보드 외부 새 탭 acceptance.
- [ ] 최종 PR delta Content 1개 + 회귀 Test 1 + 증거 README 1; global URL metadata·복수 relation/order 0.

**Draft·사용자 승인 전 병합 금지 / Production DB Import·배포 금지.** UMD 44개 관계는 별도 감사 추적표에서 ACCESS_UNRESOLVED 유지.
