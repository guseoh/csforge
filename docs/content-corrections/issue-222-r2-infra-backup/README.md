# Issue #222 R2 — Infrastructure & Cloud NIST Reference 갱신

## 사실 근거
- 기준 main: 2862a92d9208153678f3b618df90fafe37cb2e09
- Wave 1 발견 W1-INFRA-004 P1: infrastructure.core.reliability.backup-restore의 NIST 옛 링크.
- 기존 https://csrc.nist.gov/pubs/sp/800/34/r1/final : NIST 공식 표기에 Withdrawn 2010-11-11, No Download Available. 링크 자체가 404인 것은 아니다.
- 신규 https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final : NIST 공식 Final, Updated 2010-11-11, 공식 전문 내려받기 존재. 2010년 지침이며 최신 조직별 복구 정책을 대신하지 않는다.
- PostgreSQL PITR 문서 두 번째 Reference는 변경하지 않는다.

## 최소 변경 및 보존
- content/infrastructure-cloud/reliability/backup-restore.md의 첫 번째 Reference URL/title/recommendation/relationNote만 수정.
- referenceType/language/depth/order, Concept body/metadata/contentKey 및 모든 Question/Curriculum/SVG/제품 코드는 변경 금지.
- old 관계 → new 관계 재import에서도 Concept ID, personal/history data 보존, 전체 3380 item UNCHANGED를 격리 PostgreSQL 검증.
- 기존 Wave1 감사 원본은 변경하지 않는다.

## 게이트
- [x] 공식 NIST 옛 Withdrawn 및 updated Final URL 직접 확인.
- [ ] 기존값→교정본 격리 PostgreSQL Preview/Apply, ID·이력 보존, 전체 exact reimport 3380 UNCHANGED.
- [ ] Reader 업데이트된 링크·제목/설명·접근성 실제 확인.
- [ ] 글로벌 Reference 메타데이터 충돌 0 / CI 성공 / 승인 전 병합 금지.

다른 Area의 R2 내용은 별도 PR. Production DB·Cloud Run 배포·병합 금지.
