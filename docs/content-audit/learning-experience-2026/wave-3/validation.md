# Wave 3 검증 근거

2026-10-13, 기준선 `efe73a15da14c996bd08344181d4d6f87073803d`. 검증은 감사 산출물과 읽은 원문의 관계를 확인하며 의미 판정 자체를 자동 생성하지 않는다.

| 검증 | 결과 |
| --- | --- |
| `python docs/content-audit/learning-experience-2026/audit.py` generate | PASS: 15 Area·134 Topic·721 Concept·2,525 Question·Reference 1,043관계/625 URL·60 SVG, 오류 0 |
| 같은 스크립트 `--check` | PASS: 생성 결과 drift 0, 중복 JSON/YAML property/key·순서·level·관계·선행 cycle·공유 Reference metadata·그림 경로·수기 근거·hash·인용·계승 발견 검증 |
| Wave 3 누락·중복 및 개별 근거 | 4 Area·49 Topic·369 Concept·1,188 Question, 1,557개 item key·source hash, 8개 Curriculum/Topic hash, C 5축/Q 2축의 수기 근거 검증 PASS |
| Topic checkpoint와 Area 일치 | `checkpoint-topic.py`로 49개 전수 PASS. Concept/Question row 및 새/계승 발견이 Area ledger와 동일. 같은 Area의 교차 Topic 발견도 연결 판정과 일치하며 helper 수정 후 구문 검사 PASS |
| Question 인용과 대상 object | 발견의 인용이 전체 pack뿐 아니라 해당 contentKey의 canonical Question object 안에 있는지 확인. Wave 3 Question anchor 72개 PASS; 원문 line의 인용이 해당 record에 속함도 별도 대조 |
| 새/계승 발견 및 심각도 | 새 100그룹 P0 30/P1 27/P2 43. 기존 4그룹 P1 1/P2 3 별도. C 보강55/Q 보강76(계승 포함), KEEP314/1,112, W3 NEEDS_REVIEW/REWRITE_REQUIRED 0 |
| 전체 누적 재집계 | CURRENT_VERIFIED 576C/1,684Q, CURRENT_PARTIAL 4C/25Q, 근거 NEEDS_REVIEW 141C/816Q. 품질 KEEP476/1,614, 보강102/95, NEEDS_REVIEW143/816 |
| Reference 대조와 한계 | 445관계: 관련 의미299·NEEDS_REVIEW146. 접근 NEEDS_REVIEW는 별도 field이며 미접근을 broken 또는 전문 PASS로 승격하지 않음 |
| 기존 OS SVG 소스 검토 | 33개 전체 소스·label·좌표/연결 의미와 pinned hash PASS. pixel/render/Reader QA 완료를 의미하지 않음 |
| canonical/Curriculum/자산 기준선 | 945 input 파일의 Git object 동일: 15 Curriculum+15 Topic pack+721 Concept+134 Question pack+60 SVG. LF/CRLF 차이를 Git 필터로 구분 |
| Wave 1·2 보존 | 원래 두 overlay로 당시 snapshot 재생성 비교 PASS. 기존 폴더/summary/findings 및 초기 review-notes·source-manifest·deployment 증거 22개 파일 무변경 대조 PASS |
| Python 구문 | audit.py·wave_review.py·Wave3 read-topic.py/checkpoint-topic.py/assemble-area.py의 `ast.parse` 5개 PASS. helper는 Network 조립만 지원하고 판정을 생성하지 않음 |
| Git 변경 범위·공백 | `git diff --check` 및 staged 확인 PASS. 감사 폴더만 변경, content/Curriculum/learning assets/backend/frontend/infra/compose 변경 0. 기존 미추적 backend/bin/ 보존 |

generate와 check는 같은 수기 입력에서 일치했다. Topic checkpoint는 전수 item 키와 필드 수·명시 근거·발견에 해당하는 판정·source hash·추가 인용까지 검증한다. canonical item이나 이미 읽은 SVG가 바뀌면 stale evidence를 거절하고, 기존 hash를 새로 덮어써서 통과시키지 않는다.

새 P0의 숫자는 `content/AGENTS.md` §13에 맞춰 사실 오류·복수 답·정상 답 거절을 최종 분류한 결과이며 production 장애 발생 수가 아니다. 검토 대상/발견 그룹/수정 완료를 구별한다.

로컬 product build/test·Import Preview/Apply·DB/배포·새 이미지 작업은 실행하지 않았다. 새 커밋에 대한 GitHub CI 결과는 PR checks와 최종 보고에서 별도로 확인한다. 이전 Wave 2 SHA의 성공을 Wave 3 CI 성공으로 재사용하지 않는다. 공식 자료 전체 전문/모든 anchor·코드 실행 실험·전체 Reader theme/mobile·human learning QA는 미완료다.
