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

PAT는 source port까지 변환해 여러 private host의 outbound connection을 하나의 public IP에서 구분한다. translation table은 내부 tuple과 public tuple, protocol, timeout을 연결한다.

ephemeral port와 mapping capacity가 한계가 되며, idle timeout 뒤 connection이 끊길 수 있다. inbound connection은 기존 mapping이 없으면 목적지를 알 수 없어 별도 port forwarding이나 reverse connection이 필요하다.

### Backend 연결

대량 outbound HTTP client에서 public NAT port exhaustion이 connection timeout으로 나타날 수 있다. connection reuse, pool size, NAT idle timeout을 함께 조정한다.

