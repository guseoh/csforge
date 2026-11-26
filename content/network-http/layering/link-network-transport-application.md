---
kind: concept
contentKey: network-http.core.layering.link-network-transport-application
topicContentKey: network-http.core.layering
slug: link-network-transport-application
title: "링크·네트워크·전송·애플리케이션 계층"
summary: "링크·네트워크·전송·애플리케이션 계층이 각각 어느 범위의 전달과 상태를 책임지는지 비교한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "인터넷 호스트의 네트워크 계층 구조와 계층별 책임 경계를 확인한다."
    displayOrder: 1
---
# 링크·네트워크·전송·애플리케이션 계층

인터넷 통신에서 각 계층은 서로 다른 주소, 상태 및 전달 범위를 다룹니다. 계층 이름 자체보다 무엇을 책임지고 무엇을 보장하지 않는지 이해하는 것이 중요합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "링크·네트워크·전송·애플리케이션 계층",
  "description": "개념의 상태·구조와 책임 경계를 교재형 도식으로 구분하여 보여줍니다.",
  "example": "link-network-transport-application"
}
```

| 계층 | 전달 범위와 책임 | 대표 정보 |
| --- | --- | --- |
| 링크 | 현재 링크의 프레임 전달 | MAC 주소 |
| 네트워크 | 여러 네트워크 사이의 패킷 전달 | IP 주소, 경로 |
| 전송 | 종단점 간 전달 특성 | 포트, TCP 시퀀스 |
| 애플리케이션 | 프로토콜 메시지와 의미 | HTTP 메서드, DNS 질의 |

이더넷은 현재 링크에서 프레임을 전달합니다. 라우터는 다음 링크에 맞는 프레임을 새로 만들 수 있습니다. IP는 목적지에 대한 최선형 전달을 제공하므로 손실과 순서 변경이 발생할 수 있습니다.

TCP는 순서 있는 바이트 스트림과 손실 복구를 제공하지만 애플리케이션의 메시지 경계를 보존하지 않습니다. UDP는 데이터그램 단위를 제공하지만 전달 성공, 순서, 중복 제거를 보장하지 않습니다.

HTTP는 전달받은 데이터를 요청·응답 메시지로 해석합니다. DNS는 이름에 관한 레코드를 조회합니다. 전송 성공만으로 HTTP 성공이나 업무 처리 완료까지 보장되는 것은 아닙니다.
