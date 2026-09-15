---
kind: concept
contentKey: network-http.core.http-versions.http10-connection
topicContentKey: network-http.core.http-versions
slug: http10-connection
title: "HTTP/1.0 Connection"
summary: "HTTP/1.0의 기본적인 connection-per-exchange 모델과 connection close framing의 관계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1945"
    title: "Hypertext Transfer Protocol — HTTP/1.0"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP connection reuse와 version framing을 확인한다."
    displayOrder: 1
---
# HTTP/1.0 Connection

HTTP/1.0의 기본적인 사용 모델에서는 한 HTTP request/response exchange가 끝난 뒤 TCP connection을 닫는 방식이 일반적이었다. 여러 resource를 요청하면 connection setup과 teardown을 반복하게 되어 TCP handshake 비용도 반복될 수 있다.

```text
TCP connect → request 1 → response 1 → close
TCP connect → request 2 → response 2 → close
```

Connection close는 일부 response에서 message body의 끝을 알려 주는 framing 역할도 할 수 있다. 즉 HTTP message boundary와 transport connection lifecycle이 강하게 연결될 수 있었다.

HTTP/1.0 환경에서도 Keep-Alive extension을 통해 connection 재사용을 시도할 수 있었지만 이는 HTTP/1.1의 기본 persistent connection model과 구분해야 한다.

HTTP/1.0을 이해할 때 핵심은 **요청마다 새 transport connection을 만들 수 있는 비용과, connection 종료가 message framing에 관여하는 구조**다. 이 한계를 줄이기 위해 HTTP/1.1에서는 persistent connection이 기본 모델이 된다.
