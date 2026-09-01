---
kind: concept
contentKey: network-http.core.dns.a-aaaa
topicContentKey: network-http.core.dns
slug: a-aaaa
title: "A and AAAA"
summary: "A와 AAAA record가 IPv4·IPv6 address를 제공하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3596"
    title: "DNS Extensions to Support IP Version 6"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "A/AAAA와 address family 선택을 확인한다."
    displayOrder: 1
---
# A and AAAA

A record는 owner name에 IPv4 address를, AAAA record는 IPv6 address를 연결한다. 하나의 name에 여러 A/AAAA RR이 있으면 resolver는 결과 집합과 TTL을 전달할 뿐 최종 connection 순서를 애플리케이션 대신 항상 결정하지는 않는다. client library의 address-family policy, racing과 실패 처리에 따라 실제 시도 순서가 달라질 수 있다.

AAAA가 존재한다는 것은 그 IPv6 address가 DNS에 게시됐다는 뜻이지, interface의 NDP·route·firewall·listener·Path MTU가 준비됐다는 뜻이 아니다. 반대로 A가 있다고 IPv4 path가 정상이라는 보장도 없다. Happy Eyeballs와 같은 client 정책은 두 family의 connection latency와 실패를 비교해 하나를 선택할 수 있으므로 DNS answer order와 실제 connect order를 혼동하지 않는다.

Backend에서 dual-stack을 활성화할 때는 A/AAAA answer, service bind, connection pool의 address-family별 state를 함께 테스트한다. IPv4 loopback에만 bind된 service에 AAAA를 추가하면 일부 client가 IPv6를 먼저 시도하는 부분 장애가 생길 수 있고, DNS health가 application health를 대신하지 않는다.

