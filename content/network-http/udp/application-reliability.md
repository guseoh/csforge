---
kind: concept
contentKey: network-http.core.udp.application-reliability
topicContentKey: network-http.core.udp
slug: application-reliability
title: "Application Reliability over UDP"
summary: "sequence·ACK·retry를 application이 직접 설계할 때의 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc768"
    title: "User Datagram Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP datagram과 application reliability 경계를 확인한다."
    displayOrder: 1
---
# Application Reliability over UDP

UDP 위에서 reliable command를 만들려면 message ID/sequence, ACK, timeout, retry와 duplicate suppression을 양 끝 protocol state에 추가해야 한다. 순서가 필요하면 ordering buffer와 missing-range recovery도 필요하고, 대량 retry를 제어하려면 congestion/rate control과 backpressure가 필요하다. security authentication/encryption까지 포함하면 작은 datagram API가 독자적인 transport protocol로 커진다.

모든 message를 재전송하지 않고 최신 상태만 보내거나 loss를 허용하는 설계도 가능하다. 반대로 retry가 ACK 손실과 구분되지 않으면 server가 같은 command를 두 번 실행할 수 있으므로, ID와 deduplication state의 보존 범위·만료·장애 복구를 정해야 한다. network가 결국 “exactly once execution”을 자동으로 만들어 주는 것은 아니며 business invariant와 storage transaction이 함께 필요하다.

이벤트 전달에서는 at-most-once, at-least-once와 application-level effect를 구분하고 consumer를 idempotent하게 만든다. network retry, ACK 전송과 DB transaction commit의 순서를 별도로 관찰해 “ACK를 받았지만 저장되지 않음” 또는 “저장됐지만 ACK가 유실됨” 상태를 복구할 수 있게 한다.

