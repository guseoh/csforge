# Issue #222 R2 · Infrastructure & Cloud Reference 교정 — 검토 기록

기준 main: `2862a92d9208153678f3b618df90fafe37cb2e09` / 작업 범위: `infrastructure.core.reliability.backup-restore` Reference만.

## 발견 및 자료 대조

- Wave 1 [W1-INFRA-004](../../content-audit/learning-experience-2026/references.md): 기존 `https://csrc.nist.gov/pubs/sp/800/34/r1/final`은 NIST 공식 페이지에서 **2010-11-11 withdrawn / superseded / no download**로 표시된다. 링크가 404라서 삭제하는 것이 아니다.
- 대체 공식 URL: `https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final`. NIST 공식 페이지에서 **2010-11-11 개정판, 2010년판 다운로드 가능, 복구 계획 및 연습 범위**가 확인된다.
- 학습 역할: 일반적인 비상/복구 계획 수립 배경을 보완한다. RPO/RTO 개별 시스템 보장이나 PostgreSQL PITR 내부 동작은 이 지침의 보장으로 전파하지 않는다. 두 번째 PostgreSQL 공식 Reference는 보존한다.

## 변경과 비변경

- `content/infrastructure-cloud/reliability/backup-restore.md`의 NIST URL·title·relationNote만 변경.
- Concept 본문/identity, 나머지 Reference, Question, schema, import/runtime 코드 수정 없음. 새로운 NIST URL의 전역 title이 기존 다른 Reference와 충돌하는지는 전 canonical 검증으로 확인.
- 단순 HTTP 접근 실패는 자료 오류로 분류하지 않는다. 검증되지 않은 자료의 `CURRENT_VERIFIED` 자동 승격 금지.

## 병합 전 게이트

- 동일 URL의 전역 metadata 일치와 관계 중복 0을 15Area 전체에서 검사.
- 독립 PostgreSQL canonical Preview/Apply/exact reimport, learning/history IDs 보존 확인.
- Reader에서 수정된 제목·설명과 외부 링크 동작을 비운영 환경에서 확인.
- **Draft / merge 금지 / Production Import 및 배포 금지.**
