# Issue #222 / R2 — Network & HTTP 쿠키 Reference 정식 출판 여부 교정

## 대상 및 출처 상태
- 기준 main: `2862a92d9208153678f3b618df90fafe37cb2e09`. R2는 전체 15개 영역 Reference **누락 범위 검토**이며, 이 PR은 확정 문제 1그룹(3관계)의 Network & HTTP 최소 수정이다.
- Wave3 [reference-issues](../../content-audit/learning-experience-2026/wave-3-reference-issues.json)의 `W3-NET-029` 3관계: `cookie`, `set-cookie`, `cookie-scope`.
- 종전: `https://www.rfc-editor.org/rfc/rfc10025.html`을 정식 RFC처럼 안내. RFC Editor `https://queue.rfc-editor.org/final-review/rfc10025/`가 **In Final Review**(2026-10-17 재확인), 공식 정식 RFC URL 본문 접근 불가. 편집중인 RFC-to-be 원고의 `Published: July 2026` 같은 머리글을 출판 확정 근거로 오해하지 않는다.
- 발행된 정식 1차 근거: `https://www.rfc-editor.org/rfc/rfc6265.html` (HTTP State Management Mechanism, 2011). Cookie 및 Set-Cookie와 기본 저장·전송 규칙. **SameSite는 이 명세의 일부가 아님**.
- 현대 동작·SameSite의 별도 1차 참고: `https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html` (2026-10-16 latest working draft, 2027-04-19 만료 예정). HTML 상단에 `Internet-Draft`, `Obsoletes: 6265 (if approved)`라고 명시. **아직 RFC로 출판된 것이 아니라는 점을 title/recommendation/관계별 note에 명시**.

## Concept별 읽을 부분 및 변화
| contentKey suffix | RFC 6265 (발행) | 6265bis (초안) |
|---|---|---|
| `cookie` | Cookie/Set-Cookie 교환 및 저장 모델 | 4.2 / 5.7 / 5.8 저장·반환 |
| `set-cookie` | 4.1.1/4.1.2 문법·의미 | 4.1 / 5.6 속성, SameSite |
| `cookie-scope` | 5.1 Domain/Path, 5.2 속성 | 5.2 site 문맥, 5.6.7 SameSite, 5.8 반환 |

기존 3 Concept의 `contentKey`, 제목, 본문, 학습 목표, Question, Curriculum, SVG는 변경하지 않는다. 종전 3개 링크를 제거하고 검증된 두 URL의 일관된 전역 메타데이터로 교체하며, 관계별 `relationNote`만 달리한다.

## R2 기존 감사 재사용 · 이후 게이트
- Wave1 6Area에서 source-level `NEEDS_REVIEW` 4 URL, Wave2 4Area에서 2 URL; Wave3 4Area에서 `NEEDS_REVIEW` 146관계/42 URL; Java Wave4의 16관계는 PR #225 R1 판정을 재사용한다. 위 수치는 **과거 Ledger 상태**이며 변경 이후 미해결 확정 수가 아니다.
- 모든 URL에 대한 본문/학습 관련성은 Concept 관계 단위로 판단하고, 403/JS shell·index만 접근한 자료를 broken으로 판정하지 않는다. 기존 Wave 감사와 canonical 출처는 보존한다.
- **이 PR은 R2 전체 완료가 아니다.** 다른 45 URL의 직접 검토·실제 변경 여부는 별도 evidence/checkpoint로 처리한다.

## 병합 전 검증
- Global `url → title/referenceType/language/depth/recommendation` 충돌 0, Concept URL 중복 0, 3 Concept 이외 변경 0.
- Network & HTTP 127 Concept/381 Question 감사 결과 재사용, 변경된 3 Concept의 본문 및 모든 Question 불변 검증.
- 격리 PostgreSQL 전체 canonical Preview→Apply→exact reimport 3,380 UNCHANGED 및 주요 이력 ID 보존 확인.
- 개발 환경 Reader의 3개 Concept에서 발행된 명세/초안 구분, 링크·제목·줄바꿈·새 탭 동작 Human Usage 검증. **Production Apply·배포·merge 금지.**

## 직접 확인한 출처
- RFC Editor Final Review: https://queue.rfc-editor.org/final-review/rfc10025/
- Published RFC 6265: https://www.rfc-editor.org/rfc/rfc6265.html
- HTTPWG RFC 6265bis latest draft: https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html
