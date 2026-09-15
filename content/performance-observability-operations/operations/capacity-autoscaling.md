---
kind: concept
contentKey: performance.core.operations.capacity-autoscaling
topicContentKey: performance.core.operations
slug: capacity-autoscaling
title: "용량 계획과 Autoscaling"
summary: "수요·peak·headroom·확장 지연을 계산하고 autoscaling을 capacity 계획을 보조하는 feedback loop로 이해한다."
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
# 용량 계획과 Autoscaling

Capacity planning은 현재 평균 사용량만 보고 instance 수를 정하는 일이 아닙니다. 평상시 수요뿐 아니라 peak와 burst, 한 instance나 zone이 사라졌을 때 남는 여유, 새로운 capacity가 실제로 준비되기까지 걸리는 시간과 비용을 함께 봐야 합니다.

Autoscaling은 이 계획을 일부 자동화하는 feedback loop입니다. Metric이 변한 뒤 수집·평가되고 scale decision이 내려진 다음 새 instance가 시작되고 warm-up을 끝내야 실제 처리 capacity가 늘어납니다. 따라서 급격한 burst를 autoscaling 하나만으로 즉시 흡수할 수 있다고 가정하면 안 됩니다.

```text
demand 증가
   ↓
metric 관측
   ↓
scale decision
   ↓
instance start / warm-up
   ↓
실제 capacity 증가
```

Scaling signal도 workload에 맞아야 합니다. CPU가 낮아도 queue age나 DB connection wait가 계속 증가할 수 있고, 반대로 startup 중 CPU가 높다고 steady-state demand가 높다는 뜻은 아닙니다. Request concurrency, queue depth·age, user latency 같은 workload signal과 CPU·memory 같은 resource signal을 함께 해석하는 편이 좋습니다.

Feedback loop가 너무 민감하면 scale up/down이 반복되는 flapping이 생길 수 있습니다. Min/max replica, stabilization window, cooldown, scale-up/down 속도를 정하고 metric delay와 startup time을 고려해 충분한 headroom을 둡니다.

마지막으로 application replica만 늘어난다고 전체 capacity가 같은 비율로 늘어나는 것은 아닙니다. DB connection 수, broker partition, external API quota, node capacity처럼 공유하는 downstream 한계가 먼저 포화될 수 있습니다. 그래서 capacity planning은 **한 component의 autoscaling 설정이 아니라 end-to-end 병목과 실패 여유를 계산하는 작업**입니다.
