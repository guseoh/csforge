---
kind: concept
contentKey: system-design.core.architecture.decision-evidence
topicContentKey: system-design.core.architecture
slug: decision-evidence
title: "설계 결정의 근거와 변경 조건"
summary: "요구사항과 측정 가능한 근거로 아키텍처 대안을 비교해 결정하고, 전제가 바뀌었을 때 기존 결정 기록을 보존하며 재검토한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html"
    title: "AWS Prescriptive Guidance: Architectural Decision Record Process"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "설계 결정의 context·alternatives·decision·consequences, Proposed/Accepted/Superseded 상태 및 변경 이력"
  - url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/best-practices.html"
    title: "AWS Prescriptive Guidance: ADR Best Practices"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "승인된 ADR 이력의 보존과 이후 결정으로 대체하는 재검토 절차"
---
# 설계 결정의 근거와 변경 조건

백엔드 검색 API가 느려 보인다는 이유만으로 CQRS, 별도 검색 엔진이나 마이크로서비스를 도입한다면 아직 해결할 문제가 정해지지 않은 상태에서 운영 책임만 늘어날 수 있습니다. 반대로 지금의 단순한 설계가 항상 적합하다고 주장하는 것도 위험합니다. 좋은 설계 결정은 **현재 충족해야 할 조건**, **검토한 대안**, **선택의 근거**, **전제가 달라질 때 다시 판단할 기준**을 연결해야 합니다.

아키텍처 결정 기록(Architectural Decision Record, ADR)은 이런 판단을 남기는 방법입니다. ADR은 클래스·테이블을 나열하는 설계 명세서가 아니라, 당시 왜 특정 대안을 선택하고 무엇을 포기했는지를 다른 사람이 다시 확인할 수 있게 해 줍니다. 주로 구조·품질 요구·핵심 의존성·공개 계약처럼 변경 비용이 큰 판단에 사용하며, 사소한 변수명까지 문서화하는 절차는 아닙니다.

## 요구사항이 대안을 결정한다

다음은 **가상으로 측정한 검색 서비스** 예시입니다.

| 조건 | 현재 관측 및 목표 |
| --- | --- |
| 캠페인 시 최대 유입 | 500 QPS |
| 검색 지연 시간 | 실제 부하 테스트 p99 = 180ms |
| 요구 지연 시간 | 유효 요청 p99가 300ms 미만 |
| 인덱스/파생 뷰의 허용 지연 | 검색 결과 오래됨은 최대 5초 |
| 기준 데이터 | PostgreSQL의 canonical write model |

팀이 고민하는 후보는 (A) PostgreSQL 검색 쿼리/인덱스와 페이지네이션을 유지·개선하기, (B) 별도 읽기 Projection을 구축하기입니다. B가 현재 요구를 항상 더 잘 충족한다고 볼 수는 없습니다. 특히 새 Projection의 갱신 지연이 최대 30초일 수 있다면 위 최신성 목표 5초에 맞지 않습니다. 운영·재구축·실패 복구 비용도 생깁니다. **현재 측정과 전제만 놓고 보면 A를 유지하는 선택**에 근거가 있지만, 실제 운영 부하와 성장 전망을 재확인해야 합니다.

```text
요구사항 + 측정값
      │
      ├─ 대안 A: 기존 PostgreSQL 읽기 개선
      │     ├─ 장점: 단일 기준 저장소·단순 복구
      │     └─ 비용: DB 부하·복잡한 검색의 한계
      │
      └─ 대안 B: 비동기 읽기 Projection
            ├─ 장점: 검색 조회 경로 최적화 가능
            └─ 비용: 갱신 지연·동기화·backfill·운영 복잡성
      │
      ▼
판정 조건 명시 → 현재 A 선택 → 운영 지표 수집
      │
      ├─ 목표 충족: 결정 유지
      └─ 전제 반증: 새 대안 실험·재검토
```

이 흐름은 특정 기술을 일률적인 정답으로 정하지 않습니다. 최신성 목표가 1분으로 완화되거나 검색 요구가 전문 검색·복잡한 집계로 바뀐다면 Projection의 가치가 달라질 수 있습니다. 반대로 인덱스와 조회 경로만 바꿔도 목표를 충족한다면 별도 시스템의 위험을 감수할 필요가 없습니다.

## ADR에는 무엇을 기록하는가

다음처럼 짧더라도 판정 가능한 정보가 있어야 합니다.

```text
ADR-007: 검색 읽기 모델의 초기 선택
Status: Accepted
Context: peak 500 QPS, 목표 p99 < 300ms, 허용 stale <= 5초
Evidence: 동일 데이터/요청 구성의 측정 p99 180ms
Options: A) PostgreSQL 유지·인덱스 최적화  B) 비동기 Projection
Decision: A 유지, 병목 측정 전 별도 읽기 저장소 추가하지 않음
Consequences: 구축·복구 단순; DB 처리량·복잡 검색 확장 한계 수용
Review trigger: 동일 조건에서 p99/SLO 위반 지속, query shape 변화,
                데이터 규모·갱신 지연 요구 변경 또는 DB 포화 증거
Owner/Date: 결정 책임자 및 승인 시각 별도 기록
```

여기서 **p99가 어떤 요청의 어떤 상태를 포함하는지**가 빠지면 수치 비교가 무의미합니다. 개선 전후에 트래픽·캐시 준비 상태·요청 비율·데이터 크기가 달라졌는지도 함께 기록합니다. “p99가 목표를 초과하면 재검토한다”는 **검토 트리거**이지, 곧바로 검색 엔진을 추가하라는 **자동 결정**이 아닙니다. 원인 분석에서 DB 연결 풀 대기·락·쿼리 실행이 구분되지 않았다면 저장소 분리가 아니라 잘못된 트랜잭션 범위를 고쳐야 할 수도 있습니다.

## 결정이 바뀌면 과거 기록을 지우지 않는다

예를 들어 이후 캠페인 유입이 3,000 QPS로 증가하고 동일한 계측 조건에서 p99가 450ms로 악화됐다고 가정하겠습니다. 먼저 API·DB·큐·외부 I/O의 실제 병목을 재측정하고, 기존 A를 최적화할 때의 비용과 B를 구축할 때의 최신성·backfill·rollback 비용을 비교해야 합니다. 새 요구가 기존 결정의 전제를 깨뜨렸다면 이전 ADR의 근거를 보존한 채 **새 제안(또는 새 승인 결정)이 이전 ADR을 대체(Superseded)** 하도록 연결합니다. 과거 결정을 조용히 덮어쓰면 당시의 최선이 무엇이었는지, 변화가 왜 필요했는지 설명할 수 없습니다.

ADR의 상태는 예컨대 Proposed, Accepted, Rejected, Superseded로 구분할 수 있습니다. AWS의 ADR 지침도 승인된 기록을 보존하고 새 승인 기록이 이전 결정을 대체하는 흐름을 설명합니다. 선택의 실제 효과는 카나리·실험·SLO·비용을 통해 검증하되, ADR만으로 데이터 마이그레이션이 되돌려지거나 장애가 사라지는 것은 아닙니다.

이 Concept이 소유하는 것은 **대안의 기술 내부 동작**이 아니라 **요구→측정→대안→선택→관측→재검토**라는 판단 계약입니다. 쓰기/읽기 모델의 실제 일관성은 read-write-models, 모듈형 모놀리스와 서비스 분리의 구현 비용은 modular-monolith-services, 요구 수치화는 capacity-data에서 각각 깊게 다룹니다.
