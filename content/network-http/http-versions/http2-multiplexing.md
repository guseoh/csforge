---
kind: concept
contentKey: network-http.core.http-versions.http2-multiplexing
topicContentKey: network-http.core.http-versions
slug: http2-multiplexing
title: "HTTP/2 멀티플렉싱"
summary: "여러 스트림(stream)의 프레임(frame)을 하나의 연결에서 섞어 보내 HTTP/1.1의 응답 순서 대기(head-of-line blocking, HOL)를 줄이는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9113"
    title: "HTTP/2"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/2 stream·frame·multiplexing을 확인한다."
    displayOrder: 1
---
# HTTP/2 멀티플렉싱

HTTP/2는 여러 스트림의 프레임을 하나의 연결에서 교차 전송할 수 있다. 한 스트림의 응답이 끝나지 않았어도 다른 스트림의 `HEADERS`나 `DATA` 프레임을 보낼 수 있으므로 HTTP/1.1 파이프라이닝처럼 응답 전체가 엄격한 순서로 끝날 필요가 없다.

```text
하나의 연결에서 프레임 교차 전송
  → 스트림 1 프레임
  → 스트림 3 프레임
  → 스트림 1 프레임
  → 스트림 5 프레임
  → 스트림 3 프레임
```

이 구조는 여러 요청을 동시에 처리하면서 연결 수와 반복 핸드셰이크 비용을 줄일 수 있다. 특정 스트림을 재설정해도 다른 스트림은 계속 진행할 수 있다.

하지만 멀티플렉싱이 모든 대기를 없애지는 않는다. 여러 스트림이 같은 연결의 전송 상태, 혼잡 상태와 연결 수준 흐름 제어를 공유한다. 특히 HTTP/2가 TCP 위에서 동작하면 TCP 바이트 스트림에서 손실이 발생했을 때 여러 스트림의 프레임 전달이 함께 지연될 수 있다.

따라서 **HTTP/2 멀티플렉싱은 HTTP 수준 스트림을 교차 전송하는 기능이지, 아래 전송 계층의 공유 상태까지 독립시키는 기능은 아니다.**
