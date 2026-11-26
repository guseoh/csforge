---
kind: concept
contentKey: network-http.core.dns.iterative-resolution
topicContentKey: network-http.core.dns
slug: iterative-resolution
title: "반복 조회 과정"
summary: "재귀 리졸버가 상위 DNS 서버의 위임 정보를 따라 더 구체적인 권한 서버로 이동해 최종 응답을 찾는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 반복 조회 과정

애플리케이션은 일반적으로 재귀 리졸버에 이름 해석을 요청합니다. 재귀 리졸버가 유효한 답을 캐시하고 있지 않으면 여러 DNS 서버에 질의하여 최종 응답을 찾습니다. 이 과정에서 서버가 최종 답 대신 다음 권한 서버를 알려 주는 referral을 반환하고 리졸버가 다음 질의를 보내는 동작을 반복 조회라고 부릅니다.

```csforge-viz
{
  "version": 1,
  "type": "network-core",
  "title": "재귀 리졸버의 DNS 반복 조회",
  "description": "캐시 적중 시 곧바로 응답하고, 캐시 미스 시 루트·TLD·권한 서버의 위임 정보를 따라 A 레코드를 조회하는 고정 예시입니다.",
  "example": "dns-iterative"
}
```

### 캐시가 비어 있는 경우

www.example.com의 A 레코드를 찾는 단순한 예에서는 루트에서 com의 위임 정보를 받고, com의 권한 서버에서 example.com의 위임 정보를 얻은 뒤, example.com 권한 서버로부터 실제 응답을 받습니다. 위임 정보에 주소(glue)가 포함될 수 있으며 그렇지 않다면 권한 서버의 주소를 추가로 해석해야 할 수도 있습니다.

루트 서버가 최종 호스트 주소를 직접 알려 준다고 이해하면 안 됩니다.

### 모든 조회가 같은 횟수로 발생하지 않습니다

유효한 최종 응답이 캐시되어 있으면 상위 질의가 필요하지 않습니다. 위임 정보만 캐시되어 있다면 루트 또는 TLD 단계부터 다시 시작하지 않아도 됩니다. CNAME 응답이 나오면 대상 이름에 대한 추가 해석이 필요할 수 있습니다.

현실에서는 QNAME minimization, 포워딩, 병렬 질의, DNSSEC 검증 등의 정책도 영향을 줍니다. 위 도식은 기본적인 위임 관계를 설명하는 예이지 모든 리졸버가 동일한 패킷 순서를 보낸다는 보장이 아닙니다.
