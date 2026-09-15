---
kind: concept
contentKey: network-http.core.request-journey.http-request-delivery
topicContentKey: network-http.core.request-journey
slug: http-request-delivery
title: "HTTP Request가 Origin에 도달하는 과정"
summary: "완성된 HTTP request가 intermediary를 거쳐 origin server까지 전달되거나 중간에서 처리될 수 있는 흐름을 설명한다."
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
# HTTP Request가 Origin에 도달하는 과정

transport와 TLS channel이 준비되면 client는 HTTP method, target, header와 필요한 body로 request를 만든다. 이 request가 항상 client에서 origin server로 한 번에 직접 전달되는 것은 아니다. forward proxy, CDN, reverse proxy, gateway나 load balancer 같은 intermediary가 중간 hop으로 참여할 수 있다.

intermediary는 request를 받아 다음 hop으로 새 HTTP message를 전달할 수 있다. 이때 upstream connection은 client connection과 별개의 transport state를 사용하며, 일부 header는 hop 성격에 따라 제거되거나 다시 만들어질 수 있다. 그래서 하나의 사용자 요청이 여러 HTTP connection을 거쳐 origin에 도달할 수 있다.

### Origin까지 가지 않고 응답이 만들어질 수도 있다

cache가 fresh한 response를 가지고 있다면 intermediary가 origin에 요청을 전달하지 않고 직접 응답할 수 있다. gateway가 request를 정책상 거부하거나 upstream 연결에 실패해 자체 error response를 만들 수도 있다. 따라서 client가 HTTP response를 받았다는 사실만으로 origin application이 반드시 실행됐다고 단정할 수 없다.

```text
client
  ↓ HTTP hop 1
proxy / CDN / gateway
  ↓ HTTP hop 2
origin server
```

이 흐름의 핵심은 HTTP가 단순한 end-to-end socket 한 개와 동일하지 않다는 점이다. **각 intermediary는 하나의 HTTP participant가 되어 request를 받아 처리하거나 다음 hop으로 전달하고, 경우에 따라 자신이 response를 만들 수도 있다.**
