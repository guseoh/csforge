---
kind: concept
contentKey: network-http.core.udp.udp-datagram
topicContentKey: network-http.core.udp
slug: udp-datagram
title: "UDP 데이터그램과 메시지 경계"
summary: "UDP가 데이터그램 단위의 경계를 보존해 전달하지만 도착·순서·중복 제거까지 보장하지 않는다는 의미를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc768"
    title: "User Datagram Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP datagram과 application reliability 경계를 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc8085"
    title: "UDP Usage Guidelines"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP를 사용하는 application의 혼잡 제어·메시지 크기·신뢰성 설계 지침을 확인한다."
    displayOrder: 2
    relationNote: "경로 MTU를 넘는 UDP 데이터그램과 IP 단편화를 피하기 위한 지침을 보충한다."
---
# UDP 데이터그램과 메시지 경계

UDP는 TCP처럼 연결을 만들고 하나의 연속된 바이트 스트림을 제공하지 않는다. 송신 측은 **출발지 포트·목적지 포트와 데이터를 담은 하나의 데이터그램(datagram)**을 보내고, 수신 측은 도착한 데이터그램을 그 단위대로 받는다.

예를 들어 애플리케이션이 UDP로 두 번 전송했다면 수신 측에서 두 데이터그램의 경계가 TCP처럼 하나의 바이트 스트림으로 합쳐지지는 않는다.

```text
송신
[데이터그램 A]   [데이터그램 B]
       ↓                 ↓
              UDP
       ↓                 ↓
수신
[데이터그램 A]   [데이터그램 B]
```

여기서 중요한 점은 **경계를 보존한다는 것과 전달을 보장한다는 것은 전혀 다른 성질**이라는 것이다. A가 유실될 수도 있고, B가 A보다 먼저 도착할 수도 있으며, 중복 데이터그램이 관찰될 수도 있다. UDP 자체는 이를 재전송하거나 순서대로 다시 정렬해 주지 않는다.

| 구분 | UDP가 제공하는 것 | UDP가 기본 보장하지 않는 것 |
| --- | --- | --- |
| 메시지 경계 | 도착한 데이터그램의 경계를 유지 | 모든 데이터그램의 도착 |
| 순서 | 각 데이터그램을 독립적으로 전달 | 송신 순서와 같은 수신 순서 |
| 중복 | 데이터그램 자체를 전달 | 중복 제거 |
| 복구 | 별도 연결 상태 없음 | ACK·재전송·손실 복구 |

### 데이터그램 크기는 경로 MTU와 함께 봐야 한다

UDP 데이터가 커지면 이를 담는 IP 패킷도 커진다. 경로 MTU보다 큰 IPv4 패킷은 조건에 따라 단편화될 수 있고, IPv6에서는 중간 라우터가 전달 중 단편화를 수행하지 않는다.

하나의 UDP 데이터그램이 여러 IP 조각으로 나뉜 경우 조각 하나만 유실돼도 원래 데이터그램 전체를 완성하지 못할 수 있다. 그래서 `UDP는 메시지 하나를 한 번에 보낸다`는 이유만으로 매우 큰 데이터그램을 보내는 것은 좋은 전략이 아니다.

애플리케이션은 가능하면 IP 단편화에 의존하지 않도록 데이터그램 크기를 정하고, 필요한 경우 PMTUD·PLPMTUD 같은 방식으로 경로에서 사용할 수 있는 크기를 고려해야 한다. 하나의 논리 메시지를 여러 데이터그램으로 나눈다면 조각 식별·재조립·일부 손실 처리도 상위 프로토콜이 정의해야 한다.

### 연결이 없다는 말은 상태가 전혀 없다는 뜻이 아니다

UDP 자체는 TCP의 핸드셰이크·시퀀스·재전송 상태를 만들지 않는다. 하지만 운영체제는 소켓, 포트 바인딩, 송·수신 버퍼 같은 로컬 상태를 관리하고, 애플리케이션은 상대 주소·시퀀스 번호·타임아웃 같은 상태를 추가할 수 있다.

따라서 UDP의 핵심은 `아무 상태도 없다`가 아니라 **전송 계층이 연결형 신뢰성과 순서 있는 바이트 스트림을 기본 제공하지 않고, 데이터그램이라는 더 얇은 전달 계약을 제공한다는 점**이다.
