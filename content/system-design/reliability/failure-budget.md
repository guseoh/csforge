---
kind: concept
contentKey: system-design.core.reliability.failure-budget
topicContentKey: system-design.core.reliability
slug: failure-budget
title: "failure budget과 graceful degradation"
summary: "SLO·error budget에 맞춰 optional feature를 줄이고 핵심 workflow를 보호한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://sre.google/sre-book/service-level-objectives/"
    title: "Google SRE Book: Service Level Objectives"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "SLO와 error budget을 release·reliability action에 연결하는 방법 확인"
  - url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html"
    title: "AWS Well-Architected Framework: Definitions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "reliability와 operational excellence를 architecture lifecycle에 포함하는 관점 확인"
---
# failure budget과 graceful degradation

모든 component를 항상 완벽하게 제공하려는 설계는 비용과 복잡성을 무한히 키울 수 있습니다. SLO가 허용하는 failure budget을 기준으로 핵심 workflow와 optional feature를 구분하고, dependency 장애나 overload 시 서비스가 유용한 축소 상태로 남도록 설계합니다.

### 핵심과 선택 기능을 분리한다

```text
dependency failure
  ├─ core: canonical write/read 보호, 명시적 timeout·pending
  └─ optional: recommendation/search enrichment 생략·stale fallback
```

Graceful degradation은 모든 error를 200으로 바꾸는 것이 아닙니다. 사용자가 무엇을 받았는지 알 수 있게 partial response·stale data·retry later를 구분하고, data invariant와 security check를 우회하지 않습니다.

### budget을 architecture decision으로 쓴다

budget burn이 빠르면 위험한 rollout을 멈추고 dependency·capacity·runbook 개선을 우선합니다. budget이 남는다고 arbitrary failure를 허용하지 않고, SLO의 사용자 영향과 cost를 함께 봅니다. dependency별 timeout budget, queue limit과 fallback의 합이 end-to-end 목표를 넘지 않는지 계산합니다.

### 복구 가능한 degradation

cache bypass가 origin을 무너뜨리거나 stale fallback이 민감한 권한 데이터를 노출하지 않도록 guard를 둡니다. feature flag, admission control, read-only mode, queueing과 reconciliation으로 degradation 진입·해제 조건을 관측 가능하게 합니다.

### 문제를 풀 때 확인할 것

1. user journey와 절대 지켜야 할 invariant를 정합니다.
2. core와 optional dependency를 분류합니다.
3. fallback·partial response·read-only·pending 상태를 명시합니다.
4. error budget burn과 feature/release policy를 연결합니다.
5. degradation이 origin overload·security bypass·data loss를 만들지 테스트합니다.

### 면접에서 설명한다면

Graceful degradation은 SLO와 invariant를 지키면서 optional feature의 품질을 낮추는 의도적 상태입니다. cache·search·recommendation은 stale/omitted가 가능할 수 있지만 canonical write·권한·금전 invariant는 보호해야 하며, budget burn·feature flag·fallback 복구와 reconciliation을 함께 운영합니다.
