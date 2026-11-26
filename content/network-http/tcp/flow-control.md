---
kind: concept
contentKey: network-http.core.tcp.flow-control
topicContentKey: network-http.core.tcp
slug: flow-control
title: "TCP 흐름 제어"
summary: "수신 측이 광고한 윈도(rwnd)로 자신의 버퍼 여유를 알리고 송신 측이 너무 많은 데이터를 보내지 않도록 제한하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
---
# TCP 흐름 제어

수신 애플리케이션이 데이터를 소비하는 속도보다 송신 속도가 빠르면 수신 버퍼가 부족해질 수 있습니다. TCP 흐름 제어는 수신 측이 받을 수 있는 시퀀스 범위를 광고하여 새 데이터 전송을 제한합니다.

### 수신 윈도(rwnd)

수신 측은 ACK 번호와 윈도 정보를 통해 송신 측에 수신 가능 범위를 알립니다. 애플리케이션이 소켓 데이터를 읽지 않으면 수신 버퍼의 여유가 감소하고 광고 윈도도 줄어들 수 있습니다. 광고 윈도와 실제 버퍼 크기는 OS의 버퍼 관리 정책 등에 따라 달라질 수 있으므로 항상 같은 값으로 보지 않습니다.

수신 윈도가 0이 되면 일반적인 새 데이터 전송은 진행할 수 없습니다. 송신 측은 zero-window probing 등으로 윈도 상태를 확인할 수 있습니다.

### 혼잡 제어와 비교

흐름 제어는 수신 호스트를, 혼잡 제어는 공유 경로의 과부하를 고려합니다. 실제 전송량은 rwnd와 송신 측의 cwnd 모두에 영향을 받습니다. 수신 앱이 멈췄다면 대역폭을 늘려도 문제가 해결되지 않을 수 있습니다.

장애에서는 수신 윈도, 소켓 버퍼, 애플리케이션의 읽기 루프 및 후속 처리 큐를 함께 관찰합니다.
