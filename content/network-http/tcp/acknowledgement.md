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

TCP ACK는 receiver가 다음에 기대하는 sequence position을 알려 sender가 어느 prefix를 받았다고 판단할지 돕는다. cumulative ACK는 연속으로 받은 범위를 표현하며, ACK를 받았다고 remote application이 bytes를 처리했다는 의미는 아니다.

delayed ACK, duplicate ACK, selective acknowledgement은 loss와 out-of-order 상태를 sender가 추론하는 단서가 된다. ACK 자체의 전송 지연과 application response 지연을 구분한다.

### Backend 연결

write 반환과 peer application 처리 완료를 동일한 성공으로 기록하지 않는다. 중요한 command는 response·commit acknowledgement 같은 application-level confirmation이 필요하다.
