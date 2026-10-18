# Issue #222 R3 — Reference Reader UX 구현 및 검증

기준 `main`: `3624fd71d7ed96278dfc6baa27d3e020b6ed6346`. [Issue #222](https://github.com/guseoh/csforge/issues/222), [관련 #209](https://github.com/guseoh/csforge/issues/209).

## 이번 Slice

- 기존 `ReferenceDetail` API/DTO와 Concept 내용·개인 노트·Quiz/Review 동작을 변경하지 않고 `ConceptReferences` 표시 컴포넌트만 추가.
- 자료 유형/언어/읽기 깊이를 사용자 중심의 **한국어 라벨**로 표시. 알려지지 않은 `language/depth`를 억지로 번역하거나 새로운 상태/데이터 모델로 선언하지 않음.
- 자료 전역 안내 `recommendation`은 **자료 추천 이유**, 개별 Concept 전용 `relationNote`는 **이 개념에서 확인할 점**으로 분리. 빈 값/중복된 문구는 한 번만 출력.
- 링크의 **새 탭에서 열기**를 명시하고 `noopener noreferrer`, 보이는 키보드 포커스, reduced-motion, 좁은 화면/긴 한글 문단의 줄바꿈 지원.
- 손상된 문자열 또는 `javascript:/data:`처럼 외부 HTTP(S)가 아닌 주소는 클릭 가능한 링크로 만들지 않는다. 별도 link checker, 정확성 배지, Backend API, DB Schema 도입 없음.
- #209가 소유한 Reader의 3열 레이아웃/TOC/학습 조작/노트는 수정하지 않음.

## 검증 이력과 실제 증거 (2026-10-19)

- [최초 정규 Repository Validation #39142820884](https://github.com/guseoh/csforge/actions/runs/39142820884): **SUCCESS**. Backend tests/build, frontend lint/6개 새 Reference 유닛 테스트 포함 전체 테스트/TypeScript build, Compose. Cloud Run deploy SKIPPED.
- [일회성 Chromium QA #39143126853](https://github.com/guseoh/csforge/actions/runs/39143126853): **FAIL**. 3개 Concept API/5링크는 PASS였으나 QA 스크립트 변수명이 `opening`인데 `open`으로 검사한 실수로 실패. 제품 코드 실패가 아니며 기록 보존.
- [QA 변수명 교정 후 #39143790662](https://github.com/guseoh/csforge/actions/runs/39143790662): **SUCCESS**. 3 Concept/5 링크/18 화면/키보드 새 탭 동작 PASS. 하지만 캡처 육안 검수에서 오래된 CSS의 `.reference-item span` 선택자가 안내 문구의 색·글자 크기를 덮어 가독성을 떨어뜨리는 것을 발견.
- [가독성 CSS 수정 후 최종 실제 Chromium #39144407480](https://github.com/guseoh/csforge/actions/runs/39144407480): **SUCCESS**. 일회성 PostgreSQL 16.4 `EMPTY → READY`, 전체 canonical 3,380 CREATED/ERROR0, **2차 exact import 3,380 UNCHANGED**. Security `user-details`(2), Infrastructure `backup-restore`(2), OS `user-level-thread`(1) 등 실제 Concept API와 React Reader에서 5개 공식 URL·제목·한국어 안내·새 탭 명시 확인.
- **375/768/1280px × light/dark × 3 Concept = 18장 PNG**. 카드/문서 가로 overflow 0, 모든 링크 keyboard focus→Enter→external popup→Reader 복귀 PASS. JS pageerror 0. 콘솔에 경로 미상 비차단 404 경고 1개는 관찰되었고 이를 무경고로 주장하지 않음.
- 해당 Actions Artifact `pr236-r3-reader-human-qa`에는 실제 `report.json`, 전후 본문 스크린샷 18장, baseline `reconcile-current.json` 포함. 최종 375px Security 라이트·768px Infrastructure 다크 등 실제 PNG를 내려받아 변경 전보다 안내 문구가 뚜렷한 것까지 육안 확인.
- Vitest에 6개 독립 사례: 한국어/경계 라벨, 빈/중복 추천문, 알 수 없는 language/depth, 위험한 URI 클릭 차단, 긴 제목/HTML escaping, 빈 Reference 리스트.

## 후속/게이트

이번 검증의 일회성 PostgreSQL·Chromium 구성, `.github/workflows/repository-validation.yml` 수정, `browser-check.cjs`는 최종 PR diff에서 전부 원복한다. 최종 PR 변경 범위는 **frontend 4파일 + 근거 README**만 유지한다. 원래 CI가 복귀한 최종 HEAD에서 Repository Validation을 재확인하고 squash 병합하며, 병합 후 `main` CI도 확인한다.

Issue #222 전체 중 R2 관계 **133건 후속 원문 검토**는 그대로 남아 있으므로, **R3 Reader Slice 완료를 #222 전체 완료/Issue Close로 오해하지 않는다.** Production Import, Cloud Run 수동 배포, canonical 수정 없음.
