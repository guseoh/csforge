---
kind: concept
contentKey: network-http.core.ip-routing.ipv6-basics
topicContentKey: network-http.core.ip-routing
slug: ipv6-basics
title: "IPv6 주소와 전달 기초"
summary: "IPv6의 128비트 주소, 주소 범위(scope), NDP 기반 이웃 탐색과 송신 측 단편화 경계를 IPv4와 비교해 설명한다."
level: 1
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8200"
    title: "Internet Protocol, Version 6 (IPv6) Specification"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv6 기본 헤더, 128비트 주소와 라우터가 중간 단편화를 수행하지 않는 전달 규칙을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc8201"
    title: "Path MTU Discovery for IP version 6"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv6 경로 MTU 탐색과 ICMPv6 Packet Too Big을 이용한 송신 측 패킷 크기 조정 규칙을 확인한다."
    displayOrder: 2
    relationNote: "IPv6 라우터가 전달 중 패킷을 단편화하지 않으므로 송신 측이 경로 MTU를 반영해야 하는 경계를 보충한다."
---
# IPv6 주소와 전달 기초

IPv6는 128비트 주소를 사용합니다. 콜론으로 구분된 16진수 그룹에서 선행 0을 생략하고 연속된 0 그룹을 한 번 ::로 줄여 표현할 수 있습니다.

```text
2001:0db8:0000:0000:0000:0000:0000:0010
2001:db8::10
```

두 표기는 같은 주소입니다. IPv6 인터페이스에는 링크 로컬 주소와 전역 유니캐스트 주소 등 범위가 다른 주소가 함께 설정될 수 있습니다. 목적지에 따른 출발지 주소 선택 규칙을 고려해야 하며 인터페이스 하나에 주소 하나만 있다고 가정하지 않습니다.

### 로컬 전달과 단편화

IPv6는 ARP 대신 ICMPv6 Neighbor Discovery를 사용합니다. 중간 라우터는 패킷을 단편화하지 않습니다. 다음 링크 MTU보다 큰 패킷을 전달할 수 없다면 ICMPv6 Packet Too Big을 보내고 송신 측은 크기를 조정하거나 필요한 경우 Fragment 확장 헤더로 단편화합니다.

### 이중 스택 서비스 운영

AAAA 레코드가 존재하고 IPv6 주소가 설정되어도 IPv6 라우팅, 방화벽, 이웃 탐색 및 리스너가 정상이어야 접속할 수 있습니다. IPv4 접속 성공을 IPv6의 성공 근거로 사용하지 않습니다. 두 주소 패밀리의 실제 연결 결과를 따로 확인합니다.
