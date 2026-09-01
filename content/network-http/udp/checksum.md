---
kind: concept
contentKey: network-http.core.udp.checksum
topicContentKey: network-http.core.udp
slug: checksum
title: "UDP Checksum"
summary: "전송 오류 검출을 위한 checksum과 reliability의 차이를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc768"
    title: "User Datagram Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP datagram과 application reliability 경계를 확인한다."
    displayOrder: 1
---
# UDP Checksum

UDP checksum은 header·payload와 IP pseudo-header에 기반해 전송 중 bit corruption을 검출하는 값이다. 검증에 실패한 datagram은 transport에서 폐기될 수 있지만, checksum이 맞는 datagram이 도착했다거나 application이 기대한 최신 상태라는 보장은 아니다. IPv4에서는 checksum이 선택적으로 생략될 수 있는 반면 IPv6 UDP에서는 일반적으로 checksum이 요구되므로 address family와 protocol 규칙도 함께 본다.

checksum은 authentication이나 공격자가 만든 변경을 막는 cryptographic integrity를 제공하지 않는다. 또한 loss, duplicate, ordering과 retry를 다루지 않으므로 sequence·signature·encryption·application acknowledgement가 필요한 protocol은 UDP checksum만으로 충분하지 않다.

관측 data에서는 checksum 검증 실패, network-level drop과 application schema/semantic validation 실패를 별도 metric으로 남긴다. 손상 탐지 뒤 재수집할지 drop할지 data criticality에 따라 결정하고, checksum 통과를 canonical 저장의 business validity로 승격하지 않는다.

