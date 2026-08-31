---
kind: concept
contentKey: network-http.core.tcp.time-wait
topicContentKey: network-http.core.tcp
slug: time-wait
title: "TIME_WAIT"
summary: "지연 segment와 마지막 ACK 재전송을 처리하기 위해 기다리는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 110
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# TIME_WAIT

active closer가 일정 시간 TIME_WAIT에 머무는 것은 지연된 segment가 새 connection state와 섞이지 않게 하고 마지막 ACK를 재전송할 기회를 남기기 위해서다. 이는 단순한 resource leak가 아니라 TCP correctness를 위한 상태다.

짧은 연결을 대량으로 만들면 ephemeral port와 socket state가 누적되어 connect 실패가 나타날 수 있다. keep-alive와 connection reuse는 handshake뿐 아니라 TIME_WAIT pressure도 줄일 수 있다.

### Backend 연결

load test에서 TIME_WAIT 수가 많다고 무조건 kernel timeout을 줄이지 않는다. client/server 중 active closer, connection reuse, NAT state와 실제 port exhaustion을 먼저 확인한다.
