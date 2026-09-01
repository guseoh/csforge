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

일반적인 outbound NAT는 내부 host가 먼저 만든 flow의 response를 되돌리는 데 필요한 mapping을 생성한다. 외부 peer가 먼저 packet을 보내면 장비가 어느 내부 address·port로 전달할지 알 수 없으므로, 기존 mapping이 없는 unsolicited inbound connection은 보통 내부 host까지 도달하지 않는다. 이것은 “NAT가 모든 inbound를 차단한다”는 protocol 정의가 아니라 mapping과 장비 policy의 결과다.

static port forwarding이나 destination NAT는 public address·port를 특정 내부 address·port로 고정 변환한다. 그래도 inbound packet은 firewall allow rule, 내부 route, 실제 listener, TLS SNI/hostname과 application authentication을 모두 통과해야 한다. 외부에서 내부 public address를 다시 호출하는 hairpin 경로는 장비가 지원하는지 별도로 확인한다.

NAT traversal에서는 peer가 먼저 outbound mapping을 만들거나, rendezvous/ICE 계열 절차를 사용하거나, reverse connection·tunnel·public reverse proxy를 둔다. NAT 종류와 simultaneous mapping 규칙에 따라 어떤 peer-to-peer 조합이 가능한지가 달라지며, 공인 IP를 DNS에 등록하는 것만으로는 이 state를 만들지 못한다.

개발 로컬 서비스의 webhook은 `localhost`나 private IP로 외부에 노출되지 않는다. public ingress나 tunnel을 사용할 때는 translation을 도달성의 한 단계로만 보고 인증, replay 방지, source validation과 listener 범위를 함께 설계한다.

