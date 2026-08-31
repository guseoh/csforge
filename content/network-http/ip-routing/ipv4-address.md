---
kind: concept
contentKey: network-http.core.ip-routing.ipv4-address
topicContentKey: network-http.core.ip-routing
slug: ipv4-address
title: "IPv4 Address"
summary: "IPv4 address가 interface와 network 위치를 식별하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc791"
    title: "Internet Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IP address와 packet forwarding의 기본을 확인한다."
    displayOrder: 1
---
# IPv4 Address

IPv4 address는 32-bit 값으로 interface의 network 위치와 host 부분을 prefix와 함께 표현한다. address 자체만으로 local인지 판단할 수 없고, interface prefix와 routing table을 같이 봐야 한다.

private address는 public Internet에서 직접 globally routable하지 않아 NAT나 tunnel 같은 경계를 필요로 한다. 같은 숫자라도 서로 다른 network namespace나 subnet에서는 다른 reachability를 가질 수 있다.

### Backend 연결

server bind address `0.0.0.0`, loopback, container IP, public load balancer IP는 서로 다른 수신 범위다. “localhost에서 된다”는 외부 client reachability 증거가 아니다.

