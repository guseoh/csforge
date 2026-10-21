# Issue #204 — Infrastructure & Cloud 기존 콘텐츠 교정 기록

## 범위와 판단

- [Issue #204](https://github.com/guseoh/csforge/issues/204), `content/curriculum/infrastructure-cloud.yaml` 및 canonical 기존 콘텐츠 대조.
- 대상 **3 Topic / 9 Concept / 27 Question**. 각 Concept 원문·실제 Question prompt, 유형, accepted/model answer, 객관식 선택지와 rationale을 함께 점검.
- 9 Concept 중 **8 KEEP, 1 REINFORCE**. Question 27개는 유형·정답·연결·내용 유지.
- 기존 TEXT/ASCII 도식은 요청→LB/Ingress→앱, 인스턴스 준비 상태, DNS 전환, 객체 저장소/DB 원자성, 단계적 배포·복구 경계를 구체적으로 보여 주므로 **TEXT 유지**. 신규 SVG를 만들지 않는다. ALT·테마·반응형의 새로운 수동 QA 성공을 뜻하지 않음.

## 수정: RTO 시간 계산 및 용어 정밀화

`infrastructure.core.reliability.backup-restore` 원문의 다음 두 시각은 동일한 척도가 아니다.

| 시점 | 값 |
| --- | --- |
| 서비스 중단 | 18:00 |
| 복구 작업 시작 | 18:05 |
| 정상화 | 19:00 |
| **실제 서비스 중단 시간** | **60분** |
| **복구 작업에 걸린 시간** | **55분** |

기존에는 55분을 RTO 관점 복구 시간처럼 소개했다. **RTO 자체는 실제 측정 시간이 아니라 서비스 중단부터 정상화까지 허용되는 최대 시간 목표**이다. 실제 서비스 중단 60분과 순수 복구 작업 55분을 구분해, 목표 RTO와는 60분을 비교하도록 본문을 교정한다.

- 공식 근거: [AWS Well-Architected Reliability — Disaster recovery objectives](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/disaster-recovery-dr-objectives.html).
- 원래 `contentKey`, frontmatter, Reference URL·정체성, Question 27개, curriculum·asset 불변.
- 다른 8개 Concept와 연결 질문은 별도 교정이 필요한 명백한 오류를 발견하지 않아 KEEP. 단순 문체 통일과 불필요한 전면 재작성 금지.

## 검증 상태

- [ ] 변경 Concept 단독 Preview/Apply, exact reimport UNCHANGED, 기존 개인/history 관계 보존을 실제 격리 DB에서 확인.
- [ ] 최종 PR HEAD CI SUCCESS, 변경 범위·base drift·review thread 확인.
- [ ] 상위 Issue #204의 Human Usage Check 관련 완료 조건은 자동 검증으로 대체하지 않는다.
- [ ] 운영 PostgreSQL Import 실행 금지(별도 승인/절차).
