---
kind: concept
contentKey: network-http.core.ip-routing.ttl-hop-limit
topicContentKey: network-http.core.ip-routing
slug: ttl-hop-limit
title: "TTL과 Hop Limit"
summary: "IPv4의 패킷 수명 제한 필드(TTL)와 IPv6의 홉 수 제한 필드(Hop Limit)가 라우터를 지날 때 줄어 잘못된 라우팅 루프의 패킷을 끝내는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc791"
    title: "Internet Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv4 주소, 헤더와 패킷 전달의 기본 규칙을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc8200.html#section-3"
    title: "RFC 8200 §3: IPv6 Hop Limit"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv6 Hop Limit 감소·폐기 조건과 IPv4 TTL의 차이를 확인한다."
    displayOrder: 2
---
# TTL과 Hop Limit

라우팅 루프가 발생하면 동일한 패킷이 여러 라우터 사이를 반복할 수 있습니다. IPv4 TTL과 IPv6 Hop Limit은 이런 패킷이 무한히 전달되지 않도록 수명을 제한하는 필드입니다.

```text
초기 값 3
라우터 1 → 2
라우터 2 → 1
라우터 3 → 만료, 폐기
```

IPv4 TTL에는 역사적으로 시간의 의미도 있지만 라우터가 최소 1씩 감소시키므로 일반적인 전달에서는 홉 제한처럼 관찰됩니다. IPv6는 Hop Limit을 사용합니다.

### 경로 진단

만료된 패킷에 대해 라우터는 적용 조건에 따라 ICMP Time Exceeded를 반환합니다. traceroute는 작은 TTL 또는 Hop Limit부터 증가시키는 탐색으로 중간 홉을 추정합니다.

ICMP 필터링이나 응답률 제한, ECMP, 반환 경로 차이 때문에 모든 홉이 표시되는 것은 아닙니다. TTL은 라우팅 루프 자체를 해결하는 것이 아니라 개별 패킷의 전달 수명을 제한합니다.
