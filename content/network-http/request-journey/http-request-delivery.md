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

client는 request line 또는 pseudo-header, header, optional body를 transport stream에 쓰고, proxy·gateway·load balancer가 이를 읽어 다음 hop으로 전달한다. 각 intermediary는 connection과 message framing을 별도로 처리하며 origin이 최종 response를 만든다.

forwarding 중 header를 추가·삭제·변환할 수 있어 host, scheme, client address의 source가 달라진다. request가 어느 hop에서 거부·재시도·cache hit됐는지 trace와 status로 구분한다.

### Backend 연결

correlation ID와 trace context를 intermediary에서 보존하되 client가 임의로 신뢰할 header는 제한한다. backend log에는 받은 authority와 실제 socket peer를 모두 기록한다.
