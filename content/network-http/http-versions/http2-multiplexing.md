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

하지만 멀티플렉싱이 모든 대기를 없애지는 않는다. 여러 스트림이 같은 연결의 전송 상태, 혼잡 상태와 연결 수준 흐름 제어를 공유한다.

HTTP/2의 `DATA` 프레임은 스트림별 흐름 제어 윈도와 연결 전체 흐름 제어 윈도를 **동시에** 만족해야 한다(RFC 9113 §5.2·§6.9.1). 스트림 A의 윈도만 0이라면 연결과 스트림 B에 여유가 있을 때 B는 계속 데이터를 보낼 수 있다. 그러나 연결 전체 윈도가 0이면 B의 스트림 윈도가 남아 있더라도 **양의 길이를 가진 `DATA` 프레임은 보내지 못한다**. RFC 9113 §6.9.1은 특별히 **길이 0이고 `END_STREAM`이 설정된 DATA 프레임**은 윈도 공간이 없어도 전송할 수 있도록 허용한다. 이후 양의 길이 데이터를 전송하려면 해당 윈도에 `WINDOW_UPDATE`로 다시 공간이 생겨야 한다. `HEADERS` 같은 흐름 제어 비대상 프레임은 이 데이터 윈도를 소비하지 않는다. 특히 HTTP/2가 TCP 위에서 동작하면 TCP 바이트 스트림에서 손실이 발생했을 때 여러 스트림의 프레임 전달이 함께 지연될 수 있다.

따라서 **HTTP/2 멀티플렉싱은 HTTP 수준 스트림을 교차 전송하는 기능이지, 아래 전송 계층의 공유 상태까지 독립시키는 기능은 아니다.**
