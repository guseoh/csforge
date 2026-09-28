---
kind: concept
contentKey: network-http.core.tcp.tcp-byte-stream
topicContentKey: network-http.core.tcp
slug: tcp-byte-stream
title: "TCP 바이트 스트림"
summary: "TCP가 순서 있는 신뢰성 바이트 스트림을 제공하지만 애플리케이션 메시지 경계는 보존하지 않는다는 뜻을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP가 애플리케이션에 순서 있는 바이트 스트림을 제공하고 개별 write 경계를 보존하지 않는 전송 계약을 확인한다."
    displayOrder: 1
---
# TCP 바이트 스트림

TCP는 연결된 두 종단점 사이에 **순서가 있는 신뢰성 바이트 스트림**을 제공한다. 여기서 중요한 단어는 `바이트 스트림`이다. 송신 애플리케이션이 `write()`를 몇 번 호출했는지, 한 번에 몇 바이트를 넘겼는지는 수신 애플리케이션의 `read()` 경계로 그대로 보존되지 않는다.

예를 들어 송신 측이 `ABC`와 `DEF`를 따로 기록해도 수신 측은 다음처럼 여러 방식으로 읽을 수 있다.

```text
송신 write:     [ABC] [DEF]
TCP 바이트:      A B C D E F
수신 read 예:   [AB] [CDEF]
또는            [ABCDEF]
```

TCP가 보장하려는 것은 `ABC`라는 호출 단위를 기억하는 것이 아니라 **바이트 6개를 순서대로 전달하는 것**이다.

### 메시지 경계는 상위 프로토콜이 다시 정의해야 한다

TCP는 HTTP 요청 하나, JSON 문서 하나, 채팅 메시지 하나 같은 논리적 경계를 모른다. 따라서 TCP 위에 자체 프로토콜을 만들면 수신 측이 어디까지가 한 메시지인지 판단할 규칙이 필요하다.

대표적으로 다음 방식을 사용할 수 있다.

- 길이 필드를 먼저 보내고 그 길이만큼 읽는다.
- 구분자를 사용한다.
- 고정 길이 메시지를 사용한다.
- HTTP처럼 프로토콜 자체의 프레이밍 규칙을 사용한다.

이 규칙이 없으면 `read()` 한 번에 한 메시지가 온다고 잘못 가정하는 프레이밍 버그가 생길 수 있다.

### 신뢰성 있는 바이트 전달과 업무 처리 성공은 다른 보장이다

TCP가 재전송과 시퀀스 번호를 이용해 바이트를 상대 TCP까지 전달했다고 해도 상대 애플리케이션이 그 데이터를 읽고 주문을 저장하거나 결제를 완료했다는 뜻은 아니다.

`TCP 전달 성공 → HTTP 요청 파싱 → 인증·인가 → 업무 처리 → DB commit`은 서로 다른 단계다.

TCP 바이트 스트림의 핵심은 **바이트의 순서와 전송 신뢰성을 제공하지만 애플리케이션 메시지 경계와 업무 처리 성공까지 보장하지는 않는다는 점**이다.
