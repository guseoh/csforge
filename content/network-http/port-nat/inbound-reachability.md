---
kind: concept
contentKey: network-http.core.port-nat.inbound-reachability
topicContentKey: network-http.core.port-nat
slug: inbound-reachability
title: "Inbound Reachability"
summary: "NAT 뒤 host가 외부에서 직접 도달되지 않는 이유와 예외를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NAT mapping과 inbound reachability를 확인한다."
    displayOrder: 1
---
# Inbound Reachability

NAT 뒤 내부 host는 외부 packet이 사용할 내부 address와 port를 알 수 없으므로 기존 outbound mapping 없이 직접 도달하기 어렵다. static port forwarding, reverse proxy, tunnel, rendezvous protocol이 이 경계를 명시적으로 연다.

port forwarding은 mapping을 만들 뿐 firewall policy, application listener, TLS hostname 문제를 해결하지 않는다. NAT 종류와 simultaneous mapping 규칙에 따라 peer-to-peer traversal 결과도 달라진다.

### Backend 연결

개발 로컬 서비스 webhook은 localhost나 private IP로 외부에 노출되지 않는다. public ingress나 tunnel을 쓸 때 인증·replay·source validation을 함께 적용한다.

