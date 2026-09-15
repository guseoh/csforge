---
kind: concept
contentKey: network-http.core.http-versions.http11-persistent
topicContentKey: network-http.core.http-versions
slug: http11-persistent
title: "HTTP/1.1 Persistent Connection"
summary: "HTTP/1.1이 하나의 TCP connection을 여러 request/response exchange에 재사용하는 기본 모델을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 message framing과 body 경계를 확인한다."
    displayOrder: 1
---
# HTTP/1.1 Persistent Connection

HTTP/1.1은 하나의 TCP connection에서 여러 request/response exchange를 처리할 수 있는 persistent connection을 기본으로 사용한다. 새 request마다 TCP connection을 다시 만드는 비용을 줄이고, 이미 만들어진 transport state를 재사용할 수 있다.

```text
one TCP connection
  ├─ request 1 → response 1
  ├─ request 2 → response 2
  └─ request 3 → response 3
```

Connection을 재사용하려면 receiver가 각 HTTP message의 끝을 정확히 알아야 한다. 그래서 `Content-Length`, transfer coding, status/method 규칙 같은 HTTP/1.1 framing이 중요하다. 이전 response body의 경계를 잘못 해석하면 다음 response bytes와 섞일 수 있다.

HTTP/1.1에서 persistence가 기본이라고 해서 connection이 영원히 유지되는 것은 아니다. Endpoint는 `Connection: close`를 사용하거나 timeout·resource policy 때문에 connection을 종료할 수 있다.

또한 persistent connection은 여러 exchange를 **재사용**하는 모델이지 HTTP/2처럼 여러 independent stream의 frame을 동시에 interleave하는 multiplexing은 아니다. 이 차이가 HTTP/1.1 pipelining과 HTTP/2 stream model을 이해하는 출발점이다.
