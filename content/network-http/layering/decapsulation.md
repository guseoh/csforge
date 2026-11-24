---
kind: concept
contentKey: network-http.core.layering.decapsulation
topicContentKey: network-http.core.layering
slug: decapsulation
title: "역캡슐화(Decapsulation)"
summary: "수신 경로에서 각 계층이 자신의 헤더와 상태를 해석한 뒤 상위 계층 데이터만 넘기는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "인터넷 호스트의 네트워크 계층 구조와 계층별 책임 경계를 확인한다."
    displayOrder: 1
---
# 역캡슐화(Decapsulation)

역캡슐화는 수신한 전달 단위의 헤더와 상태를 해석하고 필요한 데이터를 상위 계층으로 넘기는 과정입니다. 단순히 헤더를 제거하는 것이 아니라 해당 계층의 검증과 전달 조건을 평가합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "역캡슐화(Decapsulation)",
  "description": "개념의 상태·구조와 책임 경계를 교재형 도식으로 구분하여 보여줍니다.",
  "example": "decapsulation"
}
```

링크 계층에서 검증을 통과한 프레임의 IP 패킷을 해석합니다. 최종 목적지에서는 TCP 또는 UDP가 해당 소켓에 데이터를 전달합니다. TCP는 순서 있는 바이트 스트림을 제공하므로 HTTP 파서는 그 스트림에서 다시 메시지 경계를 해석해야 합니다.

### 라우터와 목적지 호스트의 차이

라우터는 일반적으로 IP 경로를 선택한 뒤 다음 링크용 프레임을 만듭니다. 최종 호스트처럼 HTTP 요청을 처리할 필요는 없습니다. NAT·방화벽·프록시가 함께 동작하는 경우는 순수 IP 전달과 구분해야 합니다.

링크 검증에서 버려진 프레임은 정상적인 상위 전달을 보장하지 않습니다. TCP에서 앞 바이트가 빠져 있다면 뒤쪽 데이터가 먼저 도착해도 순서 있는 애플리케이션 전달이 기다릴 수 있습니다.
