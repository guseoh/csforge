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

IPv4 TTL과 IPv6 Hop Limit은 packet이 router를 지날 때 감소하는 hop counter다. 0이 되면 packet을 폐기해 routing loop가 무한히 network를 점유하는 것을 막고, 필요하면 ICMP time exceeded를 보낸다.

counter는 시간 초 단위가 아니라 hop 수에 가까운 lifetime 제한이다. traceroute는 이 값이 0이 되는 응답을 이용해 중간 router를 추정하지만 방화벽과 policy로 응답이 생략될 수 있다.

### Backend 연결

같은 request가 여러 intermediary를 통과할 때 network loop와 HTTP retry loop를 구분한다. TTL이 정상이어도 proxy가 request를 반복 생성할 수 있으므로 request ID를 추적한다.
