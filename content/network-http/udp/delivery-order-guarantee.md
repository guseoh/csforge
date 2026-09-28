---
kind: concept
contentKey: network-http.core.udp.delivery-order-guarantee
topicContentKey: network-http.core.udp
slug: delivery-order-guarantee
title: "UDP 전달과 순서 보장"
summary: "UDP가 데이터그램의 도착·순서·중복 제거를 기본 보장하지 않으며 필요한 보장을 상위 프로토콜이 선택해야 하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc768"
    title: "User Datagram Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP datagram과 application reliability 경계를 확인한다."
    displayOrder: 1
---
# UDP 전달과 순서 보장

UDP는 데이터그램을 IP 위에 실어 보내지만, 송신 뒤 **각 데이터그램이 목적지에 도착했는지 확인하는 ACK·재전송 상태를 기본적으로 유지하지 않는다.** 그래서 네트워크 혼잡, 경로 변화, 라우터·호스트 버퍼 부족 같은 이유로 데이터그램이 사라져도 UDP 자체가 다시 보내지 않는다.

도착 순서도 보장하지 않는다. `D1 → D2 → D3` 순서로 보냈더라도 각 패킷이 겪는 큐 지연이나 경로가 달라지면 `D1 → D3 → D2`처럼 관찰될 수 있다. 중복 데이터그램이 생겨도 UDP에는 애플리케이션 메시지 ID를 보고 중복을 제거하는 연결 상태가 없다.

```text
송신 순서   : D1 → D2 → D3 → D4
수신 가능성 : D1 → D3 → D2 → D2
                              ↑
                 D4는 유실, D2는 중복 가능
```

이 예시는 가능한 결과 하나일 뿐이다. UDP 계약에는 `몇 번째 데이터그램이 빠진다`거나 `얼마나 늦게 도착한다`는 규칙도 없다.

### 필요한 신뢰성은 사용 사례에 따라 달라진다

모든 UDP 애플리케이션이 TCP와 똑같은 보장을 다시 구현해야 하는 것은 아니다. 실시간 음성·영상처럼 **오래된 데이터를 늦게 복구하는 것보다 지금의 데이터를 계속 받는 편이 중요한 경우**에는 일부 손실을 허용하는 설계가 더 적합할 수 있다.

반대로 모든 메시지를 빠짐없이 처리해야 한다면 상위 프로토콜에서 다음과 같은 상태가 필요해질 수 있다.

- 시퀀스 번호로 순서를 식별한다.
- ACK로 수신 여부를 알린다.
- 타임아웃 뒤 필요한 메시지를 재전송한다.
- 이미 처리한 메시지 ID를 기억해 중복 적용을 막는다.

이런 기능을 추가할수록 복구 능력은 높아지지만 상태·타이머·메모리·재시도 정책이 함께 늘어난다.

### UDP를 `빠르지만 불안정한 TCP`라고 보면 안 된다

UDP는 TCP의 기능을 덜 정확하게 구현한 프로토콜이 아니다. **데이터그램 전달이라는 더 작은 계약을 제공하고, 그 위에서 어떤 신뢰성이 필요한지는 상위 프로토콜이 정하도록 한 전송 방식**이다.

따라서 UDP를 선택할 때는 단순히 `빠르다`가 아니라 손실·재정렬·중복이 실제 업무에 어떤 영향을 주며 어떤 복구를 직접 책임질 것인지 판단해야 한다.
