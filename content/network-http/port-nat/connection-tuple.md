---
kind: concept
contentKey: network-http.core.port-nat.connection-tuple
topicContentKey: network-http.core.port-nat
slug: connection-tuple
title: "연결 식별 튜플"
summary: "양쪽 IP 주소·포트와 전송 프로토콜 조합으로 연결·흐름을 구분하고 같은 서버 포트에서 여러 연결이 공존하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
---
# 연결 식별 튜플

TCP가 정해진 네트워크 문맥에서 연결은 로컬 IP·포트와 원격 IP·포트의 네 값으로 구분됩니다. 일반적인 네트워크 흐름을 전송 프로토콜까지 포함해 표현하면 5-tuple이라고 부르기도 합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "연결 식별 튜플",
  "description": "개념의 상태·구조와 책임 경계를 교재형 도식으로 구분하여 보여줍니다.",
  "example": "connection-tuple"
}
```

같은 서버 198.51.100.20:443으로 접속하더라도 원격 종단점이 다르면 별도의 연결입니다. 각 연결의 시퀀스, 윈도우 및 버퍼 상태를 독립적으로 유지합니다. 같은 원격 IP도 여러 원격 포트를 사용해 연결할 수 있습니다.

### 연결 식별자와 HTTP 요청

HTTP/1.1은 지속 연결을 재사용할 수 있고 HTTP/2에서는 한 연결에 여러 스트림이 존재합니다. TCP 튜플은 영구적인 업무 요청 ID나 사용자 세션 ID가 아닙니다. 연결 종료 후에도 동일한 튜플이 다시 사용될 수 있습니다.

NAT/PAT가 주소와 포트를 변환하면 내부 호스트와 외부 서버에서 관찰하는 값이 달라질 수 있습니다. 로그를 비교할 때 관찰 장비와 네트워크 문맥도 확인해야 합니다.
