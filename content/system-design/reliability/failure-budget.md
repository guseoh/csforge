---
kind: concept
contentKey: system-design.core.reliability.failure-budget
topicContentKey: system-design.core.reliability
slug: failure-budget
title: "Error Budget과 Graceful Degradation"
summary: "SLO와 error budget을 기준으로 핵심 workflow와 선택 기능을 구분하고 장애·과부하 때 어떤 품질을 낮춰 전체 서비스를 보호할지 판단한다."
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
# Error Budget과 Graceful Degradation

서비스의 모든 기능을 어떤 장애에서도 같은 품질로 유지하려 하면 비용과 복잡성이 크게 늘어납니다. System Design에서는 먼저 어떤 user journey가 핵심이고 어떤 기능은 일시적으로 품질을 낮추거나 생략할 수 있는지 구분합니다.

예를 들어 학습 결과 저장은 canonical state이므로 실패를 숨기면 안 되지만, 추천 콘텐츠나 통계 enrichment는 장애 중 잠시 생략해도 핵심 학습 흐름을 유지할 수 있습니다.

```text
dependency failure
  ├─ core workflow     → correctness 우선, 명확한 성공/실패
  └─ optional feature → omit / stale / delayed 같은 제한적 대체
```

Graceful degradation은 오류를 성공처럼 감추는 것이 아닙니다. 일부 데이터를 생략했다면 사용자가 어떤 결과를 받았는지 알 수 있어야 하고, 권한·금전·canonical write 같은 invariant는 대체 처리 때문에 우회되어서는 안 됩니다.

SLO와 error budget은 이런 선택을 운영 정책과 연결하는 데 사용할 수 있습니다. Budget이 빠르게 소진되면 새 기능 rollout을 늦추거나 reliability 개선을 우선할 수 있고, 반복적으로 optional dependency 때문에 핵심 흐름이 깨진다면 architecture 경계를 다시 검토할 근거가 됩니다.

중요한 것은 모든 component를 완벽하게 만드는 것이 아니라 **장애가 발생했을 때 어떤 기능을 먼저 포기해서 핵심 사용자 가치와 invariant를 지킬 것인지 미리 정하는 것**입니다.
