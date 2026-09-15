---
kind: concept
contentKey: network-http.core.http-versions.http2-stream
topicContentKey: network-http.core.http-versions
slug: http2-stream
title: "HTTP/2 Stream"
summary: "하나의 HTTP/2 connection 안에서 request/response exchange를 독립된 stream과 frame으로 구분하는 방식을 설명한다."
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
# HTTP/2 Stream

HTTP/2는 하나의 connection 안에서 여러 logical request/response exchange를 **stream**으로 구분한다. 각 stream은 고유한 stream identifier를 가지며, HEADERS와 DATA 같은 frame이 어떤 stream에 속하는지 식별할 수 있다.

```text
one HTTP/2 connection
  ├─ stream 1: HEADERS / DATA ...
  ├─ stream 3: HEADERS / DATA ...
  └─ stream 5: HEADERS / DATA ...
```

하나의 HTTP message가 반드시 하나의 frame에 들어가는 것은 아니다. Header block과 content는 여러 frame으로 나뉠 수 있고, stream lifecycle을 통해 request와 response의 시작·진행·종료 상태를 관리한다.

Stream ID는 connection 안의 protocol state를 구분하는 값이지 application의 영구 request ID가 아니다. 이미 사용한 stream identifier를 같은 connection에서 재사용할 수도 없다.

특정 stream은 `RST_STREAM`으로 종료할 수 있고, connection 전체에서는 `GOAWAY` 같은 signal을 사용해 새 stream 수용 범위를 제어할 수 있다. **HTTP/2 stream은 하나의 transport connection 안에서 여러 HTTP exchange를 독립적으로 관리하기 위한 logical channel**이다.
