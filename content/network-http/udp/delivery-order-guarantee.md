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

UDP 자체는 datagram이 목적지에 도착했는지, 순서가 맞는지, 한 번만 도착했는지를 확인하지 않는다. checksum이 오류를 검출할 수 있어도 누락된 message를 재전송하거나 순서를 복구하지는 않는다.

필요하면 application이 sequence, ACK, timeout, deduplication을 추가해야 한다. 이 기능을 넣으면 사실상 별도의 transport protocol이 되므로 congestion과 fairness까지 설계 범위를 넓힌다.

### Backend 연결

UDP telemetry는 일부 손실을 허용할 수 있지만 학습 결과 저장은 허용하지 않을 수 있다. 데이터별 durability 요구에 맞는 transport를 선택하고 loss metric을 숨기지 않는다.

