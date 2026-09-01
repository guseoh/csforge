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

IPv4 address는 32-bit 값으로 interface가 어느 IP network에 속하고 packet의 source/destination이 무엇인지 표현한다. address만 읽어서는 local delivery 여부를 결정할 수 없고, interface에 설정된 prefix/mask와 routing table을 함께 비교해야 한다. 같은 address 숫자라도 서로 다른 network namespace, interface 또는 overlapping subnet에 놓이면 실제 reachability와 next hop이 달라질 수 있다.

packet을 보낼 때 source address는 송신 interface와 return path에 영향을 주고 destination address는 route lookup의 입력이 된다. route가 선택된 뒤에는 현재 link의 next hop을 MAC으로 resolve해 frame을 만들므로 IPv4 address와 MAC address의 scope를 혼동하지 않는다. `0.0.0.0`은 일반적인 server bind에서 local interfaces 전체를 뜻할 수 있지만 remote destination으로 직접 연결할 address라는 뜻은 아니다.

private IPv4 range는 여러 조직이 내부에서 재사용할 수 있도록 지정된 주소 공간이라 public Internet router가 일반적으로 직접 route하지 않는다. 외부와 통신하려면 NAT, reverse proxy, VPN 같은 명시적인 boundary가 필요하고, public address가 있어도 firewall·listener·route가 없으면 연결되지 않는다.

Backend에서 `0.0.0.0`, loopback, container IP, public load balancer IP는 서로 다른 수신 범위다. “localhost에서 된다”는 외부 client reachability의 증거가 아니므로 bind address, namespace와 실제 packet source를 함께 확인한다.

