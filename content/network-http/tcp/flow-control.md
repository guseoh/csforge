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
    recommendation: "TCP 수신 윈도와 송신 측이 수신자가 광고한 윈도를 따르는 흐름 제어 규칙을 확인한다."
    displayOrder: 1
---
# TCP 흐름 제어

TCP 흐름 제어(flow control)는 **송신 측이 수신 측 버퍼가 감당할 수 있는 양보다 지나치게 많은 데이터를 밀어 넣지 않도록** 제한하는 기능이다. 수신 측은 ACK에 수신 윈도(receive window, `rwnd`)를 실어 자신이 추가로 받을 수 있는 바이트 범위를 알린다.

수신 애플리케이션이 소켓 데이터를 충분히 빨리 읽지 않으면 운영체제의 TCP 수신 버퍼 여유가 줄어든다. 그러면 광고하는 `rwnd`도 작아질 수 있고 송신 측은 그 범위를 넘겨 새 데이터를 계속 보내지 않는다.

```text
수신 애플리케이션이 빠르게 읽음
→ 수신 버퍼 여유 큼
→ rwnd 큼
→ 송신 측이 더 많은 데이터를 미확인 상태로 보낼 수 있음

수신 애플리케이션이 느림
→ 수신 버퍼 여유 감소
→ rwnd 감소
→ 송신 측 전송 제한
```

### 흐름 제어와 혼잡 제어가 보호하는 대상은 다르다

흐름 제어는 **한 수신 호스트의 버퍼와 소비 속도**를 보호한다. 혼잡 제어는 라우터 큐·공유 링크 같은 **네트워크 경로의 혼잡**을 고려한다.

따라서 수신 애플리케이션이 매우 빨라도 네트워크가 혼잡하면 `cwnd` 때문에 전송이 제한될 수 있다. 반대로 네트워크가 한가해도 수신 애플리케이션이 데이터를 읽지 않으면 `rwnd`가 작아져 전송이 멈출 수 있다.

### 수신 윈도가 0이 되는 경우도 있다

수신 버퍼에 여유가 없으면 0 윈도를 광고할 수 있다. 송신 측은 수신자가 다시 공간을 확보했는지 확인하기 위한 TCP 절차를 사용하며, 애플리케이션 관점에서는 연결이 살아 있어도 데이터 진행이 멈춘 것처럼 보일 수 있다.

핵심은 **흐름 제어가 수신 측의 버퍼 여유를 `rwnd`로 전달해 송신 측의 미확인 데이터 양을 제한하는 전송 계층 메커니즘**이라는 점이다.
