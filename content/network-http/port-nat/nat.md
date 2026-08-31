---
kind: concept
contentKey: network-http.core.port-nat.nat
topicContentKey: network-http.core.port-nat
slug: nat
title: "NAT"
summary: "private address와 public address 사이 packet address를 변환하는 NAT를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NAT mapping과 inbound reachability를 확인한다."
    displayOrder: 1
---
# NAT

NAT는 packet의 source 또는 destination address를 경계 장치에서 변환해 서로 다른 address space를 연결한다. outbound flow의 reply가 어느 내부 host로 돌아갈지 translation state를 유지해야 한다.

NAT는 security firewall과 동일하지 않으며, stateful mapping이 있어도 허용 정책과 port exposure는 별도다. address가 바뀌면 application이 observed source IP, callback URL, protocol checksum을 다르게 볼 수 있다.

### Backend 연결

API가 client IP를 감사 정보로 저장할 때 proxy·NAT header를 무조건 신뢰하지 않는다. trusted intermediary 범위와 원래 source를 검증하는 규칙을 둔다.

