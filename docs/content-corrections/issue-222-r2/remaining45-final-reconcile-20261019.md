# Issue #222 R2 — 잔여 45관계 최종 reconcile 및 완료 판단

2026-10-19 감사 시작 시 기준 `main`은 `e0dbadfbf0691e079b8d2e20d623aceb8bad5103`이었다. 아래 독립 브랜치·오프라인 제안 수치는 **당시 재현용 역사적 감사 자료**이며, 현재 main 반영 상태는 다음 절에서 별도로 기록한다. 기존 103개 검증 관계·R1/R3의 출처 판단은 재감사하거나 변경하지 않았다.

## 병합 후 실제 main 상태 (2026-10-19)

- [#247 UMD](https://github.com/guseoh/csforge/pull/247) squash merge `7805e8a44e831e9f4f7d06ed1ca3f4e436942293`: 44관계 읽기 자료 확보(39 REPLACE + 기존 공식 문서로 5 CONSOLIDATE).
- [#248 CAP](https://github.com/guseoh/csforge/pull/248) squash merge `dd47f9769e66cbcc8efa65d3aef72156b0f92a96`: 실제 통합 HEAD `4fe744e11c7d4448bdf2baccbcf921b8447ff965`를 병합. 기존 DOI는 서지 출처로 유지하며 MIT 원고 1관계 추가, 공유 ledger와 `reconcile.py`의 replacement/supplement guard 통합.
- **GitHub의 최신 main ledger 직접 조회:** 기존 103개 + UMD 44개 + CAP 저자 원고 1개 = **148개 검증 관계**, (contentKey, URL) 중복 0, UMD 신규 44개 `replacesUrl` 및 MIT 1개 `supplementsUrl` 식별. **ACM 출판본 전문 직접 검증 1건은 pending 유지.** 원본 UMD 주소의 직접 검증을 성공으로 바꾸지 않음.
- `R2Remaining45CombinedIntegrationTest`가 합쳐진 canonical을 기준으로 역사적 45파일을 복원하고 45파일을 한 번에 Preview/Apply, exact 재가져오기 및 학습 이력·identity 보존을 검증한다. 최종 통합 HEAD [Repository Validation #39223585297](https://github.com/guseoh/csforge/actions/runs/39223585297) **SUCCESS**. 병합 후 #247 [main Validation #39223410430](https://github.com/guseoh/csforge/actions/runs/39223410430) **SUCCESS**. #248 병합 후 [main Validation #39224309386](https://github.com/guseoh/csforge/actions/runs/39224309386)는 본 문서 갱신 시 확인 중이므로 성공으로 선행 기록하지 않는다.
- 본 #249의 기존 `reconcile-remaining45-proposal.py`/JSON은 특정한 이전 두 브랜치의 **미병합 가상 조합**을 재현하는 자료이며 현재 main에 그대로 재적용하는 도구가 아니다. main에서 `reconcile.py`를 직접 실행했다는 주장은 하지 않으며, main ledger의 위 관계 identity/집계는 GitHub 저장소 데이터에서 확인했다.
- 모바일 전용 QA는 사용자 결정에 따라 **이번 작업의 완료 조건에서 제외**한다. 기존 데스크톱 Reader 검사, 백엔드 Import 회귀 및 HTML 안전성 확인 근거는 유지한다.
- **Production PostgreSQL canonical Import/Apply 및 수동 배포는 하지 않았다.** main push에 연결된 자동 Cloud Run 배포는 별도 CI job 상태로 추적한다. #222는 ACM 출판본 전문 접근 보류 때문에 Open 유지.



## 독립 PR과 최종 검증

| 작업 | Draft PR / 최종 HEAD | Repository Validation |
|---|---|---|
| Computer Architecture UMD | [#247](https://github.com/guseoh/csforge/pull/247), `5689629532e11722b668c12dd5c58073e6e8d809` | [39214844165](https://github.com/guseoh/csforge/actions/runs/39214844165) **SUCCESS** |
| Distributed Systems CAP 독립 원고 감사 | [#248](https://github.com/guseoh/csforge/pull/248)의 최초 HEAD `6f0895b82467f4dd81e5a348a329379bcb3e0da2` | [39214250705](https://github.com/guseoh/csforge/actions/runs/39214250705) **SUCCESS** |
| UMD + CAP **실제 Git 통합** | [#248](https://github.com/guseoh/csforge/pull/248) 통합 HEAD `70299bdc97a9db01aafcad41b4c8a05b66d3a302` | [39220508450](https://github.com/guseoh/csforge/actions/runs/39220508450) **SUCCESS** |

위 각 실행 모두 backend tests/build, frontend validation, Compose validation 성공. #247의 후속 커밋은 Windows CRLF에서도 회귀 테스트가 실행되도록 문자열 처리 한 줄만 보강했다. 최종 파일로 로컬 Testcontainers 테스트를 다시 실행해 통과했다. #248도 동일한 줄바꿈 경계를 수정한 뒤 테스트가 통과했다. 최종 reconcile PR의 HEAD/CI는 PR 설명에서 추적한다.

## 관계별 결정과 실제 원문 근거

- **UMD 44관계:** [최종 HEAD의 44행 결정표](https://github.com/guseoh/csforge/blob/5689629532e11722b668c12dd5c58073e6e8d809/docs/content-corrections/issue-222-r2/umd-readable-sources-20261019.md), [기계 추적표](https://github.com/guseoh/csforge/blob/5689629532e11722b668c12dd5c58073e6e8d809/docs/content-corrections/issue-222-r2/umd-readable-relations.json). **39관계 교체 + 기존 공식 자료로 5관계 통합**. Cornell의 실제 HTML/PDF 관련 절을 읽고 PDF 도표를 렌더링했다. 캐시 정책·수 표현·datapath·클록·주소 변환·hazard/분기 비용을 각 학습 목적에 대응했다. 기존 Linux/RISC-V가 더 구체적인 5관계는 원문을 확인한 뒤 중복 UMD 관계를 통합했다.
- **CAP 1개 학습 목적:** [최종 HEAD의 출판 관계·원문·판정](https://github.com/guseoh/csforge/blob/6f0895b82467f4dd81e5a348a329379bcb3e0da2/docs/content-corrections/issue-222-r2/cap-author-manuscript-20261019.md). DOI는 서지 출처로 유지하고 **MIT 저자 원고 관계 1개 추가**. 저자의 MIT 논문 목록이 동일 논문 항목에서 해당 PDF로 직접 연결됨을 확인했다. 원고 §2.1–2.3·§3.1을 읽어 linearizability, 정상 노드의 eventual response(시간 상한 없음), 메시지 손실과 불가능성 정리를 대조했다. 기존 Concept 본문에는 교정할 결함이 확인되지 않아 유지했다.
- UMD 403과 ACM PDF 403/Reader 로딩을 broken 또는 본문 검증 성공으로 취급하지 않았다. UMD 원본 44관계는 retired 추적으로 보존하며 원본을 VERIFIED로 승격하지 않는다. 13쪽 MIT 원고를 ACM 출판본과 동일 판본/문구로 단정하지 않는다.

## 재현 가능한 결합 검증

두 PR이 독립 main 기반이라 ledger의 마지막 배열 항목과 검증기 guard 수정이 겹친다. 실제 병합을 수행하지 않고 [오프라인 proposal 검증기](reconcile-remaining45-proposal.py)로 정확한 두 Git SHA의 변경만 겹쳤다.

```text
python docs/content-corrections/issue-222-r2/reconcile-remaining45-proposal.py \
  --out /tmp/remaining45-reconcile.json \
  --ledger-out /tmp/proposed-verified-relations.json
```

canonical이 기준 main과 동일한 checkout 및 두 Git 객체, PyYAML이 필요하다. `--ledger-out`은 **향후 충돌 해결 검토용 제안 ledger**이며 main ledger를 덮어쓰지 않는다. 임시 evidence 파일은 각 PR HEAD의 실제 문서에서 가져온다. 기존 `reconcile.py`의 UMD replacement guard와 CAP supplement guard를 메모리에서 결합해 검사하며 저장소 검증기를 수정하지 않는다. source-content 검증을 새로 수행하는 도구가 아니다.

제안 ledger는 기존 103행 + #247의 새 44행 + #248의 MIT 1행이다. `replacesUrl`은 retired 원본을, `supplementsUrl`은 **여전히 pending인 DOI**를 정확히 가리켜야 한다. 중복 identity가 있거나 canonical/body/key가 변경되면 실패한다. 결합 결과와 문서 SHA-256은 [JSON 결과](remaining45-reconcile-20261019.json)에 보존했다. 실제 main `verified-relations.json`은 이 감사 PR에서 변경하지 않는다.

| 상태 | 관계 / 고유 URL | 직접 본문 verified | 기존 원문 pending |
|---|---:|---:|---:|
| 기준 main | 1,042 / 622 | 103 | 45 |
| #247 단독 제안 | 1,037 / 627 | 147 | 1 (ACM) |
| #248 단독 제안 | 1,043 / 623 | 104 | 45 (UMD 44 + ACM 1) |
| 정확한 두 HEAD 결합 제안 | **1,038 / 628** | **148** | **1 (ACM)** |

5관계 감소는 기존 적합한 공식 Reference로 통합한 결과이고, CAP 원고 추가는 1관계 증가다. verified 148은 현행 관계에 대한 수치이며 **역사적 원 URL 148개 모두의 직접 접근 성공이라는 뜻이 아니다**. 15개 Area / 721 Concept / 2,525 Question 보존, 공유 metadata 충돌·중복 관계·중복 displayOrder 0. Concept/Question identity와 모든 본문은 두 PR에서 그대로다.

## Import·이력·Reader QA

- #247: PostgreSQL 16.4 Testcontainers에서 변경 전 44개 Reference 목록을 복원. Preview/Apply updated=44/errors=0, 반복 Preview unchanged=44, full canonical exact reimport unchanged=3,380/errors=failed=0. 721 Concept/2,525 Question ID, 유지한 공유 Reference ID, 노트·풀이·오답·복습 이력 보존. CRLF 보강 후 최종 테스트도 PASS.
- #248: 별도 Testcontainers에서 old 2refs → new 3refs Preview/Apply updated=1/errors=0, exact reimport 3,380 unchanged. 별도 QA DB의 **실제 HTTP Import**에서도 노트·quiz session·attempt·wrong note·review schedule/history·학습 상태를 심고 보존 확인.
- **결합 HTTP 검증:** CAP QA DB에 두 최종 HEAD의 45파일만 겹쳐 Preview updated=44/unchanged=1/errors=0 → Apply updated=44/failed=0 → exact Preview 및 Apply unchanged=45/updated=0/failed=0. 이 검사의 exact 수치는 변경 파일 45건이다. 각 PR의 full pack 3,380건 검증과 구분한다. 7개 이력 테이블과 Concept/Question ID 보존, 활성 Reference 1,038관계 / 628 URL을 DB에서도 확인했다. [결합 Import 결과](remaining45-import-qa-20261019.json).
- 실제 Reader: UMD 대표 6개 Concept × light/dark, CAP 1개 Concept × light/dark, 1280×720. 관계 설명·자료 소개·긴 제목 줄바꿈, Tab으로 Reference 진입, 외부 링크 `_blank`/`noopener noreferrer`, 가로 넘침 없음 확인. UMD 44개 교정 관계 전체는 Reader API의 URL·relationNote 일치도 확인했다. 다른 viewport나 전체 45개 화면의 시각 QA를 주장하지 않는다.
- 격리 자원: `csforge-r2-reader-umd` DB :15482/backend :18082/frontend :15173, `csforge-r2-reader-cap` DB :15483/backend :18083/frontend :15174. Production Import·DB 변경·수동 배포 없음.
- `reconcile.py`(각 콘텐츠 PR), proposal reconcile, 기존 103행 보존 검사, `git diff --check`: PASS. 감사 전용 PR은 canonical·test·API·DB 파일을 수정하지 않는다.

## 실제 Git 통합 후 추가 검증 (ChatGPT 직접 수행)

기존 #249의 `reconcile-remaining45-proposal.py`와 `remaining45-reconcile-20261019.json`은 **#247/`56896295`와 최초 #248/`6f0895b8`의 미병합 제안 스냅샷**이다. 기존 148/1 계산 근거를 보존하며 현재 `main`의 결과나 갱신된 #248 브랜치 자체의 실행 결과로 재표기하지 않는다.

2026-10-19에 [#248 통합 HEAD `70299bdc97a9db01aafcad41b4c8a05b66d3a302`](https://github.com/guseoh/csforge/commit/70299bdc97a9db01aafcad41b4c8a05b66d3a302)을 생성했다. 이는 **CAP 기존 HEAD와 UMD #247 HEAD를 부모로 갖는 실제 병합 커밋**으로, 두 영역의 canonical 파일, 103 + 44 + 1 = 148행의 단일 `verified-relations.json`, 두 이력 검증 가드가 결합된 `reconcile.py`를 함께 포함한다. 기존 #247/#248의 개별 회귀 테스트와 source evidence는 보존한다.

통합 브랜치에 `R2Remaining45CombinedIntegrationTest`를 추가했다. 격리 PostgreSQL에서 우선 역사적 UMD 44파일과 CAP 구버전 1파일을 **같은 Import Preview/Apply**로 복원하고, 개인 노트·풀이·오답·복습 기록 및 Concept/Question ID를 캡처한 뒤, 변경된 45파일을 **같은 Preview/Apply**로 적용하도록 검증한다. 기대 결과는 **45 UPDATED / 0 UNCHANGED**, 재실행 **45 UNCHANGED / 0 UPDATED**, 전체 canonical exact bootstrap **3,380 UNCHANGED** 및 기록·identity 보존이다.

최종 통합 HEAD의 [Repository Validation #39220508450](https://github.com/guseoh/csforge/actions/runs/39220508450)은 **completed / SUCCESS**로 backend tests/build, frontend validation, Compose validation을 통과했다. 기존 결합 HTTP QA의 `44 UPDATED / 1 UNCHANGED`와 새 통합 회귀 테스트의 **historical 45 → corrected 45** 실행 조건을 구별한다.

Reader는 기존 R3 구성 요소를 변경하지 않았으며, 기존 1280×720 light/dark QA 근거가 있다. CSS에는 최대 680px에서 Reference 행을 한 열로 변경하고 제목·설명을 줄바꿈하는 규칙이 존재한다. **375px 모바일 실제 브라우저 확인은 이번 직접 통합 작업에서 수행하지 않았으며 완료로 주장하지 않는다.**

#247과 #248은 위의 병합 커밋으로 실제 main에 반영되었다. 본 #249 감사 PR은 Draft·미병합이며, 마지막 main 기준 숫자는 앞선 '병합 후 실제 main 상태' 절에서 구분해 기록했다. 최종 main에서의 `reconcile.py` 독립 실행 및 결과 아카이빙은 CI/후속 실행이 있을 경우 별도 근거를 남긴다.

## 미해결 1건과 #222 완료 판단

**45개 학습 목적에는 실제 읽을 수 있는 검증 자료를 확보했다. R2의 모든 원문 직접 검증 완료 판정은 보류한다.** ACM 출판본 전문 접근 및 MIT 원고와의 문구·판면 비교가 남는다. ACM 페이지의 서지·abstract 확인과 저자 원고 열람만으로 이를 완료 처리하지 않는다.

후속 조치는 공식 PDF/eReader가 실제 출판본을 제공하는 환경에서 원문을 확보한 뒤 §2 정의와 Theorem 1을 비교하고 버전 관계를 기록하는 것이다. 접근 상태가 해결되기 전에는 DOI 원문 pending 1건을 유지한다. ACM 서지는 출판 페이지 기준이며 MIT 논문 목록의 다른 페이지 범위 표기를 canonical에 복제하지 않았다.

사용자 승인에 따라 #247과 실제 통합된 #248은 각각 squash 병합됐다. 병합 전 공유 ledger/검증기의 충돌도 실제 통합 브랜치에서 해결했고 CI가 성공했다. 이 문서의 오프라인 제안 JSON/검증 스크립트는 당시 독립 HEAD 상태를 재현하는 용도로만 유지한다. #249 감사 PR은 이 문서 업데이트 시 Draft·미병합 상태다. Issue #222는 ACM 원본 전문 1건 보류로 Open을 유지하며 임의 종료하지 않는다.
