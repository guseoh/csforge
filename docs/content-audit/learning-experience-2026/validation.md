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
| Python `ast.parse` (감사 스크립트 두 파일) | PASS, bytecode/cache 파일 생성 없음 |
| `git diff --check`, `git diff --cached --check` | PASS |
| `git diff efe73a15... -- content frontend/public/learning` | 출력 없음. 기존 canonical/Curriculum/자산 변경 없음 |

CA `multi-level-page-table`의 order50/60 차이는 발견된 **기준선의 P2 문제**로 보고한다. 인벤토리가 그 문제를 숨기거나 자동 수정하지 않는다. 10개 자동 후보의 존재는 검증 실패/품질 verdict가 아니다.

검증은 새 콘텐츠의 import/domain validation이나 배포를 수행하지 않는다. Source evidence만 읽었으며 DB/Import Apply/새 이미지/Backend/Frontend 기능 변경은0이다. 기존 미추적 `backend/bin/`을 보존했다. CI/full application tests 및 전체 Reader theme/mobile/human usage QA는 이번 감사에서 실행하지 않았다.

의미 품질의 범위는 Concept39/Question98/직접 관련 Reference17 URL/브라우저 독립SVG4개이다. 나머지는 README와 각 인벤토리의 `NEEDS_REVIEW`로 추적하며 구조 검증 성공을 새 Area PASS로 승격하지 않는다.
