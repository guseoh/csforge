---
kind: concept
contentKey: network-http.core.udp.delivery-order-guarantee
topicContentKey: network-http.core.udp
slug: delivery-order-guarantee
title: "UDP Delivery and Order Guarantee"
summary: "UDP가 delivery·ordering·duplicate 제거를 보장하지 않는 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc768"
    title: "User Datagram Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP datagram과 application reliability 경계를 확인한다."
    displayOrder: 1
---
# UDP Delivery and Order Guarantee

UDP 자체는 datagram이 목적지에 도착했는지, 전송 순서가 맞는지, duplicate가 제거됐는지를 확인하지 않는다. checksum이 전송 중 일부 오류를 검출해 손상된 datagram을 폐기하는 데 도움을 줘도, 누락된 datagram을 재전송하거나 뒤늦게 온 datagram을 정렬하는 state는 만들지 않는다. 도착한 datagram이 있다는 사실도 peer application이 그것을 처리했다는 뜻이 아니다.

최신 상태만 필요하면 sequence나 timestamp로 stale update를 버리고 손실을 허용할 수 있다. 반대로 모든 command가 필요하면 application이 sequence/message ID, ACK, timeout, retry와 deduplication을 추가해야 한다. ordering buffer를 넣으면 지연이 증가하고, retry를 넣으면 congestion·fairness·duplicate side effect까지 설계 범위가 넓어진다.

UDP telemetry는 일부 손실과 reorder를 허용할 수 있지만 attempt나 결제 command 저장은 그렇지 않을 수 있다. data별 freshness·durability·processing semantics를 먼저 정의한 뒤 transport를 선택하고, loss·duplicate·late sample metric을 숨기지 않는다.

