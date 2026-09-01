---
kind: concept
contentKey: network-http.core.tcp.retransmission
topicContentKey: network-http.core.tcp
slug: retransmission
title: "TCP Retransmission"
summary: "loss나 timeout 뒤 segment를 다시 보내 reliable stream을 유지하는 방식을 설명한다."
level: 1
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
---
# TCP Retransmission

TCP sender는 ACK timer가 만료되거나 fast-retransmit 같은 loss 신호를 관찰하면 아직 확인되지 않은 sequence 범위의 segment를 다시 보낸다. receiver는 sequence와 overlap을 확인해 duplicate bytes를 stream에 한 번만 노출한다. 따라서 TCP retransmission은 packet 단위 중복을 숨기지만 application request를 한 번만 실행하는 기능은 아니다.

retransmission은 loss를 상위 계층에서 복구하는 대신 RTT와 bandwidth를 추가로 사용하고 congestion window를 줄일 수 있다. application timeout이 먼저 만료되면 client가 같은 logical request를 새 connection으로 다시 보낼 수 있으며, 이전 flow의 original request가 server에서 처리됐을 가능성도 남는다. TCP는 endpoint가 죽었거나 route가 끊긴 상황을 무한히 복구하지 않는다.

HTTP request timeout 뒤 즉시 재전송하지 말고 기존 flow가 response를 만들었는지와 error가 connect·write·read 중 어디서 났는지 구분한다. side effect가 있는 POST 등은 idempotency key나 application deduplication으로 replay를 보호하고, TCP retransmission과 application retry budget을 따로 둔다.
