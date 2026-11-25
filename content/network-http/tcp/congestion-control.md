---
kind: concept
contentKey: network-http.core.tcp.congestion-control
topicContentKey: network-http.core.tcp
slug: congestion-control
title: "TCP 혼잡 제어"
summary: "송신 측이 손실·ACK 진행 등 네트워크 상태를 바탕으로 혼잡 윈도(cwnd)를 조절해 경로에 내보내는 데이터 양을 제한하는 목적을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc5681"
    title: "TCP Congestion Control"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 혼잡 제어의 slow start·congestion avoidance와 혼잡 윈도 조절 규칙을 확인한다."
    displayOrder: 1
---
# TCP 혼잡 제어

수신 버퍼가 충분하더라도 여러 연결이 공유하는 네트워크 경로에는 처리량 한계가 있습니다. 송신 측이 너무 많은 데이터를 한꺼번에 보내면 큐가 길어지고 지연이나 손실이 증가할 수 있습니다. TCP 혼잡 제어는 이러한 상황을 고려해 송신 측의 전송량을 조절합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "TCP 혼잡 제어",
  "description": "개념의 기술적 관계와 상태를 검증된 고정 예제로 보여줍니다.",
  "example": "congestion-control"
}
```

### 흐름 제어와 혼잡 제어를 구분합니다

rwnd는 수신 측이 광고하는 수신 윈도이며 버퍼 수용 가능 범위를 제한합니다. cwnd는 송신 측이 유지하는 혼잡 윈도로 네트워크의 혼잡 상태에 따라 조절됩니다. 단순한 정상 전송 예에서 rwnd가 800B, cwnd가 400B이고 이미 확인되지 않은 데이터가 200B라면 추가 전송 여유는 min(800, 400) - 200 = 200B입니다. 손실 복구, 전송 제한, 실제 버퍼 등은 별도 고려 사항입니다.

### 전송량은 고정되지 않습니다

RFC 5681은 슬로 스타트, 혼잡 회피, 빠른 재전송 및 빠른 복구를 정의합니다. 실제 운영체제에서 사용하는 혼잡 제어 알고리즘은 CUBIC 등 서로 다를 수 있고, 혼잡 신호로 손실이나 ECN을 활용하는 방식도 다릅니다. 한 알고리즘의 cwnd 증가 공식을 모든 TCP 구현의 보장으로 설명하면 안 됩니다.

장애 분석에서는 처리량만 보는 대신 RTT의 변화, 패킷 손실·재전송, 송신 큐, rwnd 및 cwnd의 관찰 결과를 함께 비교합니다. 수신 애플리케이션의 처리 병목을 네트워크 혼잡으로 오해하면 올바른 개선 지점을 찾기 어렵습니다.
