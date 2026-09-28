---
kind: concept
contentKey: network-http.core.ip-routing.ipv6-basics
topicContentKey: network-http.core.ip-routing
slug: ipv6-basics
title: "IPv6 주소와 전달 기초"
summary: "IPv6의 128비트 주소, 주소 scope, NDP 기반 이웃 탐색과 송신 측 단편화 경계를 IPv4와 비교해 설명한다."
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

IPv6는 **128비트 주소**를 사용한다. IPv4의 32비트보다 훨씬 큰 주소 공간을 제공하며, 16진수 그룹을 콜론(`:`)으로 구분해 표기한다. 연속된 0 그룹은 한 번 `::`로 줄여 쓸 수 있다.

```text
2001:0db8:0000:0000:0000:0000:0000:0010
2001:db8::10
```

두 표기는 같은 IPv6 주소를 나타낸다.

### 하나의 인터페이스에 범위가 다른 IPv6 주소가 함께 있을 수 있다

IPv6 인터페이스는 link-local 주소와 global unicast 주소 등 서로 다른 범위의 주소를 동시에 가질 수 있다. 실제 패킷의 출발지 주소는 목적지와 운영체제의 source-address selection 규칙에 따라 달라질 수 있다.

따라서 `인터페이스 하나 = IPv6 주소 하나`라고 생각하면 안 되고, 주소의 **값뿐 아니라 scope와 prefix**도 함께 봐야 한다.

### IPv6는 ARP 대신 Neighbor Discovery를 사용한다

IPv6의 로컬 전달에서는 ICMPv6 기반 Neighbor Discovery Protocol(NDP)이 이웃의 링크 계층 주소와 기본 라우터·prefix 정보를 알아내는 데 사용된다. IPv4 ARP처럼 이더넷 브로드캐스트에 의존하지 않고 멀티캐스트를 활용한다.

### 중간 라우터는 IPv6 패킷을 단편화하지 않는다

IPv4에서는 조건에 따라 중간 라우터가 패킷을 단편화할 수 있지만 IPv6 라우터는 전달 중 패킷을 단편화하지 않는다. 다음 링크의 MTU보다 큰 패킷을 전달할 수 없으면 ICMPv6 `Packet Too Big`을 보내 송신 측이 더 작은 크기로 조정할 수 있게 한다.

송신 측이 필요하면 Fragment 확장 헤더를 사용해 단편화를 수행할 수 있지만, 경로 MTU에 맞는 패킷을 보내는 것이 기본적인 전달 관점에서 중요하다.

### IPv6라고 서비스 도달성이 자동으로 좋아지는 것은 아니다

AAAA 레코드가 있고 IPv6 주소가 설정돼 있어도 실제 경로, 방화벽, NDP, 서버 리스너, TLS가 모두 정상이어야 서비스 연결이 성공한다. 이중 스택 환경에서는 IPv4가 성공하고 IPv6만 실패하는 장애도 가능하므로 두 주소 패밀리를 별도로 관찰해야 한다.

핵심은 **IPv6가 128비트 주소와 prefix 기반 라우팅을 사용하고, 로컬 이웃 탐색은 NDP로, 경로 MTU 문제는 송신 측 중심으로 처리한다는 점**이다.
