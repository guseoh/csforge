# 검증 근거

2026-10-12, 기준선 `efe73a15da14c996bd08344181d4d6f87073803d`.

| 검증 | 결과 |
| --- | --- |
| `python docs/content-audit/learning-experience-2026/audit.py` | PASS: 15 Area / 134 Topic / 721 Concept / 2,525 Question / 1,043 Reference 관계 / 625 URL / 60 자산 |
| `python docs/content-audit/learning-experience-2026/audit.py --check` | PASS: source 파싱/중복 property/key/order/관계/선행 target·cycle/level/shared Reference metadata/그림 경로/수동 근거 hash/발견 인용·key·ID/9개 생성 보고서 일관성 |
| baseline Git tree vs 945 input paths | PASS: 15 Curriculum + 15 Topic pack + 721 Concept + 134 Question pack + 60 SVG. 경로별 Git 필터를 사용해 EOL 차이와 내용 변경을 구분 |
| 이전 Phase A 발견 7개와 현재 source | RESOLVED 7. Question +1은 Security authentication.q3 |
| 기존 관련 PR20개 merge commit→baseline ancestor | 20/20 확인, `pr-merge-evidence.json` |
| `python .../verify-assets.py` | 60/60 HTTP200, image/svg+xml, source 일치(줄바꿈 차이 허용). `deployment-evidence.json` |
| Python `ast.parse` (감사 스크립트) | 초기 두 스크립트 PASS. Wave 변경 audit.py/wave_review.py/read-topic.py 3개 모두 PASS |
| `git diff --check`, `git diff --cached --check` | PASS |
| `git diff efe73a15... -- content frontend/public/learning` | 출력 없음. 기존 canonical/Curriculum/자산 변경 없음 |

CA `multi-level-page-table`의 order50/60 차이는 발견된 **기준선의 P2 문제**로 보고한다. 인벤토리가 그 문제를 숨기거나 자동 수정하지 않는다. 10개 자동 후보의 존재는 검증 실패/품질 verdict가 아니다.

검증은 새 콘텐츠의 import/domain validation이나 배포를 수행하지 않는다. Source evidence만 읽었으며 DB/Import Apply/새 이미지/Backend/Frontend 기능 변경은0이다. 기존 미추적 `backend/bin/`을 보존했다. CI/full application tests 및 전체 Reader theme/mobile/human usage QA는 이번 감사에서 실행하지 않았다.

초기 범위39 Concept/98 Question/Reference17 URL/독립SVG4는 역사 증거다. **Wave 1은 6 Area/18 Topic/54 Concept/162 Question 직접 전수 검토**이며, 각각9/27이고 누락·중복0을 검증한다. 새 12개 발견의 quote/key/path와 216개 개별 hash, 12 Curriculum/Topic 입력 hash, 82 canonical Reference URL 관계 포함을 확인한다. Reference78은 관련 내용/역할 확인,4는 전문 접근 NEEDS_REVIEW다.

전체 품질 NEEDS_REVIEW는 Concept652/Question2,286이다. 검토 근거는 CURRENT_VERIFIED54/162, 초기 CURRENT_PARTIAL31/77, 새 개별 근거 없는 NEEDS_REVIEW636/2,286으로 분리한다. 초기 partial Concept16이 품질 미확정이어서 근거별 미완료와 품질 NEEDS_REVIEW 숫자는 같지 않다. 과거 Area PASS는 PRIOR_REVIEWED로 보존한다.

Wave 최종 검증은 생성 후 `audit.py --check` 보고서 일치 PASS, 원본 `review-notes.json`·manifest·초기 자산/배포 증거 무변경, `git diff --check` PASS, source 변경0을 확인했다. 별도 집계로 54/162와 전체721/2,525 및 발견 P0 1/P1 7/P2 4·고유 target11/9도 일치했다. staged diff 검사를 거쳐 이 감사 경로만 commit한다. 자동 검사가 의미 verdict를 만든다는 보증이나 실행 예제·product 전체 테스트 성공 주장은 없다.
