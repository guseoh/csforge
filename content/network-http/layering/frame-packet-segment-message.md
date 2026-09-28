---
kind: concept
contentKey: network-http.core.layering.frame-packet-segment-message
topicContentKey: network-http.core.layering
slug: frame-packet-segment-message
title: "프레임·패킷·세그먼트·메시지"
summary: "프레임·패킷·세그먼트·데이터그램·메시지가 각각 어느 계층의 데이터 단위를 가리키는지 비교한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "인터넷 프로토콜 계층마다 데이터 단위와 책임 범위가 달라지는 점을 확인한다."
    displayOrder: 1
---
# 프레임·패킷·세그먼트·메시지

`프레임`, `패킷`, `세그먼트`, `데이터그램`, `메시지`는 모두 네트워크로 전달되는 데이터를 가리키지만 **같은 경계를 뜻하는 말이 아니다.** 어느 계층에서 데이터를 보고 있는지에 따라 사용하는 단위가 달라진다.

| 데이터 단위 | 계층 | 의미 | 예 |
| --- | --- | --- | --- |
| 프레임(frame) | 링크 | 하나의 로컬 링크에서 전달되는 단위 | Ethernet frame |
| 패킷(packet) | 네트워크 | IP 전달이 처리하는 단위 | IPv4·IPv6 packet |
| 세그먼트/데이터그램 | 전송 | 전송 계층 헤더와 데이터를 가진 단위 | TCP segment, UDP datagram |
| 메시지(message) | 애플리케이션 | 프로토콜이 정의한 논리적 요청·응답 단위 | HTTP message, DNS query |

실제 문서나 패킷 분석 도구에서는 `packet`이라는 표현을 넓은 의미로 쓰기도 한다. 따라서 단어 하나만 보고 계층을 단정하기보다 **어떤 프로토콜 헤더와 데이터 경계를 가리키는지** 함께 확인하는 것이 안전하다.

### 서로 다른 계층의 단위는 일대일로 대응하지 않는다

큰 HTTP 응답 하나는 여러 TCP 세그먼트와 IP 패킷, 링크 프레임으로 나뉠 수 있다.

```text
HTTP 메시지 하나
   ↓
여러 TCP 세그먼트
   ↓
여러 IP 패킷
   ↓
각 링크에서 여러 프레임
```

TCP 수신 측은 세그먼트 경계를 애플리케이션에 그대로 전달하지 않고 순서 있는 바이트 스트림을 제공한다. 따라서 HTTP는 `Content-Length`, 전송 프레이밍 같은 자기 규칙으로 메시지 끝을 판단해야 한다.

UDP는 반대로 데이터그램 경계를 애플리케이션에 보존하지만 전달 성공과 순서를 보장하지 않는다. 즉 **경계 보존과 신뢰성은 별개의 성질**이다.

핵심은 **상위 메시지 하나와 하위 전송 단위 하나를 일대일로 대응시키지 않고, 각 계층의 데이터 경계와 보장을 따로 보는 것**이다.
