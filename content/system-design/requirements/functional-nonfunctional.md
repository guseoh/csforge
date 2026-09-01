---
kind: concept
contentKey: system-design.core.requirements.functional-nonfunctional
topicContentKey: system-design.core.requirements
slug: functional-nonfunctional
title: "functional과 non-functional requirements"
summary: "user journey를 기능으로, latency·availability·durability·cost·security를 measurable constraint로 번역한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://sre.google/sre-book/service-level-objectives/"
    title: "Google SRE Book: Service Level Objectives"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "user-visible SLI/SLO와 measurable service behavior 확인"
  - url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html"
    title: "AWS Well-Architected Framework: Definitions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "reliability·performance·cost·security trade-off의 architecture 평가 관점 확인"
---
# functional과 non-functional requirements

System design은 component를 그리는 일보다 “누가 어떤 상황에서 무엇을 기대하는가”를 명확히 하는 데서 시작합니다. Functional requirement는 사용자가 할 수 있어야 하는 동작이고, non-functional requirement는 그 동작의 latency, availability, durability, security, cost, operability 같은 품질과 제약입니다.

### 요구사항을 measurable하게 만든다

```text
“빠른 검색” ─▶ 99% of valid queries < 300ms, peak QPS 500
“안전한 저장” ─▶ 권한 없는 read 차단, RPO/RTO와 보존 기간 정의
```

“실시간”, “대규모”, “고가용성”은 설계 입력으로 부족합니다. 대상 사용자와 workload, 정상·peak·장애 시 behavior, 데이터 보존·정합성, 법적·보안 제약, 예산을 질문해 수치와 우선순위로 바꿉니다.

### 충돌하는 목표를 표시한다

더 낮은 latency는 비용·freshness·consistency를 요구할 수 있고, 강한 durability는 write latency와 운영 비용을 높일 수 있습니다. 모든 품질을 최대로 선택할 수 있다고 가정하지 말고, 반드시 지켜야 하는 invariant와 완화 가능한 preference를 분리합니다.

### acceptance criteria를 설계한다

각 requirement에는 측정 방법과 검증 시나리오를 붙입니다. 예를 들어 outage 중 핵심 read는 유지하고 recommendation은 생략하는지, deploy 중 기존 request가 drain되는지, data restore 후 어떤 record가 보이는지를 미리 정해야 architecture trade-off가 테스트로 연결됩니다.

### 문제를 풀 때 확인할 것

1. actor·user journey·functional outcome을 적습니다.
2. latency percentile·QPS·availability·RPO/RTO·cost를 수치화합니다.
3. 반드시 지킬 invariant와 허용할 degradation을 구분합니다.
4. 보안·운영·규제 제약을 early boundary로 둡니다.
5. 각 요구사항의 측정과 acceptance scenario를 정의합니다.

### 면접에서 설명한다면

기능 요구는 user journey와 state transition으로, 비기능 요구는 workload·latency·availability·durability·security·cost의 측정 가능한 목표로 번역합니다. 설계 전에 hard invariant와 trade-off 가능한 preference를 구분하고, 정상·peak·장애·배포 시 acceptance scenario를 정해야 component 선택을 검증할 수 있습니다.
