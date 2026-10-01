---
kind: concept
contentKey: network-http.core.local-delivery.ipv6-ndp
topicContentKey: network-http.core.local-delivery
slug: ipv6-ndp
title: "IPv6 이웃 탐색(NDP)"
summary: "IPv6에서 이웃의 링크 계층 주소, 기본 라우터와 접두사(prefix), 이웃 도달 가능성을 파악하는 이웃 탐색(Neighbor Discovery)의 역할을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc4861"
    title: "Neighbor Discovery for IP version 6"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv6 Neighbor Solicitation/Advertisement와 Router Solicitation/Advertisement의 역할을 확인한다."
    displayOrder: 1
---
# IPv6 이웃 탐색(NDP)

IPv6 이웃 탐색 프로토콜(Neighbor Discovery Protocol, NDP)은 같은 로컬 링크에서 **이웃의 링크 계층 주소를 찾고, 기본 라우터와 네트워크 접두사 정보를 발견하며, 이웃이 도달 가능한지 확인하는 데 사용하는 ICMPv6 기반 프로토콜**이다. IPv4의 ARP가 담당하던 주소 해석 기능을 포함하지만 그보다 범위가 넓다.

### 이웃 요청(Neighbor Solicitation, NS)과 이웃 광고(Neighbor Advertisement, NA)

호스트는 NS로 특정 IPv6 이웃의 링크 계층 주소를 알아내거나 이웃 상태를 확인할 수 있다. NA는 이웃의 주소 정보나 상태를 알리는 데 사용된다.

IPv4 ARP가 이더넷 브로드캐스트를 사용하는 것과 달리 IPv6 NDP는 ICMPv6와 멀티캐스트를 사용한다.

```text
호스트 A ── NS ──> 이웃 탐색 대상
호스트 A <─ NA ─── 이웃 탐색 대상
```

### 라우터 광고(Router Advertisement, RA)는 로컬 IPv6 네트워크 정보를 알려 준다

호스트는 라우터 요청(Router Solicitation, RS)으로 라우터 광고를 요청할 수 있고, 라우터는 RA로 기본 라우터 정보와 네트워크 접두사 정보를 제공할 수 있다. 이 정보는 호스트가 로컬 IPv6 네트워크에서 주소와 기본 경로를 구성하는 데 사용된다.

```text
호스트 ── RS ──> 라우터
호스트 <─ RA ─── 라우터
```

### 중복 주소 감지(Duplicate Address Detection, DAD)는 IPv6 주소의 중복 여부를 확인한다

IPv6에서는 주소를 인터페이스에 사용하기 전에 같은 링크에서 이미 같은 주소가 쓰이고 있는지 확인하는 DAD에도 이웃 탐색 메시지가 사용된다.

### NDP 정보도 신뢰 경계를 고려해야 한다

NDP 메시지는 로컬 네트워크의 다음 홉·라우터 정보에 영향을 줄 수 있으므로 위조된 NA나 RA는 통신 경로를 바꿀 수 있다. 따라서 운영 환경에서는 스위치·라우터가 제공하는 RA Guard 같은 보호 기능이나 네트워크 접근 통제를 별도로 검토할 수 있다.

이 보안 장치는 NDP의 기본 기능 자체와는 별개다. 핵심은 먼저 **NDP가 IPv6 로컬 링크에서 주소 해석뿐 아니라 라우터·prefix 발견과 이웃 상태 확인까지 담당한다는 것**을 이해하는 것이다.
