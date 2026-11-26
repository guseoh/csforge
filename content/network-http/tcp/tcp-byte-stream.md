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
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
---
# TCP 바이트 스트림

TCP는 연결된 두 종단점 사이에 신뢰성 있는 순서 바이트 스트림을 제공합니다. 송신 애플리케이션의 write 호출 단위는 수신 애플리케이션의 read 호출 단위로 보존되지 않습니다.

```text
write: [ABC] [DEF]
stream: ABCDEF
read 예시: [AB] [CDEF] 또는 [ABCDEF]
```

연결에서 바이트가 정상적으로 전달될 때 수신 측은 순서대로 데이터를 읽을 수 있습니다. 그러나 장애로 연결이 실패하면 전체 데이터의 전달을 보장할 수 없습니다.

### 메시지 프레이밍

TCP는 HTTP 요청, JSON 문서 등의 논리 경계를 모릅니다. 길이 필드, 구분자, 고정 길이 또는 상위 프로토콜의 프레이밍으로 메시지 경계를 판단해야 합니다. Java의 InputStream.read가 요청한 길이만큼 항상 반환하는 것도 아니므로 필요한 범위가 완성될 때까지 읽는 로직이 필요할 수 있습니다.

TCP 수신 확인과 HTTP 파싱, 인증·인가, 업무 처리, DB 커밋은 각각 다른 성공 조건입니다.
