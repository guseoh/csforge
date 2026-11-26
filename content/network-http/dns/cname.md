---
kind: concept
contentKey: network-http.core.dns.cname
topicContentKey: network-http.core.dns
slug: cname
title: "CNAME 레코드"
summary: "한 DNS 이름을 다른 정식 이름의 별칭으로 연결하고, 최종 주소를 얻기 위해 추가 조회가 이어질 수 있는 과정을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# CNAME 레코드

서비스의 공개 이름을 유지하면서 실제 연결 대상을 별도 이름으로 관리하고 싶을 때 CNAME을 활용할 수 있습니다. CNAME은 하나의 DNS 이름을 다른 이름의 **별칭(alias)**으로 연결합니다. 주소를 직접 저장하는 A·AAAA와 달리 대상 이름을 해석해야 실제 주소를 얻을 수 있습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "CNAME 레코드",
  "description": "개념의 기술적 관계와 상태를 검증된 고정 예제로 보여줍니다.",
  "example": "cname"
}
```

```text
service.example. CNAME edge.example.
edge.example.    A     192.0.2.20
```

위 예에서 주소 조회는 service.example에서 edge.example로 이어집니다. 이미 대상 주소가 캐시되어 있거나 응답에 함께 포함되면 추가 네트워크 질의가 필요하지 않을 수도 있습니다.

### 별칭이 바꾸지 않는 것

CNAME은 DNS에서 이름을 해석하는 관계입니다. HTTP 리다이렉트가 아니므로 원래 URL이나 HTTP authority를 바꾸지 않으며 TLS 인증도 원래 요청한 이름을 기준으로 확인해야 합니다.

CNAME이 다시 다른 CNAME을 가리키면 여러 단계의 해석이 필요할 수 있습니다. 너무 긴 체인과 순환 참조는 조회 지연이나 실패 원인이 됩니다.

### 같은 이름에 다른 레코드를 둘 때의 제약

일반 DNS 데이터에서 CNAME이 있는 이름에는 다른 레코드 유형을 함께 둘 수 없습니다. DNSSEC 관련 메타데이터 등은 별도의 규칙이 적용됩니다. zone apex에는 SOA와 NS가 필요하므로 일반적인 CNAME을 그대로 구성할 수 없습니다. DNS 사업자가 제공하는 별도 alias/flattening 기능을 표준 CNAME과 혼동하지 않아야 합니다.
