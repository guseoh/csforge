---
kind: concept
contentKey: network-http.core.port-nat.pat
topicContentKey: network-http.core.port-nat
slug: pat
title: "PAT"
summary: "여러 내부 host가 source port 변환으로 하나의 public IP를 공유하는 PAT를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NAT mapping과 inbound reachability를 확인한다."
    displayOrder: 1
---
# PAT

PAT(Port Address Translation)는 source port까지 변환해 여러 내부 endpoint가 하나의 public IP를 동시에 공유하게 한다. 예를 들어 서로 다른 private source tuple을 같은 public address의 서로 다른 translated source port로 매핑하고, response의 destination port를 통해 각 내부 flow를 구분한다. 이 구분은 TCP와 UDP별로 유지되며 같은 숫자의 port라도 protocol이 다르면 별도 namespace다.

동시에 사용할 수 있는 public address·port 조합과 gateway의 state table에는 한계가 있다. 내부 client가 ephemeral port를 많이 만들거나 connection이 짧게 반복되면 translated port allocation과 TIME_WAIT·idle state가 병목이 될 수 있다. mapping이 idle timeout으로 사라지면 다음 packet이 기존 application session을 되살린다는 보장도 없다.

PAT는 외부에서 시작한 connection의 목적지를 자동으로 정하지 않는다. 기존 outbound mapping, static port forwarding, reverse proxy 또는 tunnel처럼 inbound flow를 특정 내부 endpoint에 연결하는 별도 규칙이 필요하다. 따라서 public IP 하나가 있다는 사실만으로 내부 service가 외부에서 도달 가능해지지 않는다.

Backend의 대량 outbound HTTP client에서는 NAT port exhaustion이 connect timeout이나 간헐적 새 connection 실패로 나타날 수 있다. connection reuse와 pool lifetime을 조정하면서 NAT gateway의 public address 수, translated-port 사용량, idle timeout을 함께 측정한다.

