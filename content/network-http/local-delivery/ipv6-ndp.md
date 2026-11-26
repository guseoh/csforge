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

Neighbor Discovery Protocol은 ICMPv6 기반으로 로컬 링크의 이웃 주소 해석, 라우터 발견, 접두사 정보 및 이웃 도달 가능성 확인 등을 수행합니다. IPv4 ARP의 주소 해석 역할보다 넓은 범위를 담당합니다.

### 이웃 주소 해석과 도달 가능성

NS(Neighbor Solicitation)는 이웃의 링크 주소를 확인하거나 도달 가능성을 검사하는 데 사용합니다. NA(Neighbor Advertisement)는 주소나 이웃 상태 정보를 알려 줍니다. 초기 주소 해석에서는 일반적으로 대상에 해당하는 solicited-node 멀티캐스트를 사용하며 모든 NS가 멀티캐스트인 것은 아닙니다.

### 라우터 발견

RS(Router Solicitation)는 라우터 광고를 요청하고 RA(Router Advertisement)는 기본 라우터 수명, 접두사 및 기타 링크 설정 정보를 전달할 수 있습니다. IPv6 주소 구성 및 기본 경로 선택에 관련되지만 모든 설정을 RA 하나가 결정하는 것은 아닙니다.

DAD(Duplicate Address Detection)는 인터페이스에 주소를 할당하는 과정에서 중복 가능성을 검사합니다. 이때도 이웃 탐색 메시지를 사용합니다.

### 운영과 신뢰 경계

위조된 RA나 NA는 링크의 경로 및 이웃 상태에 영향을 줄 수 있습니다. RA Guard 등 별도 보호 정책을 검토할 수 있지만 NDP 자체가 애플리케이션 인증을 제공하는 것은 아닙니다. 장애 분석에서는 ICMPv6를 일괄 차단하면 필요한 주소 해석과 경로 정보까지 영향을 받을 수 있다는 점을 고려합니다.
