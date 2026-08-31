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

A record는 hostname을 IPv4 address로, AAAA record는 IPv6 address로 매핑한다. 하나의 name에 여러 record가 있으면 client와 resolver가 address family와 순서를 선택하므로 application은 첫 address 하나만 영원히 정답이라고 가정하지 않는다.

IPv6 address가 DNS에 있다는 것은 NDP, route, firewall과 서비스 bind가 준비됐다는 뜻이 아니다. Happy Eyeballs 같은 client 정책은 두 family의 연결 latency와 실패를 함께 고려한다.

### Backend 연결

Spring HTTP client의 A/AAAA 선택과 connection pool을 실제 환경에서 테스트한다. backend가 IPv4 loopback에만 bind된 상태에서 AAAA를 추가하면 부분 장애가 생길 수 있다.

