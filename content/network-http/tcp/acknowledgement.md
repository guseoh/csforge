---
kind: concept
contentKey: network-http.core.tcp.acknowledgement
topicContentKey: network-http.core.tcp
slug: acknowledgement
title: "TCP Acknowledgement"
summary: "receiver가 다음 기대 byte를 알려 delivery progress를 확인하는 ACK를 설명한다."
level: 1
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

TCP ACK의 acknowledgment number는 receiver가 다음에 기대하는 sequence position을 나타낸다. 일반적인 cumulative ACK는 그 위치보다 앞선 연속 byte를 받았다는 뜻이므로, 중간 byte가 빠지면 뒤 segment가 도착해도 같은 expected position을 반복해서 알릴 수 있다. SACK option이 협상된 경우에는 receiver가 추가로 받은 비연속 범위를 선택적으로 알려 sender의 loss 판단을 돕는다.

delayed ACK는 매 segment마다 즉시 답하지 않을 수 있고, duplicate ACK는 out-of-order나 missing range의 단서가 될 수 있지만 ACK 도착만으로 remote application의 처리나 business commit을 증명하지는 못한다. ACK 지연, TCP retransmission과 application response 지연을 서로 다른 시간으로 관찰한다.

Backend에서 socket `write()` 반환은 local kernel이 bytes를 받아들였다는 경계에 가깝고, peer TCP가 ACK했다는 사실도 controller가 command를 처리했다는 뜻은 아니다. 중요한 명령은 protocol response나 commit acknowledgement 같은 application-level confirmation을 별도로 요구한다.
