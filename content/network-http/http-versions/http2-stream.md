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

HTTP/2는 하나의 연결에서 여러 HTTP 요청과 응답을 교환할 수 있습니다. 각각의 논리적인 교환을 구분하는 단위가 스트림(stream)이며, 프레임 헤더의 스트림 ID를 이용해 어느 교환에 속하는지 식별합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "HTTP/2 스트림",
  "description": "프로토콜 상태·요청 경계와 이전·이후 결과를 고정 예제로 확인합니다.",
  "example": "http2-stream"
}
```

그림에서 스트림 1과 3의 HEADERS 및 DATA가 같은 방향의 연결에 교차 배치됩니다. 클라이언트는 프레임을 읽어 스트림 ID별로 헤더와 콘텐츠를 처리합니다. 각 스트림의 논리적인 메시지 경계는 유지되지만 서로 다른 스트림의 응답을 요청 순서대로 완전히 끝낼 필요는 없습니다.

### 프레임과 스트림의 수명

HTTP 메시지 하나가 항상 프레임 하나에 담기는 것은 아닙니다. 긴 필드 섹션은 HEADERS와 CONTINUATION 프레임으로 나뉠 수 있습니다. 이때 END_HEADERS가 나오기 전까지 같은 필드 섹션의 연속 프레임 사이에 다른 프레임을 끼울 수 없습니다. 메시지 콘텐츠는 DATA 프레임으로 전달하며 END_STREAM은 해당 방향의 송신 종료를 표시합니다.

HTTP/2 스트림 ID는 연결 내에서 사용되며 재사용하지 않습니다. 클라이언트가 시작하는 스트림은 홀수 ID를 사용하고, 스트림 0은 연결 수준 제어에 예약되어 있습니다. 애플리케이션 요청 ID나 데이터베이스 식별자와는 다른 값입니다.

### 오류와 흐름 제어

RST_STREAM은 특정 스트림을 종료하는 데 사용되고 GOAWAY는 연결 수준의 종료 또는 신규 스트림 수락 경계를 알립니다. DATA 전송에는 스트림별·연결별 흐름 제어가 적용됩니다. 따라서 스트림 하나가 느리다고 모든 응답을 HTTP 순서대로 기다려야 하는 것은 아니지만 TCP 자체의 바이트 순서 제약은 남아 있습니다.

서버의 요청 처리 스레드와 HTTP/2 스트림은 일대일로 대응한다고 가정하지 않습니다. 실제 애플리케이션 동시성과 실행 모델은 서버 구현에 따라 달라집니다.
