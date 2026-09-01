---
kind: concept
contentKey: network-http.core.port-nat.nat-mapping
topicContentKey: network-http.core.port-nat
slug: nat-mapping
title: "NAT Mapping"
summary: "내부·외부 tuple과 timeout을 연결하는 translation state를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NAT mapping과 inbound reachability를 확인한다."
    displayOrder: 1
---
# NAT Mapping

stateful NAT mapping은 내부 source tuple, translated public tuple, transport protocol과 timeout을 연결하는 per-flow state다. 첫 outbound packet이 mapping을 만들면 이후 response는 translated destination을 내부 endpoint로 reverse translation하고, 장비는 packet activity와 TCP FIN/RST 같은 신호에 따라 state를 갱신하거나 종료한다. UDP에는 TCP handshake나 FIN이 없으므로 inactivity timeout의 역할이 특히 크다.

mapping이 사라진 뒤 늦게 도착한 response는 대응할 내부 endpoint를 찾지 못해 폐기될 수 있다. public port를 재사용한 새 flow가 생겨도 장비가 옛 packet을 안전하게 application session으로 복원해 주는 것은 아니므로 sequence/state validation과 reconnect가 필요하다. NAT table의 수명은 DB transaction이나 durable login/session의 수명과 다른 네트워크 자원 state다.

failover 장비가 mapping state를 공유하지 않으면 기존 connection의 response가 새 장비에서 번역되지 않아 timeout이 발생할 수 있다. state replication이 있더라도 replication 지연·timeout·active/standby 전환을 별도 failure mode로 본다.

Backend의 long polling과 WebSocket이 NAT idle timeout보다 오래 유지되면 protocol-level heartbeat나 주기적인 traffic이 mapping을 유지하는 데 도움이 될 수 있다. 그러나 heartbeat는 network path가 살아 있음을 확인할 뿐 business progress나 peer application의 commit을 보장하지 않는다.

