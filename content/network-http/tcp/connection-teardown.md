---
kind: concept
contentKey: network-http.core.tcp.connection-teardown
topicContentKey: network-http.core.tcp
slug: connection-teardown
title: "Connection Teardown"
summary: "FIN·ACK 교환과 half-close 상태를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# Connection Teardown

TCP endpoint는 FIN으로 자신의 송신 stream에 더 보낼 byte가 없음을 알리고, peer는 ACK 후 자신의 방향을 별도로 닫을 수 있다. 한 endpoint가 FIN을 보낸 뒤에도 반대 방향의 data를 읽을 수 있으므로 half-close는 양방향 connection 전체 종료와 다르다. 양쪽 FIN과 ACK 교환이 끝나고 state machine이 정리되어야 full close가 완료된다.

RST는 orderly EOF가 아니라 abort 또는 현재 state에 맞지 않는 segment를 거부하는 신호가 될 수 있어, 아직 buffer에 있던 data가 폐기될 수 있다. FIN을 받았다는 것은 peer stream의 EOF를 관찰했다는 뜻이지 peer application이 모든 bytes를 business 처리했다는 뜻은 아니다. application은 transport EOF/RST와 message completeness·commit 상태를 분리한다.

HTTP keep-alive pool은 peer FIN/RST와 idle timeout을 감지해 해당 socket을 eviction하고, response body를 framing에 맞게 모두 읽거나 명시적으로 닫은 뒤에만 connection을 재사용한다. body를 다 읽지 않고 pool에 반환하면 남은 bytes가 다음 request의 response로 해석될 수 있다.
