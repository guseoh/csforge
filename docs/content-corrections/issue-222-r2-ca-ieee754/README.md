# Issue #222 R2 — Computer Architecture IEEE 754 Reference 교정

기준 main: `2862a92d9208153678f3b618df90fafe37cb2e09`. 기존 R2 [Computer Architecture 46관계 감사](https://github.com/guseoh/csforge/blob/2f26bd468635db71fa5dbccf0755d4a7aa6fef50/docs/content-corrections/issue-222-r2/computer-architecture-preliminary.md).

## 교정 근거

- 기존 `https://ieeexplore.ieee.org/document/8766227`은 IEEE Xplore에서 출판물 번호(`punumber=8766227`)로 확인된다. 실제 **IEEE 754-2019 개별 문서** 식별자는 `8766229`이고 DOI는 `10.1109/IEEESTD.2019.8766229`. 번호가 다른 사실만으로 기존 주소가 항상 404를 반환한다고 단정하지 않는다.
- [IEEE Standards Association 공식 IEEE 754-2019 안내](https://standards.ieee.org/ieee/754/6210/): 직접 페이지 조회에서 정확한 표준 제목·Active Standard·발행일 2019-07-22·이진/십진 형식·연산·예외 계약을 확인. **공개 랜딩은 전문을 제공하지 않고 구매/구독 안내**임을 Recommendation에 명시한다.
- [Oracle Numerical Computation Guide, Chapter 2: IEEE Arithmetic](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_math.html): 직접 열람 가능한 Single Format의 binary32 필드 1/8/23비트, 정규수·subnormal·±Infinity·NaN, 반올림 방향 표를 실제 대조. Oracle의 역사적 가이드는 1985판을 설명하므로 2019판의 모든 규정과 동일하다고 주장하지 않는다.
- 서로 다른 역할(현재 표준의 **범위·출판상태** / 구체적인 **비트 형식·학습 예제**)을 분리하여 Reference 2개로 제공한다.

## 변경 및 보존

- `computer-architecture.core.data-representation.floating-point` frontmatter의 첫 공식 URL/title/recommendation/relationNote만 교정하고, Oracle 공식 자료 1개를 두 번째 Reference로 추가.
- Concept 본문·제목·summary·contentKey·level, Question 전체, Curriculum, SVG, 제품 코드/API 및 DB schema는 불변.
- 기존 다른 URL의 global metadata는 수정하지 않는다. **새 Reference 2개와 하나의 Concept 연결만** 영향받으며 기존 44개 UMD 관계·JMH 관계에 변경 없음.
- Original Wave 감사에서 NEEDS_REVIEW였음을 보존. ‘CA 46관계 전체 검증 완료’ 또는 원본 URL의 무조건 404라는 주장은 하지 않는다.

## 완료 조건

- [x] 격리 PostgreSQL 초기 canonical 3,380 → 기존 URL 상태 old Preview/Apply → 신규 URL 2개 Preview/Apply 오류 0 → 전체 재import 3,380 UNCHANGED 및 Concept·personal/history 데이터 보존.
- [ ] 임시 QA 삭제 이후 최종 HEAD 정규 Repository Validation PASS. 초기 정규 CI 및 격리 QA 모두 성공; 전체 3,380 canonical Import에서 global URL metadata collision/duplicate 오류 0.
- [x] 실제 비운영 Reader에서 공식 IEEE/Oracle 두 URL·제목·relationNote·순서 확인, 375/768/1280px × light/dark 6 화면과 키보드→새 탭 확인.
- [x] 임시 workflow 및 browser-check.cjs를 원복했으며 PR diff의 변경 범위를 Content 1개 + 회귀 테스트 1개 + evidence README 1개로 유지.

**Draft / 사용자 승인 전 merge 금지 / Production DB Import·배포 금지.** R2 전체 감사 및 R3 Reader UX는 계속 진행.

## 실제 검증 결과 — 2026-10-18

- [최초 정규 Repository Validation #39135238711](https://github.com/guseoh/csforge/actions/runs/39135238711) **SUCCESS**: 추가된 `CaFloatingPointReferenceCorrectionIntegrationTest`가 실행된 Backend tests/build, frontend validation, Compose 검사. Cloud Run deploy skipped.
- [일회성 격리 Chromium Reader QA #39135629752](https://github.com/guseoh/csforge/actions/runs/39135629752) **SUCCESS**: 빈 PostgreSQL 16.4 → canonical bootstrap 3,380 CREATED/ERROR0 → READY. 앱 API에서 IEEE SA/Oracle URL·Reference note·제목 2개를 읽고 실제 React Reader **375·768·1280px × 라이트·다크 6화면**, overflow 0, 키보드 focus→Enter→두 외부 새 탭→Reader 복귀 통과. JavaScript page error 0.
- 실행 Artifact `pr233-ca-ieee-browser-evidence`에는 `report.json` 및 6개 한글 화면 PNG. 실제 캡처를 내려받아 모바일/데스크톱 화면 내용을 확인함. 개발 서버에서 비차단 404 console warning **1건**이 있어 무경고로 주장하지 않는다.
- QA 전용 PostgreSQL 서비스, `.github/workflows/repository-validation.yml` 임시 변경, `browser-check.cjs`는 성공 후 [커밋 `79344d72`](https://github.com/guseoh/csforge/commit/79344d720584b4a7e0d62edb8013dd1a7bac3488)로 전부 PR 최종 diff에서 제거. Production DB/배포 접근 없음.
- **남음:** 임시 스크립트 원복 이후 final HEAD 정규 CI SUCCESS와 마지막 branch HEAD·base drift·diff 확인. PR 병합은 사용자 승인 대기.
