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
  - url: "https://kubernetes.io/docs/concepts/services-networking/network-policies/"
    title: "Kubernetes Documentation: Network Policies"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "pod ingress·egress policy와 default deny 개념 확인"
  - url: "https://csrc.nist.gov/pubs/sp/800/145/final"
    title: "NIST SP 800-145: Cloud Computing Definition"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "shared network resource와 cloud deployment context 확인"
---
# VPC·subnet·security boundary

애플리케이션을 public network에 두는 것과 private network에서 outbound만 허용하는 것은 공격 표면과 운영 경계가 다릅니다. VPC·subnet·security group·network policy는 누가 어느 방향으로 연결할 수 있는지를 infrastructure에서 제한합니다.

```text
Internet
   │ ingress 443
   ▼
Load Balancer / public subnet
   │ service port only
   ▼
Private application subnet ── egress ─▶ DB/private service
```

### ingress와 egress를 함께 본다

외부 request가 app에 들어오는 경로만 막아도 app이 모든 내부 목적지로 나갈 수 있으면 SSRF와 credential theft의 blast radius가 큽니다. 반대로 egress를 지나치게 막으면 DNS, package update, 외부 API 같은 정상 dependency가 실패합니다. 필요한 source·destination·port·protocol을 명시합니다.

### network policy는 application authorization을 대체하지 않는다

network가 `app -> DB` 연결을 허용해도 tenant ownership이나 endpoint 권한을 결정하지는 않습니다. network isolation, service authentication, application authorization을 서로 다른 방어 층으로 둡니다.

### 문제를 풀 때 확인할 것

1. public ingress와 private east-west traffic을 구분합니다.
2. ingress뿐 아니라 egress destination을 allowlist로 봅니다.
3. network reachability와 application authorization을 혼동하지 않습니다.
4. default deny 뒤 필요한 DNS·health·observability 경로를 확인합니다.
5. 정책 변경을 review·audit·rollback 가능하게 둡니다.

### 면접에서 설명한다면

VPC·subnet·security policy는 network reachability의 경계를 만듭니다. public ingress를 필요한 곳에만 열고 private app/DB는 최소 경로를 허용하며 egress도 제한해야 SSRF와 침해 blast radius를 줄일 수 있습니다. 다만 network allow는 resource ownership 같은 application authorization을 대신하지 않습니다.

