---
kind: concept
contentKey: infrastructure.core.network.load-balancing-ingress
topicContentKey: infrastructure.core.network
slug: load-balancing-ingress
title: "외부 요청의 진입과 부하 분산"
summary: "외부 요청이 load balancer·ingress·service를 거쳐 준비된 application instance로 전달되는 흐름과 health signal이 traffic routing에 미치는 영향을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://kubernetes.io/docs/concepts/services-networking/ingress/"
    title: "Kubernetes Documentation: Ingress"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "external HTTP access와 routing rule의 platform abstraction 확인"
  - url: "https://kubernetes.io/docs/concepts/services-networking/service/"
    title: "Kubernetes Documentation: Services"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "stable service endpoint와 backend pod routing 확인"
---
# 외부 요청의 진입과 부하 분산

Application instance가 여러 개라면 client가 각 instance 주소를 직접 알아야 할 필요는 없습니다. 앞단의 load balancer나 ingress가 stable endpoint를 제공하고, route 규칙에 따라 실제 backend로 traffic을 전달할 수 있습니다.

```text
Client
   │ HTTPS
   ▼
Load Balancer / Ingress
   │ host/path routing
   ▼
Service / backend pool
   ├─ instance A
   ├─ instance B
   └─ instance C
```

### 살아 있는 것과 요청을 받을 준비가 된 것은 다르다

Process가 실행 중이어도 startup migration을 수행 중이거나 필수 dependency 연결이 끝나지 않았다면 실제 요청을 받으면 안 될 수 있습니다. Readiness 신호는 이런 instance를 traffic pool에서 제외하는 데 사용할 수 있습니다.

반면 liveness는 process를 다시 시작해야 할 정도로 회복 불가능한 상태인지 판단하는 신호입니다. Readiness 실패를 곧바로 restart 사유로 사용하면 일시적인 dependency 장애 때 불필요한 restart가 반복될 수 있습니다.

```text
process running
  ├─ ready    → traffic 가능
  └─ not ready → traffic 제외
```

### Rollout에서도 health가 traffic 전환을 결정한다

새 version을 배포할 때 old/new instance가 잠시 함께 존재할 수 있습니다. 새 instance가 실제로 준비되기 전에 traffic을 보내면 deployment가 곧 사용자 오류가 됩니다. 반대로 종료 중인 instance에서는 새로운 traffic을 끊고 in-flight 요청을 마칠 시간을 줄 수 있어야 합니다.

### Local state는 여러 instance와 충돌할 수 있다

Session이나 임시 상태를 한 instance memory에만 두면 다음 요청이 다른 instance로 이동했을 때 상태를 찾지 못할 수 있습니다. Sticky routing을 사용할 수도 있지만 instance 장애와 scale-out 제약이 생깁니다. 필요하다면 shared state 또는 stateless contract를 검토합니다.

Load balancing의 핵심은 단순히 요청을 균등하게 나누는 것이 아니라 **현재 요청을 받아도 되는 backend만 traffic 집합에 포함시키고, 배포·장애·종료 중에도 그 집합을 안전하게 바꾸는 것**입니다.
