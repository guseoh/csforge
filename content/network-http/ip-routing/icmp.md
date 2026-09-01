---
kind: concept
contentKey: network-http.core.ip-routing.icmp
topicContentKey: network-http.core.ip-routing
slug: icmp
title: "ICMP"
summary: "IP control·error message가 reachability와 diagnostic을 지원하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc792"
    title: "Internet Control Message Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IP control message와 reachability 진단을 확인한다."
    displayOrder: 1
---
# ICMP

ICMP는 IP 자체의 forwarding과 관련된 error·control message를 전달하는 network-layer protocol이다. destination unreachable, time exceeded, parameter 문제와 echo request/reply 같은 진단 기능을 제공하지만, application payload를 ordered reliable byte stream으로 운반하거나 TCP connection을 대신하지 않는다. ICMP error가 원래 packet의 source에 전달되면 송신 host가 route·MTU·reachability 문제를 더 빨리 알 수 있다.

ICMP를 차단해도 모든 IP forwarding이 즉시 실패하는 것은 아니다. 그러나 IPv4/IPv6 Path MTU Discovery에 필요한 feedback이나 unreachable/time-exceeded 진단이 사라져 큰 packet만 통과하지 않는 black hole을 만들 수 있다. echo reply가 없다는 사실만으로 host down, TCP port closed, HTTP service unhealthy를 서로 구분할 수 없다.

connect timeout을 조사할 때 ICMP error, TCP SYN/SYN-ACK, TLS handshake와 HTTP response를 별도 단계로 본다. 운영 firewall은 ICMP를 전부 허용하거나 전부 차단하는 대신 protocol이 요구하는 type/code와 rate limit, 보안 정책을 함께 검토한다.

