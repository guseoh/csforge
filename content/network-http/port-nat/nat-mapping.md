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

NAT mapping은 private source tuple과 public translated tuple을 기록해 응답 packet을 원래 내부 flow로 되돌린다. mapping에는 protocol과 idle timeout이 관여하며, TCP FIN/RST나 UDP inactivity가 수명을 바꾼다.

mapping이 사라진 뒤 늦게 도착한 packet은 폐기될 수 있고, 같은 public port를 재사용하면 오래된 packet과 충돌할 위험을 고려한다. NAT state는 durable application session이 아니므로 reconnect가 필요하다.

### Backend 연결

long polling과 WebSocket이 NAT idle timeout보다 오래 유지되면 heartbeat가 필요할 수 있다. heartbeat가 실제 business progress를 보장하지 않는다는 점도 별도 상태로 둔다.

