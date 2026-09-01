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

private IPv4 ranges는 조직 내부에서 여러 곳이 재사용할 수 있도록 지정된 address space이며 public Internet에서 globally routable한 endpoint로 취급되지 않는다. 그래서 private host가 Internet service에 나갈 때는 NAT/PAT로 source address와 port를 public mapping으로 바꾸거나, proxy·VPN처럼 다른 routing boundary를 사용한다. 이 변환은 packet reachability를 만드는 기능이지 application authorization을 대신하지 않는다.

public IP가 있다고 application port가 외부에서 열리는 것도 아니다. inbound packet이 route를 따라 도착하려면 listener bind, firewall/security group, NAT mapping 또는 load balancer rule과 service health가 모두 맞아야 하며, response의 return path도 필요하다. 반대로 private network 안에서는 NAT 없이도 직접 route할 수 있으므로 `private = 항상 연결 불가`로 일반화하지 않는다.

private address를 Internet DNS에 등록해도 외부 client가 그 address를 route할 수 있게 되지는 않는다. 보통 public load balancer/reverse proxy를 공개 경계로 두고 backend는 private route로 유지하며, 어느 client가 실제로 private network에 들어와 있는지와 DNS view를 환경별로 구분한다.

Backend URL에 private database address를 넣을 때는 실행 environment의 route·NAT·security policy를 확인한다. public으로 노출해 문제를 숨기기보다 필요한 private path와 least-privilege rule을 명시한다.

