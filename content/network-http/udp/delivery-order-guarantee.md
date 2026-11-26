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

UDP는 데이터그램을 독립적으로 전송합니다. UDP 자체는 데이터그램이 도착했는지 확인하거나 유실된 데이터그램을 다시 보내는 연결형 복구 상태를 유지하지 않습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "UDP 전달과 순서 보장",
  "description": "개념의 기술적 관계와 상태를 검증된 고정 예제로 보여줍니다.",
  "example": "delivery-order-guarantee"
}
```

그림처럼 D1, D2, D3을 순서대로 보내더라도 일부가 유실되거나 D3이 D2보다 먼저 도착할 수 있습니다. 중복 데이터그램도 발생할 수 있습니다. 그림의 순서는 가능한 사례이지 UDP가 정해 놓은 수신 규칙이 아닙니다.

### 필요한 신뢰성을 선택합니다

실시간 음성·영상에서는 오래된 데이터를 기다리기보다 최신 데이터를 처리하는 편이 적합할 수 있습니다. 반대로 모든 메시지가 필요한 경우 상위 프로토콜이 메시지 ID, ACK, 타임아웃, 재전송과 순서 처리 정책을 관리해야 합니다. 복구를 추가할수록 상태와 메모리, 지연 및 혼잡 제어 비용이 늘어납니다.

UDP는 TCP보다 항상 빠른 전송 방식이 아니라 데이터그램이라는 더 작은 전달 계약을 제공합니다. 사용 사례의 손실 허용 범위와 지연 요구에 따라 선택합니다.
