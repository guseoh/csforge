# Issue #222 — R2 병합 후 3개 Reader 검증 및 Canonical 재집계

- 기준 `main`: `66aa3a693cdb21a79532c72c81c40aa0e7fab9ff`; 기존 [R2 감사](../issue-222-r2/README.md), [Issue #222](https://github.com/guseoh/csforge/issues/222).
- 실제 CI: [GitHub Actions #39140901504](https://github.com/guseoh/csforge/actions/runs/39140901504) **SUCCESS**. 동일 SHA의 [Artifact `issue-222-postmerge-reader-reconcile`](https://github.com/guseoh/csforge/actions/runs/39140901504): **`report.json`, `reconcile-current.json`, React Reader PNG 18장**.
- 이 검증은 GitHub PR branch의 **일회성 PostgreSQL 16.4 / Java 25 / Vite / headless Chromium**으로만 실행했다. Production PostgreSQL 및 Cloud Run/현행 사용자 데이터에 접근하지 않았다.

## A. 병합 후 실제 Reader Human Usage — 성공

| 원래 교정 PR | LearningArea/Concept | 실제 표시한 Reference |
| --- | --- | --- |
| [#227](https://github.com/guseoh/csforge/pull/227) | Security, `security.core.auth-architecture.user-details` | 공식 Spring Security `UserDetailsService`, `PasswordEncoder` 2개 |
| [#230](https://github.com/guseoh/csforge/pull/230) | Infrastructure & Cloud, `infrastructure.core.reliability.backup-restore` | 갱신 NIST SP 800-34 `/r1/upd1/final`·PostgreSQL PITR 2개 |
| [#231](https://github.com/guseoh/csforge/pull/231) | Operating Systems, `operating-systems.core.threads.user-level-thread` | OSTEP Chapter 26의 **사용자 수준 M:N 설명 범위 제외** `relationNote` 1개 |

- PostgreSQL 상태 `EMPTY → READY`, 처음 Canonical Bootstrap **3,380 CREATED / 0 ERROR / 0 FAILED**, 동일 파일 두 번째 Bootstrap **3,380 UNCHANGED**.
- 각 Concept API에서 정확한 **URL·제목·relationNote와 순서**를 대조하고 React의 `#references`에서 DOM 표시를 확인.
- **375/768/1280px × light/dark × 3 Concept = 스크린샷 18개**, 넘침/링크 컨테이너 경계 오류 없음.
- **외부 링크 5개 모두** focus→Enter→새 탭 URL 탐색→원래 Reader 상태 유지 PASS, target `_blank`와 `noreferrer` 확인.
- `pageerror` **0건**. `console` 비차단 404 경고 **1건**은 기록했고 상세 리소스 경로는 보고되지 않아 원인 미확정. 무경고라고 주장하지 않음.
- 실제 PNG를 열어 375px Security/Infra와 데스크톱 Operating Systems 화면에 내용이 표시됨을 별도 육안 확인. 다만 `en`, `section/chapter` 그대로 표시하고 `recommendation`이 보이지 않는 현행 R3 UX 차이는 별도 처리.

## B. 현재 `main` 감사 재집계 — SUCCESS

같은 작업에서 기존 `docs/content-corrections/issue-222-r2/reconcile.py`를 **변경 없이 그대로 재실행**해 최신 canonical 콘텐츠/과거 Wave1~4 evidence를 비교했다.

| 항목 | 병합 전 기록 | 병합 후 실제 재검증 |
| --- | ---: | ---: |
| LearningArea / Concept | 15 / 721 | **15 / 721** |
| Reference 관계 전체 | 1,038 | **1,042** |
| 고유 URL | 621 | **622** |
| 공유 URL 전역 metadata 충돌 | 0 | **0** |
| 같은 Concept 내 URL·displayOrder 중복 | 0 | **0** |
| 과거 표본과 현행 canonical 관계 불일치 | Wave3 0/186 | **Wave3 5/186** |
| R2 독립 원문 검증 KEEP | 15 | **15** |
| 비Java 역사적 후속 검토 후보 | 138 | **133** |

5개가 사라진 것은 **과거 URL의 현재 관계가 교체됨**을 뜻한다. 해당 내용은 `reconcile-current.json`의 `historicalWave3.missingAfterChanges`에서 정확히 다음과 같이 남아 있다.

1. CA floating-point: IEEE Xplore 과거 출판물 번호 URL 1관계 → #233 개정.
2. CA microbenchmark-boundary: OpenJDK 홈페이지 URL 1관계 → #234 공식 저장소.
3. Network & HTTP cookie / set-cookie / cookie-scope: RFC-to-be 10025 URL **3관계** → #229 발행 RFC 6265 + draft 6265bis.

**주의:** `133`은 오류 건수가 아니라 과거 Wave의 관계 수준 판정에 남아 있는 **후속 후보** 수치다. #232 DSA Note 6관계, #231 OS Note 1관계 등 URL은 그대로인 내용 개선은 기존 미확정 직접 열람 기준을 자동 승격하지 않으므로 남는다. 원본 Wave 파일과 수동 `verified-relations.json` 15건은 덮어쓰지 않았다.

### 남은 세부 후보의 영역별 상태

이 표는 `historicalFlaggedRelations`에서 **독립 원문 검증 KEEP 15관계**를 실제 Concept별로 제외한 결과다.

| LearningArea | 과거 미확정 flag | 독립 verified KEEP | 현재 비Java 후속 후보 |
| --- | ---: | ---: | ---: |
| DSA | 70 | 0 | **70** |
| Computer Architecture | 44 | 0 | **44** |
| Operating Systems | 26 | 10 | **16** |
| Distributed Systems | 2 | 0 | **2** |
| Network & HTTP | 1 | 0 | **1** |
| Backend Engineering / Spring / Messaging / Performance | 5 | 5 | **0** |
| **비Java 소계** | **148** | **15** | **133** |

Java의 과거 `NEEDS_REVIEW` 15관계는 R1에서 학습 범위를 판정했기 때문에 본 표의 비Java 133건에 포함하지 않는다. **이 표의 133은 직접 확인이 끝나지 않은 역사적 검토 후보**이므로, 내용 오류 133건이나 링크 파손 133건으로 읽지 않는다.

## C. Issue #222의 다음 독립 Slice

**R2 잔여:** 133관계를 오류로 단정하지 않고 원문/관련 절을 계속 검증한다. 특히 UMD 44관계는 canonical 원본 직접 접근 제한으로 추후 학습 환경에서 확인하며, 다른 공식 자료의 존재만으로 원본을 검증 완료 처리하지 않는다.

**R3 Reader UX:** 현행 `ConceptPage.tsx`는 reference `type`만 한글 label이고 `language/depth`를 원시 값으로 노출하며, `recommendation`을 렌더링하지 않는다. 앞으로 별도 작은 Slice에서 한국어 자료 메타 라벨, `recommendation`과 `relationNote`의 역할 분리, 외부 새 탭 접근성, 0개/긴 제목/비정상 URL, 375·768·1280px light/dark QA를 진행한다. #209와 CSS 책임 중복을 피하고 새 Reference API·스키마·자동 링크 검사 서비스를 만들지 않는다.

**완료 기준:** 감사 수치와 QA 증거는 재현 가능하고, **Issue #222는 아직 Open**이다. 이 문서는 R3 완료를 선언하거나 원본 133관계를 VERIFIED로 바꾸지 않는다.
