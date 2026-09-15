---
kind: concept
contentKey: network-http.core.tcp.flow-control
topicContentKey: network-http.core.tcp
slug: flow-control
title: "Flow Control"
summary: "receiver advertised window가 수신 buffer overflow를 막는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# Flow Control

TCP flow control은 sender가 receiver의 처리 능력보다 지나치게 빠르게 data를 보내 **receive buffer를 넘치게 하지 않도록** 조절하는 mechanism이다. Receiver는 ACK와 함께 자신이 추가로 받을 수 있는 byte 범위를 advertised receive window(`rwnd`)로 알린다.

Receiver application이 socket에서 data를 충분히 빠르게 읽지 않으면 receive buffer의 여유 공간이 줄고 `rwnd`도 작아질 수 있다. Sender는 그 범위를 넘겨 새 data를 계속 보내지 않고 receiver가 다시 공간을 확보할 때까지 기다린다.

```text
receiver buffer 여유 큼 → rwnd 큼 → 더 많은 data 허용
receiver buffer 여유 작음 → rwnd 작음 → sender 제한
```

### Flow control과 congestion control은 다르다

Flow control은 **한 receiver의 수신 capacity**를 보호한다. Network path의 router queue나 shared link가 혼잡한지는 congestion control이 다룬다. Receiver가 충분히 빠르더라도 network가 혼잡하면 `cwnd`가 sender를 제한할 수 있고, network가 여유 있어도 receiver가 느리면 `rwnd`가 제한할 수 있다.

Flow Control의 핵심은 **receiver가 advertised window로 자신의 receive-buffer 여유를 알려 sender의 outstanding data를 제한한다는 것**이다.
