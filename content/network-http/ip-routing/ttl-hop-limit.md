---
kind: concept
contentKey: network-http.core.ip-routing.ttl-hop-limit
topicContentKey: network-http.core.ip-routing
slug: ttl-hop-limit
title: "TTL·Hop Limit"
summary: "hop count 수명이 loop를 제한하고 만료 오류를 만드는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc791"
    title: "Internet Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IP address와 packet forwarding의 기본을 확인한다."
    displayOrder: 1
---
# TTL·Hop Limit

IPv4 TTL(Time To Live)과 IPv6 Hop Limit은 packet이 router를 지날 때 감소하는 **network-layer lifetime counter**다. 값이 0이 되면 packet은 더 이상 forwarding되지 않고 폐기된다. 이 mechanism은 잘못된 route loop에서 packet이 network를 무한히 순환하는 것을 막는다.

### 이름은 TTL이지만 실제로는 hop counter처럼 동작한다

현대 IP forwarding에서 TTL은 보통 router hop마다 1씩 감소한다. IPv6는 이 의미를 더 직접적으로 `Hop Limit`이라고 부른다.

```text
initial value = 3
router 1 → 2
router 2 → 1
router 3 → 0 → discard
```

Router는 packet을 폐기할 때 가능하면 source에 ICMP Time Exceeded message를 보낼 수 있다.

### Traceroute와의 연결

Traceroute는 작은 TTL/Hop Limit부터 점차 값을 늘려 packet을 보내고, 중간 router가 돌려주는 Time Exceeded 응답을 이용해 path의 hop을 추정한다. 다만 router가 ICMP 응답을 보내지 않거나 rate limit할 수도 있으므로 traceroute 결과가 모든 실제 forwarding 상태를 완벽하게 보여 주는 것은 아니다.

TTL/Hop Limit의 핵심은 **packet lifetime을 hop 수로 제한해 routing loop가 network resource를 무한히 소비하지 못하게 하는 것**이다.
