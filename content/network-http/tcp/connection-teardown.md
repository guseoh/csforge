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

TCP endpoint는 FIN으로 자신의 송신 stream 종료를 알리고 ACK를 받으며, 반대 방향은 별도로 닫을 수 있다. 따라서 한 방향 bytes가 끝났다고 양방향 connection 전체가 즉시 사라지는 것은 아니다.

RST는 비정상 종료나 존재하지 않는 state에 대한 거부를 나타낼 수 있고, FIN은 orderly close의 경계를 나타낸다. application이 close를 성공 응답으로 오인하지 않도록 이미 받은 bytes와 처리 상태를 분리한다.

### Backend 연결

HTTP keep-alive connection을 재사용할 때 peer FIN과 pool eviction을 처리한다. response body를 다 읽지 않고 connection을 반환하면 다음 request가 오염될 수 있다.
