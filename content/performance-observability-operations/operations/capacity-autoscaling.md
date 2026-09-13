---
kind: concept
contentKey: performance.core.operations.capacity-autoscaling
topicContentKey: performance.core.operations
slug: capacity-autoscaling
title: "capacity planning과 autoscaling"
summary: "demand forecast, headroom, scaling signal과 stabilization을 capacity·cost·reliability trade-off로 판단한다"
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
# capacity planning과 autoscaling

Capacity planning은 현재 평균 사용량을 복제하는 일이 아니라 예상 demand, peak·burst, 실패 시 여유, 확장 속도, 비용과 downstream 한계를 함께 계산하는 일입니다. Autoscaling은 그 계획을 일부 자동화하는 feedback controller이지 capacity 계획과 운영 대체물이 아닙니다.

### scaling signal을 workload에 맞춘다

CPU가 낮아도 queue backlog, 요청 concurrency, DB connection wait가 포화일 수 있습니다. 반대로 시작 중인 instance의 높은 CPU가 실제 steady-state demand를 뜻하지 않을 수 있습니다. 사용자 지연 시간·queue age 같은 leading signal과 resource metric을 함께 검토합니다.

```text
demand ─▶ metric delay ─▶ scale decision ─▶ startup/warm-up ─▶ capacity available
             └─ delay와 overshoot를 고려한 headroom
```

### feedback loop를 안정화한다

metric collection delay, 시작 time, cooldown, min/max replicas, scale-up/down 정책과 stabilization window가 없으면 flapping이나 늦은 scale-out이 발생합니다. HPA가 replica 수를 늘려도 DB connection budget·partition·node capacity가 늘지 않으면 병목을 옮길 뿐입니다.

### capacity를 실패에도 계산한다

N개 replica가 정상 peak를 처리해도 한 zone·instance 장애 뒤 N-1개가 SLO를 유지할 수 있는지 확인합니다. queue consumer는 backlog age와 processing rate로 drain time을 계산하고, batch 작업은 concurrency를 올렸을 때 downstream write amplification을 검증합니다.

### 문제를 풀 때 확인할 것

1. demand·peak·burst·실패 scenario를 정의합니다.
2. leading signal과 resource saturation을 선택합니다.
3. metric delay·시작·cooldown·headroom을 계산합니다.
4. downstream connection·quota·node capacity를 확인합니다.
5. scale event와 cost·SLO·flapping을 검증합니다.

### 면접에서 설명한다면

Autoscaling은 demand에 따라 capacity를 조정하는 feedback loop지만 metric delay와 시작 time 때문에 즉시 해결책이 아닙니다. 지연 시간·queue·resource signal, min/max·headroom·stabilization을 설계하고, replica를 늘려도 DB·broker·node 한계가 그대로인 경우의 bottleneck과 실패 capacity를 함께 계산합니다.
