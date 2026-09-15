---
kind: concept
contentKey: network-http.core.http-versions.http11-pipelining
topicContentKey: network-http.core.http-versions
slug: http11-pipelining
title: "HTTP/1.1 Pipelining"
summary: "여러 request를 먼저 보내도 response 순서를 유지해야 하는 HTTP/1.1 pipelining과 HOL 한계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 message framing과 body 경계를 확인한다."
    displayOrder: 1
---
# HTTP/1.1 Pipelining

HTTP/1.1 pipelining은 같은 persistent connection에서 이전 response를 기다리지 않고 여러 request를 연속으로 보내는 방식이다. Request 전송 자체는 겹칠 수 있지만 server는 pipelined request에 대한 response를 request 순서와 같은 순서로 보낸다.

```text
request:  R1 → R2 → R3
response: S1 → S2 → S3
```

이 구조에서는 R1의 처리가 오래 걸리면 R2와 R3에 대한 response가 준비되어 있어도 앞 response를 건너 client에 전달할 수 없다. 이런 ordered response 제약이 HTTP/1.1 pipelining의 head-of-line 문제를 만든다.

또한 connection이 중간에 끊기면 이미 전송된 여러 request 중 어떤 요청까지 server가 처리했는지 모호할 수 있다. 특히 non-idempotent request는 단순 재전송이 안전하지 않을 수 있다.

HTTP/2는 request마다 독립적인 stream을 두고 여러 stream의 frame을 interleave함으로써 이 HTTP-level ordered-response 한계를 줄인다. **Pipelining은 여러 request를 미리 보내는 방식이지, HTTP/2의 independent stream multiplexing과 같은 모델은 아니다.**
