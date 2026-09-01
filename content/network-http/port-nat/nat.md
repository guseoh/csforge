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

NAT는 경계 장치가 packet의 source 또는 destination address, 필요하면 port를 다른 address space에 맞게 바꾸는 기능이다. 예를 들어 내부 client가 외부로 packet을 보내면 장치는 내부 tuple과 translated tuple을 기록하고, 외부 response가 돌아올 때 그 state를 이용해 destination을 원래 내부 endpoint로 reverse translation한다. 목적지 NAT나 static mapping에서는 반대 방향의 destination 변환이 먼저 일어날 수 있다.

변환은 주소 숫자만 바꾸는 작업으로 끝나지 않는다. IP와 transport checksum을 다시 계산해야 하고, application payload 안에 address를 직접 넣는 protocol은 별도 ALG나 proxy 없이는 동작이 깨질 수 있다. NAT를 통과한 뒤 peer가 보는 source address는 원래 client interface와 다르므로 end-to-end address visibility와 callback·logging semantics도 달라진다.

NAT는 routing이나 security firewall과 동일하지 않다. mapping이 존재한다는 것은 reply를 어느 내부 endpoint로 보낼 수 있는지에 관한 state이지, 모든 traffic이 허용됐거나 application이 요청을 처리했다는 증명이 아니다. NAT 장비의 종류와 mapping policy에 따라 inbound, hairpin, peer-to-peer 동작이 달라질 수 있다.

Backend가 client IP를 감사 정보나 rate limit에 사용할 때는 proxy·NAT가 보이는 address와 원래 client identity를 구분한다. `X-Forwarded-For` 같은 header를 신뢰할 intermediary 범위를 먼저 정하고, 외부 client가 임의로 주입한 값을 원본 주소로 사용하지 않는다.

