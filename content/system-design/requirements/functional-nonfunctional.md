---
kind: concept
contentKey: system-design.core.requirements.functional-nonfunctional
topicContentKey: system-design.core.requirements
slug: functional-nonfunctional
title: "기능 요구와 품질 요구"
summary: "사용자가 해야 하는 일을 기능 요구로, latency·availability·durability·security·cost 같은 기대 수준을 측정 가능한 제약으로 바꾸는 방법을 이해한다."
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
# 기능 요구와 품질 요구

System Design은 먼저 “무엇을 만들 것인가”를 구체화하는 작업에서 시작합니다. 기능 요구는 사용자가 어떤 행동을 할 수 있어야 하는지 설명하고, 품질 요구는 그 기능이 어느 수준의 지연 시간·가용성·내구성·보안·비용 제약 안에서 동작해야 하는지를 설명합니다.

예를 들어 “사용자는 게시물을 검색할 수 있다”는 기능 요구입니다. 하지만 이것만으로는 검색 결과를 5초 안에 주어도 되는지, 장애 중 일부 결과를 생략해도 되는지, 초당 요청이 10건인지 10만 건인지 알 수 없습니다.

```text
기능 요구
사용자는 키워드로 게시물을 검색한다.

품질 요구
- peak 500 QPS
- 유효한 검색의 p99 < 300 ms
- 검색 색인은 수 초의 stale 허용
- 검색 장애가 게시물 작성 기능을 막아서는 안 됨
```

`빠르게`, `대규모로`, `고가용성으로` 같은 표현은 아직 설계 입력으로 부족합니다. 대상 사용자 수, peak workload, 허용 가능한 stale 정도, 장애 시 반드시 남아야 할 기능, 데이터 손실 허용 범위처럼 architecture 선택을 바꾸는 조건을 수치나 명확한 상태로 바꿔야 합니다.

모든 목표를 동시에 최대로 만들 수도 없습니다. 더 높은 가용성, 더 낮은 지연 시간, 더 강한 durability는 보통 비용과 복잡성을 증가시킵니다. 따라서 절대 깨면 안 되는 invariant와 품질을 조금 낮춰도 되는 preference를 먼저 구분합니다.

좋은 요구사항은 마지막에 검증할 수 있어야 합니다. “장애 중에도 핵심 주문 조회는 가능해야 한다”, “배포 중 p99가 SLO를 넘으면 rollout을 중단한다”처럼 측정 방법과 acceptance condition을 연결하면 이후 architecture 선택이 취향이 아니라 요구사항에 대한 답이 됩니다.
