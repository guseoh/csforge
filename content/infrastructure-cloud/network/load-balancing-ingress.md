---
kind: concept
contentKey: infrastructure.core.network.load-balancing-ingress
topicContentKey: infrastructure.core.network
slug: load-balancing-ingress
title: "load balancing과 ingress"
summary: "client·load balancer·service·instance routing과 health-aware traffic distribution을 설명한다"
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
# load balancing과 ingress

여러 application instance가 있어도 client가 각 pod IP를 직접 알 필요는 없습니다. Ingress/load balancer가 외부 request를 받아 host·path·TLS 정책을 적용하고 service가 healthy backend로 전달하는 경계를 만듭니다.

```text
Client
  │ HTTPS /api/concepts
  ▼
Ingress / Load Balancer
  │ route + health check
  ▼
Service
  ├─ instance A
  ├─ instance B
  └─ instance C (not ready -> 제외)
```

### health와 routing은 연결된다

backend가 process로 살아 있어도 DB migration 중이거나 overload라 request를 받을 준비가 안 됐을 수 있습니다. readiness 실패 instance를 traffic pool에서 제외하고, liveness 실패는 restart 후보로 판단하는 식으로 health signal의 의미를 분리해야 합니다.

### stateful session은 별도 선택이 필요하다

instance가 local memory에 session을 두면 load balancing이 다음 request를 다른 instance에 보내 인증 상태를 잃을 수 있습니다. sticky session, shared session store, stateless token 중 선택하되 availability·revocation·운영 비용을 함께 판단합니다.

### 문제를 풀 때 확인할 것

1. TLS termination과 downstream encryption 경계를 찾습니다.
2. readiness와 liveness가 무엇을 의미하는지 분리합니다.
3. route 변경·instance drain 중 in-flight request를 봅니다.
4. local state가 load distribution과 충돌하는지 확인합니다.
5. backend별 error·latency·health를 관측합니다.

### 면접에서 설명한다면

Load balancer/ingress는 외부 request를 stable backend 집합으로 routing하고 TLS·host/path 정책과 health signal을 적용하는 경계입니다. 살아 있음과 traffic을 받을 준비가 됨은 다르므로 readiness와 liveness를 구분하고, session state가 있으면 instance 간 공유·sticky·stateless 중 하나를 명시적으로 선택합니다.

