---
kind: concept
contentKey: network-http.core.tcp.acknowledgement
topicContentKey: network-http.core.tcp
slug: acknowledgement
title: "TCP Acknowledgement"
summary: "누적 ACK가 다음 기대 byte를 나타내는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# TCP Acknowledgement

TCP ACK의 acknowledgment number는 receiver가 **다음에 받기를 기대하는 sequence number**를 나타낸다. 일반적인 cumulative ACK에서는 그보다 앞선 연속된 byte 범위를 이미 받았다는 뜻이다.

예를 들어 receiver가 sequence 1000부터 1499까지 연속된 500 byte를 받았다면 다음 기대 위치는 1500이다.

```text
received: 1000 ... 1499
ACK = 1500
```

### 중간에 gap이 있으면 ACK가 앞으로 나아가지 않는다

1000~1499를 받은 뒤 2000~2499가 먼저 도착하고 1500~1999가 빠져 있다면 cumulative ACK는 여전히 1500을 가리킬 수 있다. 뒤쪽 data가 도착했더라도 연속된 stream의 다음 기대 byte는 바뀌지 않았기 때문이다.

SACK(Selective Acknowledgment)이 협상된 경우에는 cumulative ACK 외에 이미 받은 비연속 범위를 추가로 알려 sender가 loss 위치를 더 정확히 판단하도록 도울 수 있다.

### ACK와 application 처리 성공은 다르다

TCP ACK는 transport receiver가 byte sequence를 받은 상태를 표현한다. Peer application이 해당 bytes를 parsing하거나 business state에 반영했다는 보장은 아니다.

Acknowledgement의 핵심은 **누적 ACK가 receiver가 연속해서 받은 byte 범위의 바로 다음 sequence를 알려 TCP delivery progress를 추적하게 한다는 것**이다.
