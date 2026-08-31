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

UDP 위에서 reliability가 필요하면 message ID/sequence, ACK, timeout, retry, duplicate suppression, ordering buffer를 application protocol에 넣는다. sender와 receiver의 state가 함께 커지고, retry가 congestion과 duplicate effect를 만들 수 있다.

모든 message를 재전송하지 않고 최신 상태만 보내거나 loss를 허용하는 설계도 가능하다. 어떤 message가 유실·중복·지연되어도 invariant를 유지하는지 먼저 정의한다.

### Backend 연결

이벤트 전달에서 at-least-once와 at-most-once를 구분하고 consumer를 idempotent하게 만든다. 네트워크 retry와 DB transaction의 commit 순서를 분리해 관찰한다.

