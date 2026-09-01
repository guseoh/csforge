---
kind: concept
contentKey: infrastructure.core.network.network-boundaries
topicContentKey: infrastructure.core.network
slug: network-boundaries
title: "VPC·subnet·security boundary"
summary: "public/private network와 ingress/egress allow boundary를 인프라 관점에서 이해한다"
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
# VPC·subnet·security boundary

애플리케이션을 internet에서 직접 도달 가능한 network path에 두는 것과 private network 경계 뒤에 두는 것은 공격 표면과 운영 책임이 다릅니다. AWS에서는 VPC와 subnet route table이 traffic의 경로를 정하고, security group은 연결된 resource에 허용할 inbound/outbound traffic을 제한합니다. Kubernetes NetworkPolicy는 다시 Pod network 경계의 별도 정책입니다. 이들을 모두 같은 종류의 firewall이라고 뭉뚱그리지 않습니다.

```text
Internet
   │ HTTPS
   ▼
Internet-facing Load Balancer
   │ application port only
   ▼
Private application subnet
   ├─ private route ─▶ DB/private service
   └─ 필요한 경우 제한된 egress path ─▶ external dependency
```

AWS에서 subnet을 public/private로 구분할 때는 이름 자체보다 route table과 internet gateway 같은 실제 network path를 봐야 합니다. Internet gateway route가 있는 public subnet이라도 개별 resource가 실제로 internet과 통신하려면 address·routing·security policy 같은 추가 조건이 맞아야 합니다. 따라서 “subnet이 public이면 내부 모든 resource가 자동으로 공개된다”거나 “private subnet이면 모든 outbound가 자동으로 금지된다”고 설명하면 부정확합니다.

### ingress와 egress를 함께 본다

외부 request가 app에 들어오는 경로만 제한해도 app이 모든 내부·외부 목적지로 자유롭게 나갈 수 있으면 SSRF나 credential compromise 이후 blast radius가 커질 수 있습니다. 반대로 egress를 지나치게 막으면 DNS, 외부 API, package repository 같은 정상 dependency가 실패합니다. 현재 workload에 필요한 source·destination·port·protocol과 route를 명시적으로 둡니다.

AWS Security Group은 associated resource의 inbound와 outbound allow rule을 제어하는 stateful boundary입니다. Kubernetes NetworkPolicy는 CNI/network plugin 지원과 policy selection 규칙을 따르는 Pod-level boundary이므로 AWS Security Group과 같은 구현으로 간주하지 않습니다.

### network policy는 application authorization을 대체하지 않는다

network가 `app -> DB` 연결을 허용해도 tenant ownership이나 endpoint 권한을 결정하지는 않습니다. network isolation, service authentication, application authorization을 서로 다른 방어 층으로 둡니다.

### 문제를 풀 때 확인할 것

1. VPC/subnet route와 실제 public ingress path를 확인합니다.
2. resource-level security group과 Pod-level NetworkPolicy의 책임을 구분합니다.
3. ingress뿐 아니라 필요한 egress destination과 route를 봅니다.
4. network reachability와 application authorization을 혼동하지 않습니다.
5. default-deny 뒤 필요한 DNS·health·observability 경로와 rollback 절차를 확인합니다.

### 면접에서 설명한다면

VPC와 subnet/route table은 network 경로를 만들고, AWS Security Group은 resource 수준의 stateful inbound/outbound allow boundary를 만듭니다. Kubernetes NetworkPolicy는 Pod network에서 별도의 경계를 제공합니다. public/private라는 이름만 믿지 않고 실제 route·address·security policy를 확인하며, ingress와 egress를 최소화하되 network reachability를 resource ownership 같은 application authorization으로 오해하지 않습니다.

