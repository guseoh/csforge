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

추가로 Network & HTTP의 RFC-to-be 10025 저자 원고는 2026년 7월 발행 형식의 머리글을 포함하지만, **RFC Editor 공식 Queue는 2026-10-17 기준 Final Review**로 표시한다. 따라서 출판 완료로 해석하지 않고, 기존 RFC 10025 안내 3관계의 교정은 독립 Draft [#229](https://github.com/guseoh/csforge/pull/229)에서 추적한다. 원문 접근 제한만으로 404/삭제를 판단하지 않는다.

## R2 관계 대조 검증 완료

- 기준: 일회성 [Repository Validation #38992865607](https://github.com/guseoh/csforge/actions/runs/38992865607) SUCCESS. 전체 JSON 증거: `csforge-r2-reference-gap-report` Artifact.
- 전체 **15Area / 721 Concept / 1,038 관계 / 621URL**, 글로벌 URL 메타 충돌 **0**, Concept 내 URL 중복 **0**, displayOrder 중복 **0**.
- Wave 3 과거 186개 원본 관계 **전부 최신 canonical에 존재**, 그중 NEEDS_REVIEW 146개 (CA46/DSA70/OS26/Network4).
- Java Wave 4 과거 272관계 중 PR #225에서 5관계 제거 → 현재 267. 옛 NEEDS_REVIEW 16 중 1관계 제거/15관계 R1에서 판정 완료. 증거 원본의 상태 변경 아님.
- 중복 제거 기준 비Java 과거 미확정 후보 **153관계**, 이 가운데 5개를 독립 원문 대조해 KEEP 판단; **남은 148관계**는 오류 확정 수가 아닌 후속 검토 대기 건수.
- 일회성 workflow 검사 스텝 제거 후 기존 Repository Validation 정의로 복귀; 본 PR에는 **감사 코드·기록·결정 근거만 포함**.

## R2 후속 정리 — 2026-10-17 (OSTEP 원문·중복 PR)

- **중복 PR #226 종료**: 같은 NIST `backup-restore` 변경을 독립 재작성한 [#230](https://github.com/guseoh/csforge/pull/230)에 old→new Testcontainers 회귀 검증까지 포함되어 단일 진행 PR로 채택. #226은 병합하지 않음.
- **발행 상태 교정 [#229](https://github.com/guseoh/csforge/pull/229)**: HTTP 쿠키 3관계가 참조하던 RFC-to-be 10025는 공식 RFC Editor Final Review 페이지에서 아직 미출판이다. 정식 RFC 6265와 변경 가능한 6265bis draft를 분리했다. 실제 old→new / Reader 최종 게이트는 별도.
- **Operating Systems OSTEP 원문 직접 확인**: [Chapter 26 PDF](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf)의 서론·26.1·26.2·26.3 원문을 확인해 11개 관계를 Concept별로 대조. **10관계 KEEP**은 `verified-relations.json`에 각 근거·제한을 추가했고, 사용자 스레드 매핑까지 보장하는 듯한 relationNote 1관계는 [#231](https://github.com/guseoh/csforge/pull/231) Draft로 최소 한정 수정. 원문 전체가 자동 검증되었다는 뜻은 아니다.
- 원래 집계 **비Java 과거 미확정 153관계**, 직접 검증 5→**15관계**, **잔여 후보 148→138관계**로 내려간다. 이 수치는 오류·실패 수가 아니고, #229/#230/#231의 미병합 수정을 자동 반영해 감한 값도 아니다. 정확한 수치는 `reconcile.py` 재실행 후 확정한다.
- R2 브랜치 자체는 **감사/근거 전용**이며 canonical 수정·운영 DB 적용·병합 없음. [#227](https://github.com/guseoh/csforge/pull/227), [#229](https://github.com/guseoh/csforge/pull/229), [#230](https://github.com/guseoh/csforge/pull/230), [#231](https://github.com/guseoh/csforge/pull/231)은 별도의 독립 교정 Draft PR이다.

## DSA 70관계 / 18URL 1차 독립 대조

- [DSA 관계별 재검토 및 검색 색인·공식 저자 코드 근거](dsa-preliminary.md) 추가. 70관계/18URL을 전부 추적하고, 원문 읽을 범위 점검이 우선인 7관계를 구분.
- Princeton 7개 canonical URL 직접 확인은 403, 일부 본문·저자 코드는 검색 색인에서 확인. **직접 원문 검증으로 승격하지 않고** DSA 70관계는 계속 후속 검토 대기.
- 이 업데이트는 canonical 변경/새 확정 결함/추가 15건 VERIFIED를 의미하지 않으며 현재 R2 감사 집계 **15 verified / 138 pending 유지**. 다른 교정 PR과 중복 수정 없음.
