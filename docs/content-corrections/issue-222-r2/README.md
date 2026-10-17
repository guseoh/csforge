# Issue #222 — R2 과거 Reference 감사 ↔ 최신 canonical 대조

기준 `main`: `2862a92d9208153678f3b618df90fafe37cb2e09` (R1 #225 병합 후).

목표는 Wave 1~4에서 이미 검토한 자료를 다시 처음부터 심사하지 않고, 현재 canonical의 Reference와 **관계별로** 대응해 남아 있는 검토 범위만 식별하는 것이다.

## 검증 구분

- 과거 Wave 1~3의 `sources`에는 Area 내 **URL 단위** 상태가 포함되며 같은 URL이 여러 Concept에서 쓰인다는 이유만으로 모든 관계를 직접 검증 완료로 승격하지 않는다.
- Wave 3 `wave-3-reference-issues.json`은 일부 기존 미확정/접근 상태를 가진 관계의 스냅샷이다. 전체 Reference 목록이 아니며 **현시점 미확정 전부로 해석하지 않는다**.
- Java Wave 4 `reference-relations.json`은 과거 원본 근거다. PR #225 R1에서 보완·삭제·한정 판정했고 원본 기록을 덮어쓰지 않는다.
- 개별 외부 페이지 직접 열람과 검색 색인, 브라우저 접근/HTTP status는 검증 수준이 다르다. 외부 접근 실패만으로 dead link라 단정하지 않는다.
- 본 reconcile 결과의 `historicalFlaggedRelations`는 **재검토 후보**이지 자동 오류 수/품질 FAIL 수가 아니다.

## 실행

```bash
python -m pip install pyyaml
python docs/content-corrections/issue-222-r2/reconcile.py --out /tmp/csforge-r2-reference-report.json
```

현재 15 Area, 721 Concept의 Markdown frontmatter를 모두 읽고 Concept별 중복 URL, displayOrder 중복, 동일 URL의 전역 메타데이터 충돌을 검사한다. 출력 JSON은 **현재 Reference 전체 관계**와 4개 Wave의 교차 기록 및 Area별 요약을 포함한다. CI에 연결할 경우 일회성 workflow는 검증 후 삭제한다.

## 현재 직접 확인한 교정 후보

1. **#226** Infrastructure & Cloud `backup-restore`: NIST SP 800-34 Rev1 `/r1/final` 2010-11-11 Withdrawn → `/r1/upd1/final` 공식 개정판 교체.
2. **#227** Security `user-details`: 제목은 UserDetailsService이나 실제 URL은 UserDetails 페이지였으므로 공식 `user-details-service.html`로 교정.

둘 다 독립 Draft Content Pack이며 실제 Import/idempotency/Human Usage 최종 검증 전에는 병합하지 않는다.

## R2 이후 범위

Wave 1~4의 과거 미확정 데이터와 최근 수정 사항을 대조해 사라진 관계와 여전히 미확정인 관계를 구분하고, **실제 결함**이 발견된 Area만 최소 Content Pack PR로 교정한다. 별도 승인 없이는 merge, Production Import, 배포하지 않는다. 전체 #222에는 R3 Reader UX도 별도로 남아 있다.

## 실행 완료 집계 · 2026-10-17

[GitHub Actions #38992591096](https://github.com/guseoh/csforge/actions/runs/38992591096)에서 전체 721 Concept/1,038 관계/621 URL을 실제로 읽어 전역 metadata 충돌 0, 같은 Concept URL 중복 0, displayOrder 중복 0을 검증했고 **CI SUCCESS**. 전체 JSON은 Actions Artifact `csforge-r2-reference-gap-report`로 보존.

과거 대조 후보 **168관계** 중 **Java R1에서 검토했던 15관계**는 재심사 대상으로 취급하지 않는다. 초기 비Java 후보는 **153관계**. 이후 `verified-relations.json`의 5개 관계는 공식/원문과 실제 Concept를 다시 대조한 **독립 후속 판정**이며, 과거 감사 원본은 수정하지 않았다. 이 5개를 제외하면 **비Java 미해결 후보 148관계**다. 이 수는 오류 개수가 아니며 구체적 URL 접근/개념 의미 검수 대기 숫자다.

이번 재검토에서 URL은 그대로 KEEP으로 판정한 5개는 다음이다.

| Concept | 외부 자료 | 확인된 적용 범위 |
|---|---|---|
| `backend.core.concurrency-transaction.optimistic` | Jakarta Persistence 3.2 `@Version` | 표준 optimistic conflict 감지. 재시도 정책 보장은 별개 |
| `spring.core.data-jpa.entity-lifecycle` | Jakarta Persistence 3.2 Spec | 영속성 컨텍스트/Entity 상태·merge 명세 |
| `spring.core.data-jpa.fetch-plan` | Jakarta Persistence 3.2 Spec | entity graph·fetch join 관련 절 |
| `messaging.core.semantics.message-model` | LINE Kafka 플랫폼 사례 | 작업 큐/플랫폼 사례. Command/Event의 규범적 계약 아님 |
| `performance.core.observability.signals-context` | 카카오 MATRIX 운영 사례 | 지표·분산 추적·운영 분석 사례. OTel API 계약 아님 |

추가로 Network & HTTP의 RFC 10025는 2026년 7월 정식 Cookie 문서로 검색·저자 원문이 확인되나 **기존 RFC-Editor canonical URL 직접 접근 성공과 Concept별 최종 검증을 별도로 확인하기 전에는 3개 관계의 미확정 상태를 유지**한다. 접근 도구의 404/403/빈 페이지만으로 삭제하지 않는다.
