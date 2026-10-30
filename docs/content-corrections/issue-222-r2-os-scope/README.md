# Issue #222 R2 — OS Reference 학습 범위 최소 정정

[감사 PR #238](https://github.com/guseoh/csforge/pull/238)에 기술한 OS 미확정 14관계 중 **두 개만** 출처의 실제 검색 색인 내용에 맞춰 Reader 안내 문구를 제한한다.

- `operating-systems.core.io.async-io`: Kakao `posts/680`은 io_uring의 실제 운영 도입/성능 실측을 확정한 기사가 아니라, 제출/완료 큐·SQPOLL·Go 런타임 제약을 **검토하고 도입 보류**한 사례다. `recommendation` 과장 수정 및 Concept 전용 `relationNote` 추가.
- `operating-systems.core.isolation.cgroup`: NAVER D2 `7248350`은 **cgroups v1** memory.limit_in_bytes·memory.soft_limit_in_bytes 예제. Java/Spring의 Linux 현행 `memory.max` 등 v2 의미를 보증하는 자료로 쓰지 않도록 `relationNote`만 추가.
- Concept 본문·Question·key·URL·displayOrder·기존 Reference 관계는 불변. `reference` 글로벌 메타데이터 충돌 없이 import해야 함. 원본 직접 본문 검증 성공을 의미하지 않으므로 역사적 OS 14 후보는 그대로 남긴다.
- 검증: Backend Repository Validation + Testcontainers old-to-new Preview/Apply 2 UPDATED, canonical exact import 3,380 UNCHANGED, global Reference ID·개인노트/quiz/오답 history 보존, Reader Human Usage 375/768/1280px light/dark 표시.
- Production Apply/배포는 직접 수행하지 않는다.

## 격리 Import·Reader QA 실증 — 2026-10-19

- [OS scope isolated Reader QA #39149618815](https://github.com/guseoh/csforge/actions/runs/39149618815) **SUCCESS**, [Artifact `pr239-os-scope-reader-qa`](https://github.com/guseoh/csforge/actions/runs/39149618815)에서 실제 `report.json` 및 **12개 PNG** 직접 확인. 375px 라이트/다크와 1280px 라이트/다크의 두 Concept 화면을 육안 검토했다.
- 임시 PostgreSQL 16.4에서 `EMPTY → READY`, 전체 canonical **3,380 CREATED / ERROR 0**, 같은 콘텐츠 두 번째 적용 **3,380 UNCHANGED**, `async-io`/ `cgroup`의 URL, title, `recommendation`, `relationNote`를 API와 React Reader에서 실제 대조.
- 2개 Concept × **375/768/1280px × light/dark = 12 화면** 모두 PASS, 페이지·Reference overflow 0. 4개 Reference 전부 키보드 focus → Enter → 외부 새 탭 → Reader 복귀 PASS. JS `pageerror` 0. 기존 개발 서버 비차단 **console 404 경고 1개**는 남겨 두며 모든 콘솔 경고가 없었다고 주장하지 않음.
- 별도 [원본 정규 CI #39149413622](https://github.com/guseoh/csforge/actions/runs/39149413622) **SUCCESS**. `OsSourceScopeReferenceCorrectionIntegrationTest`에서 기존 두 Markdown → 교정 두 Markdown Preview/Apply, **UPDATED 2**, 기존 글로벌 Reference ID 유지, personal_note/attempt/wrong_note digest 동일, 전체 exact reimport 3,380 UNCHANGED를 검증.
- 같은 QA에서 `reconcile.py`를 실행하여 현재 canonical **15 Area / 721 Concept / 1,042 Reference 관계 / 622 URL / global metadata 충돌 0** 및 후속 **17 verified / 131 pending**를 재확인. 이 두 URL은 그대로이므로 **원문 직접 검증 완료 수치에 추가하지 않음**.
- 시험용 PostgreSQL service/Chromium 스크립트/CI 변경은 본 커밋에서 모두 제거하고 최종 PR diff는 **Content 2 + Testcontainers 1 + README 1**만 유지. 다음 게이트: 최종 HEAD 정규 Repository Validation 통과, 최신 `main`과 충돌 없음/상세 리뷰 확인 후 squash merge. 별도 수동 Production Import·Cloud Run 배포 없음.
