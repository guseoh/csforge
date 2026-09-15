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

TCP close sequence가 끝난 직후 일부 endpoint는 바로 connection state를 완전히 버리지 않고 **TIME_WAIT 상태로 일정 시간 유지**한다. 이 상태는 단순한 낭비가 아니라 이전 connection의 지연 segment와 close handshake를 안전하게 처리하기 위한 correctness mechanism이다.

### 마지막 ACK를 다시 보낼 수 있어야 한다

Active closer가 peer의 FIN에 대한 마지막 ACK를 보냈는데 그 ACK가 유실되면 peer는 FIN을 다시 보낼 수 있다. TIME_WAIT 상태가 남아 있으면 endpoint는 같은 FIN을 다시 인식하고 ACK를 재전송할 수 있다.

```text
peer FIN
  ↓
last ACK 전송 ──X 유실
  ↓
TIME_WAIT 유지
  ↓
peer FIN 재전송
  ↓
ACK 다시 전송
```

### 오래된 segment와 새 connection을 구분한다

Network에 지연되어 있던 이전 connection의 segment가 뒤늦게 도착할 수 있다. 동일한 endpoint tuple을 너무 빨리 새 connection에 재사용하면 이런 segment가 새 connection state와 혼동될 위험이 있다. TIME_WAIT는 충분한 시간이 지나 old segment가 사라질 기회를 준다.

RFC 9293의 전통적인 모델에서는 TIME_WAIT가 2 MSL 동안 유지된다. 구체적인 구현 최적화는 있을 수 있지만, 핵심 목적은 **마지막 close ACK의 신뢰성과 이전 connection의 지연 segment 격리**다.

TIME_WAIT의 핵심은 **종료된 connection의 transport state를 잠시 보존해 close handshake와 delayed segment를 안전하게 처리하는 것**이다.
