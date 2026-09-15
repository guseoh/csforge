---
kind: concept
contentKey: network-http.core.http-state-intermediary.proxy
topicContentKey: network-http.core.http-state-intermediary
slug: proxy
title: "Forward Proxy"
summary: "client를 대신해 outbound 요청을 origin 쪽으로 전달하는 forward proxy의 위치와 hop 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Forward Proxy

forward proxy는 client가 origin에 직접 연결하는 대신, client가 선택한 intermediary에 요청을 보내고 그 intermediary가 origin 쪽 connection을 만드는 구조다. 즉 client 쪽을 대신해 outbound request path에 참여한다는 점에서 origin 앞에 배치되는 reverse proxy와 위치가 다르다.

```text
client → forward proxy → origin
```

proxy는 egress policy, cache, audit 같은 기능을 제공할 수 있지만 그런 기능이 forward proxy의 필수 정의는 아니다. 핵심은 client와 origin 사이에 새로운 HTTP hop이 생기고, client→proxy와 proxy→origin이 서로 다른 connection일 수 있다는 점이다.

HTTPS destination으로 end-to-end TLS를 유지하려면 client가 HTTP `CONNECT`를 사용해 proxy에 tunnel 생성을 요청할 수 있다. 이 경우 proxy는 encrypted bytes를 중계할 수 있고, 반대로 proxy가 TLS를 직접 종료하는 환경이라면 client와 origin 사이의 trust boundary가 달라진다.

forward proxy를 거치면 origin의 socket peer는 원래 client가 아니라 proxy일 수 있다. 원래 client 정보가 필요하다면 별도의 전달 규칙이 필요하며, proxy가 전달한 metadata도 신뢰 정책 없이 client identity의 증명으로 취급해서는 안 된다.
