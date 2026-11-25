---
kind: concept
contentKey: network-http.core.tcp.sliding-window
topicContentKey: network-http.core.tcp
slug: sliding-window
title: "슬라이딩 윈도"
summary: "TCP가 ACK 하나를 기다릴 때마다 멈추지 않고 여러 바이트 범위를 전송한 뒤 ACK 진행에 맞춰 전송 가능한 범위를 이동시키는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc5681"
    title: "TCP Congestion Control"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 혼잡 제어의 slow start·congestion avoidance와 혼잡 윈도 조절 규칙을 확인한다."
    displayOrder: 2
---
# 슬라이딩 윈도

송신자가 데이터를 조금 보낼 때마다 ACK를 기다리면 왕복 시간이 긴 경로에서 효율이 낮아집니다. TCP는 일정 범위의 바이트를 확인 전에 전송하고 ACK의 진행에 따라 새 데이터를 보낼 범위를 이동시킵니다.

```csforge-viz
{
  "version": 1,
  "type": "network-core",
  "title": "TCP 누적 ACK와 슬라이딩 윈도",
  "description": "100바이트 단위 예시에서 ACK 1200 수신 전후 송신 가능 범위를 비교합니다. rwnd 400B·cwnd 충분·손실 없음으로 가정합니다.",
  "example": "tcp-sliding-window"
}
```

그림에서는 rwnd 400B가 유지되고 cwnd가 충분하며 손실이 없다고 가정합니다. 1000~1399를 전송한 상태에서 ACK 1200을 받으면 1000~1199가 확인됩니다. 1200~1399는 여전히 미확인이고 1400~1599를 새로 보낼 여유가 생깁니다.

### 윈도의 두 가지 제한

수신 측은 rwnd로 받을 수 있는 범위를 광고하고 송신 측은 cwnd로 혼잡 상황에 맞는 전송량을 제한합니다. 단순한 정상 전송에서는 min(rwnd, cwnd)에서 이미 비행 중인 데이터를 뺀 값을 추가 전송 여유로 이해할 수 있습니다. 실제 손실 복구와 윈도 변경은 더 복잡할 수 있습니다.

윈도는 패킷의 개수가 아닌 바이트 범위입니다. ACK가 진행해도 수신 윈도나 혼잡 윈도가 줄면 동일한 양의 새 데이터가 항상 허용되는 것은 아닙니다.
