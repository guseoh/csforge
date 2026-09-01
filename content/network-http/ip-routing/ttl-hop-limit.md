---
kind: concept
contentKey: network-http.core.ip-routing.ttl-hop-limit
topicContentKey: network-http.core.ip-routing
slug: ttl-hop-limit
title: "TTL and Hop Limit"
summary: "packet이 routing loop에서 무한히 돌지 않게 하는 hop counter를 설명한다."
level: 1
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
# TTL and Hop Limit

IPv4 TTL(Time To Live)과 IPv6 Hop Limit은 packet이 forwarding될 때 감소하는 IP-layer lifetime counter다. 이름에 time이 들어가도 일반적인 router에서는 초 단위 timer가 아니라 hop마다 줄어드는 값으로 동작한다. counter가 소진되면 router는 packet을 폐기해 route loop가 network와 queue를 무한히 점유하지 못하게 하고, 가능하면 ICMP Time Exceeded를 source에 보낸다.

송신 host가 작은 TTL/Hop Limit으로 probe를 보내고 중간 router가 소진 응답을 돌려주면 traceroute가 hop을 추정할 수 있다. 하지만 firewall, rate limit, asymmetric path와 router policy가 응답을 막을 수 있으므로 응답이 없다는 사실이 해당 hop의 유일한 증거는 아니다. TTL이 충분해도 route가 없거나 application timeout이 발생할 수 있다.

같은 request가 여러 intermediary를 통과할 때 IP forwarding loop와 HTTP proxy/retry loop는 별개다. TTL이 정상이어도 proxy가 request를 반복 생성할 수 있으므로 network counter와 application request ID를 함께 추적한다.
