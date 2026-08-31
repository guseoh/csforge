---
kind: concept
contentKey: network-http.core.ip-routing.private-public-ip
topicContentKey: network-http.core.ip-routing
slug: private-public-ip
title: "Private and Public IP"
summary: "private address와 public Internet route의 차이를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1918"
    title: "Address Allocation for Private Internets"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "private·public address와 NAT 경계를 확인한다."
    displayOrder: 1
---
# Private and Public IP

private IPv4 ranges는 조직 내부에서 재사용할 수 있지만 public Internet router가 일반적으로 직접 route하지 않는다. 외부 통신에는 NAT, proxy, VPN, public load balancer처럼 address boundary를 넘는 장치가 필요하다.

public IP가 있다고 application port가 외부에서 열리는 것은 아니다. firewall, security group, listener bind, route와 service health가 모두 맞아야 end-to-end 연결이 된다.

### Backend 연결

backend URL에 private database address를 넣을 때 실행 환경의 network reachability를 확인한다. public으로 노출하는 대신 private route와 least-privilege firewall을 우선한다.

