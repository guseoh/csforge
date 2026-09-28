---
kind: concept
contentKey: performance.core.operations.capacity-autoscaling
topicContentKey: performance.core.operations
slug: capacity-autoscaling
title: "용량 계획과 자동 확장"
summary: "수요·최대 부하·여유 용량·확장 지연을 고려하고 자동 확장을 용량 계획을 보조하는 피드백 루프로 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/"
    title: "Kubernetes Documentation: Horizontal Pod Autoscaling"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "metric 기반 horizontal scaling과 stabilization 확인"
---
# 용량 계획과 자동 확장

용량 계획(capacity planning)은 현재 평균 사용량만 보고 인스턴스 수를 정하는 일이 아닙니다. 평상시 수요뿐 아니라 최대 부하와 순간 급증, 한 인스턴스나 가용 영역이 사라졌을 때 남는 여유, 새로운 처리 용량이 실제로 준비되기까지 걸리는 시간과 비용을 함께 봐야 합니다.

자동 확장(autoscaling)은 이 계획을 일부 자동화하는 피드백 루프입니다. 메트릭이 변한 뒤 수집·평가되고 확장 결정이 내려진 다음 새 인스턴스가 시작되고 준비 과정을 끝내야 실제 처리 용량이 늘어납니다. 따라서 급격한 순간 부하를 자동 확장 하나만으로 즉시 흡수할 수 있다고 가정하면 안 됩니다.

```text
수요 증가
   ↓
메트릭 관측
   ↓
확장 결정
   ↓
인스턴스 시작 / 준비
   ↓
실제 처리 용량 증가
```

확장 신호도 작업 부하에 맞아야 합니다. CPU가 낮아도 대기열의 가장 오래된 작업 시간이나 DB 연결 대기가 계속 증가할 수 있고, 반대로 시작 중 CPU가 높다고 안정 상태의 수요가 높다는 뜻은 아닙니다. 요청 동시성, 대기열 깊이·대기 시간, 사용자 지연 시간 같은 작업 부하 신호와 CPU·메모리 같은 자원 신호를 함께 해석하는 편이 좋습니다.

피드백 루프가 너무 민감하면 확장과 축소가 반복되는 흔들림(flapping)이 생길 수 있습니다. 일반 자동 확장기에서는 이를 줄이기 위해 일정 시간 추가 확장을 막는 cooldown 같은 개념을 사용할 수 있습니다. Kubernetes HPA에서는 같은 안정화 목적을 `stabilizationWindowSeconds`, 확장·축소 정책과 허용 오차(tolerance)로 제어합니다. 따라서 HPA 설정을 설명할 때 일반적인 cooldown을 HPA의 고유 설정 이름처럼 사용하지 않습니다.

HPA가 외부 메트릭을 사용하려면 해당 값을 Kubernetes가 조회할 수 있는 외부 메트릭 API 경로와 어댑터가 필요합니다. 신호가 늦게 수집되거나 새 Pod가 준비되기까지 시간이 걸리는 점을 반영해 최소/최대 복제본 수와 충분한 여유 용량도 함께 설계해야 합니다.

마지막으로 애플리케이션 복제본만 늘어난다고 전체 처리 용량이 같은 비율로 늘어나는 것은 아닙니다. DB 연결 수, 브로커 파티션, 외부 API 할당량, 노드 용량처럼 공유하는 하위 시스템 한계가 먼저 포화될 수 있습니다. 그래서 용량 계획은 **한 구성 요소의 자동 확장 설정이 아니라 전체 요청 경로의 병목과 실패 여유를 계산하는 작업**입니다.
