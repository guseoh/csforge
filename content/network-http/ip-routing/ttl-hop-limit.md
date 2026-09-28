---
kind: concept
contentKey: network-http.core.ip-routing.ttl-hop-limit
topicContentKey: network-http.core.ip-routing
slug: ttl-hop-limit
title: "TTL과 Hop Limit"
summary: "IPv4 TTL과 IPv6 Hop Limit이 라우터를 지날 때 감소해 잘못된 라우팅 루프의 패킷을 끝내는 방식을 설명한다."
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
---
# TTL과 Hop Limit

IPv4의 TTL(Time To Live)과 IPv6의 Hop Limit은 **패킷이 라우터를 무한히 순환하지 못하도록 수명을 제한하는 네트워크 계층 필드**다. 라우터를 지날 때 값이 감소하고 더 전달할 수 없는 값이 되면 패킷은 폐기된다.

```text
초기 값 = 3
라우터 1 → 2
라우터 2 → 1
라우터 3 → 만료 → 폐기
```

라우팅 설정 오류로 A와 B가 서로를 다음 홉으로 계속 선택하더라도 TTL/Hop Limit이 없으면 같은 패킷이 네트워크 자원을 계속 소비할 수 있다. 수명 제한은 이런 루프를 결국 끝내는 안전장치다.

### IPv4 TTL이라는 이름과 실제 홉 기반 동작을 구분한다

IPv4의 역사적 TTL 정의에는 시간 개념이 있지만 실제 인터넷 전달에서는 라우터를 지날 때 최소 1씩 감소하므로 일반적으로 홉 제한처럼 관찰된다. IPv6는 필드 이름부터 이 의미를 `Hop Limit`으로 명확히 표현한다.

### 패킷이 만료되면 ICMP가 경로 진단 단서를 줄 수 있다

라우터는 TTL/Hop Limit이 만료된 패킷을 버리고 출발지에 ICMP Time Exceeded 계열 메시지를 보낼 수 있다. `traceroute`는 이 특성을 이용해 작은 값부터 점차 늘려 보내면서 각 단계에서 돌아오는 ICMP 응답으로 경로의 중간 홉을 추정한다.

```text
TTL 1 → 첫 라우터에서 만료 → ICMP 응답
TTL 2 → 두 번째 라우터에서 만료 → ICMP 응답
...
```

다만 라우터가 ICMP를 제한·차단하거나 반환 경로가 다를 수 있어 traceroute 결과가 실제 데이터 패킷의 모든 전달 상태를 완벽하게 보여 주는 것은 아니다.

핵심은 **TTL/Hop Limit이 라우팅 루프 자체를 예방하는 것이 아니라, 루프에 들어간 패킷의 수명을 제한해 무한 순환을 막는다는 점**이다.
