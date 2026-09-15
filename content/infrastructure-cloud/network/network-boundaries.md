---
kind: concept
contentKey: infrastructure.core.network.network-boundaries
topicContentKey: infrastructure.core.network
slug: network-boundaries
title: "네트워크 경계와 접근 제어"
summary: "VPC·subnet·route와 resource-level security rule이 public/private traffic path를 어떻게 제한하는지 이해하고 ingress와 egress를 함께 설계한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.aws.amazon.com/vpc/latest/userguide/how-it-works.html"
    title: "Amazon VPC Documentation: How Amazon VPC works"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "VPC·subnet·route table과 internet connectivity의 AWS-specific 경계 확인"
  - url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html"
    title: "Amazon VPC Documentation: Security groups"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "resource-level inbound·outbound allow rules와 stateful security group 동작 확인"
  - url: "https://kubernetes.io/docs/concepts/services-networking/network-policies/"
    title: "Kubernetes Documentation: Network Policies"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "pod ingress·egress policy와 default-deny 경계 확인"
---
# 네트워크 경계와 접근 제어

애플리케이션이 internet에서 직접 도달 가능한지, load balancer를 통해서만 접근 가능한지, DB가 private 경로에만 있는지는 **실제 route와 security rule**이 결정합니다.

```text
Internet
   │ HTTPS
   ▼
Public Load Balancer
   │ application port
   ▼
Private application network
   │ DB port only
   ▼
Private Database
```

AWS에서는 VPC와 subnet, route table이 traffic이 갈 수 있는 경로를 만들고 Security Group이 resource 수준에서 허용할 inbound/outbound traffic을 제한합니다. Kubernetes NetworkPolicy는 다시 Pod 간 traffic을 제한하는 별도 계층입니다.

### Public/Private라는 이름보다 실제 경로를 본다

Subnet 이름에 `public`이 붙었다고 그 안의 모든 resource가 자동으로 internet에 공개되는 것은 아닙니다. Internet gateway로 향하는 route, resource address, security rule 등이 함께 맞아야 실제 ingress가 만들어집니다.

반대로 private subnet도 outbound 경로가 전혀 없다는 뜻은 아닙니다. NAT나 private endpoint 같은 별도 path를 통해 필요한 외부 dependency에 접근할 수 있습니다.

### Ingress뿐 아니라 egress도 경계다

외부에서 application으로 들어오는 port만 제한해도 application이 내부·외부 모든 목적지로 자유롭게 나갈 수 있다면 credential compromise나 SSRF 이후 피해 범위가 커질 수 있습니다.

```text
Ingress
client → app

Egress
app → DB / external API / DNS / observability
```

따라서 실제 workload에 필요한 source, destination, port와 route를 기준으로 양쪽 방향을 설계합니다.

Network security는 application authorization을 대신하지 않습니다. App server가 DB에 연결할 수 있다는 사실은 사용자가 다른 사람의 주문을 읽어도 된다는 뜻이 아닙니다. **Network reachability와 사용자·resource 권한은 서로 다른 방어 층**입니다.
