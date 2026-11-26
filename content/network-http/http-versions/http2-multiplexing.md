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

HTTP/2에서는 하나의 연결에 여러 논리적 스트림을 만들고 프레임을 교차 전송할 수 있습니다. 수신자는 스트림 ID를 이용하여 각 프레임이 어느 교환에 속하는지 식별합니다.

```text
스트림 1 HEADERS → 스트림 3 HEADERS
→ 스트림 3 DATA → 스트림 1 DATA
```

위 예에서는 HEADERS의 헤더 블록이 완결되어 있다고 가정합니다. CONTINUATION이 필요한 경우 해당 블록의 프레임을 다른 프레임으로 끊어서는 안 됩니다. 스트림마다 별도 상태와 순서가 존재하지만 모든 프레임이 하나의 연결을 사용합니다.

### 공유 자원과 흐름 제어

DATA 프레임에는 스트림 수준과 연결 수준의 흐름 제어가 적용됩니다. 한 스트림의 흐름 제어 여유가 충분해도 연결 윈도 여유가 부족하면 전송이 제한될 수 있습니다. 허용되는 0바이트 END_STREAM DATA는 별도 예외입니다.

스트림 오류나 RST_STREAM이 반드시 전체 연결 종료를 뜻하지는 않습니다. 그러나 연결 수준 오류나 TCP 바이트 유실은 여러 스트림에 영향을 줄 수 있습니다. 다중화는 HTTP 응답 순서 차단을 줄이는 구조이지 모든 공유 자원과 대기를 제거하는 구조가 아닙니다.
