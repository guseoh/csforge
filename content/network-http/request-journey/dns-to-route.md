---
kind: concept
contentKey: network-http.core.request-journey.dns-to-route
topicContentKey: network-http.core.request-journey
slug: dns-to-route
title: "DNS 조회에서 라우팅까지"
summary: "호스트 이름이 IP 주소 후보로 해석되고, 선택한 목적지 주소가 로컬 라우팅 테이블의 출력 인터페이스와 다음 홉 결정으로 이어지는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc1122.html#section-3.3.1"
    title: "RFC 1122 §3.3.1: IP Routing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "호스트의 IP 라우팅 및 next-hop 선택 경계를 확인한다."
    displayOrder: 2
    relationNote: "DNS 조회 이후 IP 주소·라우팅·출력 인터페이스로 이어지는 별도 단계를 확인한다."
---
# DNS 조회에서 라우팅까지

URL의 호스트 이름은 실제 IP 주소와 같은 정보가 아닙니다. DNS는 이름을 A·AAAA 등의 주소 후보로 해석하며, 클라이언트는 주소 선택 정책과 연결 결과를 고려하여 사용할 목적지를 결정할 수 있습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "DNS 조회에서 라우팅까지",
  "description": "메시지 전달의 계층과 프로토콜 의미를 고정 예제로 비교합니다.",
  "example": "dns-to-route"
}
```

### 주소를 선택한 이후

목적지 IP를 정하면 운영체제는 라우팅 테이블에서 적절한 출력 인터페이스와 다음 홉을 선택합니다. 직접 연결된 경로라면 해당 이웃으로, 원격 경로라면 선택된 라우터로 전달합니다. 이더넷에서는 ARP 또는 NDP로 다음 홉의 링크 주소를 확인할 수 있습니다.

DNS가 정상적으로 203.0.113.10을 반환해도 일치하는 경로나 접근 정책이 없다면 연결은 실패할 수 있습니다. 반대로 경로가 정상이어도 DNS가 오래된 주소를 알려 주면 다른 서버에 연결을 시도할 수 있습니다.

이미 캐시된 DNS 결과나 재사용할 TCP·QUIC 연결이 있다면 매 HTTP 요청마다 새로 이름 해석과 연결 설정을 수행하지는 않습니다. 장애 분석에서는 실제 선택된 주소, 경로, 연결 재사용 여부를 분리해 관찰합니다.
