---
kind: concept
contentKey: network-http.core.tcp.retransmission
topicContentKey: network-http.core.tcp
slug: retransmission
title: "TCP Retransmission"
summary: "loss 판단 후 unacknowledged data를 다시 보내는 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc6298"
    title: "Computing TCP's Retransmission Timer"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP timeout과 retransmission 판단을 확인한다."
    displayOrder: 2
---
# TCP Retransmission

TCP는 보낸 data가 확인되지 않았을 때 필요한 byte 범위를 다시 보내 **loss가 application byte stream에 그대로 드러나지 않도록** 복구한다. 대표적인 trigger는 retransmission timer 만료이고, duplicate ACK 같은 loss signal을 이용해 timeout보다 먼저 retransmit하는 방식도 있다.

### RTO가 만료되면 확인되지 않은 data를 다시 보낸다

Sender는 ACK가 오지 않은 data에 대해 retransmission timer를 관리한다. RTO가 만료되면 가장 앞선 unacknowledged data를 다시 보내고, 반복 timeout에서는 더 보수적으로 기다리도록 timeout을 backoff한다.

```text
send bytes
   ↓
ACK 대기
   ├─ ACK 도착 → progress
   └─ RTO 만료 → retransmit
```

### Retransmission은 duplicate application data를 만들지 않는다

Receiver는 sequence number를 기준으로 이미 받은 byte와 새 byte를 구분한다. 같은 sequence 범위가 retransmit되어도 TCP stream에는 동일 byte가 두 번 추가되지 않는다.

다만 이것은 **transport byte stream의 중복 처리**다. TCP retransmission이 application request의 exactly-once 실행을 보장하는 것은 아니다. Application이 별도 요청을 다시 보내는 retry와 TCP 내부 retransmission은 서로 다른 동작이다.

Retransmission의 핵심은 **ACK와 loss signal을 바탕으로 확인되지 않은 byte 범위를 다시 전송해 reliable ordered stream을 유지하는 것**이다.
