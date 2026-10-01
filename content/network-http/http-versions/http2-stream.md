---
kind: concept
contentKey: network-http.core.http-versions.http2-stream
topicContentKey: network-http.core.http-versions
slug: http2-stream
title: "HTTP/2 스트림"
summary: "하나의 HTTP/2 연결 안에서 요청·응답 교환(exchange)을 독립된 스트림(stream)과 프레임(frame)으로 구분하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9113"
    title: "HTTP/2"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/2 stream·frame·multiplexing을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc9113.html#section-5.1.1"
    title: "RFC 9113 Section 5.1.1: Stream Identifiers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/2 stream identifier의 parity·증가·재사용 금지 규칙을 확인한다."
    displayOrder: 2
---
# HTTP/2 스트림

HTTP/2는 하나의 연결 안에서 여러 논리적 요청·응답 교환을 스트림(stream)으로 구분한다. 각 스트림에는 고유한 스트림 식별자(stream identifier)가 있으며 `HEADERS`, `DATA` 같은 프레임이 어느 스트림에 속하는지 이 식별자로 알 수 있다.

```text
하나의 HTTP/2 연결
  ├─ 스트림 1: HEADERS / DATA ...
  ├─ 스트림 3: HEADERS / DATA ...
  └─ 스트림 5: HEADERS / DATA ...
```

하나의 HTTP 메시지가 반드시 프레임 하나에 들어가는 것은 아니다. 헤더 블록과 콘텐츠가 여러 프레임으로 나뉠 수 있고, 스트림 수명 주기가 요청·응답의 시작·진행·종료를 관리한다.

스트림 ID는 연결 안의 프로토콜 상태를 구분하는 값이지 애플리케이션의 영구 요청 식별자가 아니다. 이미 사용한 스트림 식별자는 같은 연결에서 다시 사용할 수 없다.

`RST_STREAM`으로 특정 스트림을 종료할 수 있고, `GOAWAY` 같은 신호로 연결 전체에서 새 스트림을 받는 범위를 제어할 수 있다. **HTTP/2 스트림은 하나의 전송 연결 안에서 여러 HTTP 교환을 각각 관리하는 논리 채널이다.**
