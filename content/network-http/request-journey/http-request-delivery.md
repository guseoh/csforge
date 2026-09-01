---
kind: concept
contentKey: network-http.core.request-journey.http-request-delivery
topicContentKey: network-http.core.request-journey
slug: http-request-delivery
title: "HTTP Request Delivery"
summary: "완성된 request가 intermediary를 지나 origin server에 도달하는 경로를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# HTTP Request Delivery

client는 HTTP/1.1의 request line 또는 HTTP/2·3의 pseudo-header, 일반 header와 optional body를 transport framing 위에 쓴다. proxy·gateway·load balancer는 이를 받아 policy를 평가한 뒤 다음 hop에 별도 connection/message로 전달할 수 있고, cache hit나 synthetic error라면 origin까지 전달하지 않고 response를 만들 수 있다. origin이 항상 최종 response를 만든다고 가정하지 않는다.

forwarding 중 hop-by-hop header를 제거하거나 end-to-end header를 추가·변환할 수 있어 host/authority, scheme, client address와 body buffering의 관찰점이 달라진다. 각 hop은 별도 timeout·retry·connection lifecycle을 가지므로 proxy retry가 원래 request를 duplicate할 수 있고, request가 어느 hop에서 거부·cache hit·생성됐는지를 trace와 status로 구분한다.

Backend에서는 correlation ID와 trace context를 intermediary에서 보존하되 client가 임의로 주입한 forwarded identity를 무조건 신뢰하지 않는다. log에 받은 authority, trusted proxy metadata와 실제 socket peer를 모두 기록해 routing과 source attribution을 분리한다.
