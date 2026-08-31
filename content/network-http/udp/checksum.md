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

UDP checksum은 header와 payload의 전송 중 오류를 검출하는 값이다. 검증에 실패한 datagram은 보통 폐기되지만, checksum이 맞는 datagram이 application에서 의미 있는 최신 상태라는 보장은 없다.

checksum은 authentication이나 integrity against an attacker를 제공하지 않는다. sequence·signature·encryption이 필요한 protocol은 UDP checksum만으로 충분하지 않다.

### Backend 연결

관측 데이터의 checksum 오류와 application validation 오류를 별도 metric으로 남긴다. 손상 탐지 뒤 재수집을 할지 drop할지 data criticality에 따라 결정한다.

