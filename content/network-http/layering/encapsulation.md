---
kind: concept
contentKey: network-http.core.layering.encapsulation
topicContentKey: network-http.core.layering
slug: encapsulation
title: "캡슐화(Encapsulation)"
summary: "상위 계층의 데이터가 하위 계층의 페이로드가 되고 각 계층의 헤더가 추가되는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "인터넷 호스트의 네트워크 계층 구조와 계층별 책임 경계를 확인한다."
    displayOrder: 1
---
# 캡슐화(Encapsulation)

애플리케이션은 HTTP 요청의 의미를 다루지만 네트워크는 데이터를 목적지까지 전달할 정보를 필요로 합니다. 캡슐화는 상위 데이터를 하위 계층의 페이로드로 사용하고 전달에 필요한 정보를 추가하는 과정입니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "캡슐화(Encapsulation)",
  "description": "개념의 상태·구조와 책임 경계를 교재형 도식으로 구분하여 보여줍니다.",
  "example": "encapsulation"
}
```

그림은 TCP가 운반하는 응용 데이터 일부를 IP와 이더넷으로 전달하는 예입니다. TCP 헤더에는 포트와 시퀀스 등이, IP 헤더에는 주소와 전달에 필요한 정보가 포함됩니다. 이더넷은 현재 링크의 전달에 필요한 헤더와 오류 검출용 FCS를 사용합니다. 그림의 폭이 실제 헤더 길이를 의미하지는 않습니다.

### 데이터 경계는 일대일이 아닙니다

HTTP 메시지 하나가 여러 TCP 세그먼트로 나뉠 수 있습니다. TCP 소켓을 한 번 읽었을 때 여러 메시지의 일부가 함께 들어올 수도 있습니다. 그러므로 HTTP 요청과 TCP 세그먼트, IP 패킷, 이더넷 프레임을 항상 일대일로 대응시키면 안 됩니다.

라우터는 이전 링크의 프레임에서 IP 패킷을 꺼내 다음 링크에 맞게 다시 캡슐화합니다. 일반적인 IP 전달에서는 최종 목적지 IP가 유지되지만 링크 주소는 바뀔 수 있습니다. NAT 및 터널은 별도의 처리입니다.
