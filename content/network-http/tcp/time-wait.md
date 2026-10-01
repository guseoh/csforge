---
kind: concept
contentKey: network-http.core.tcp.time-wait
topicContentKey: network-http.core.tcp
slug: time-wait
title: "TIME_WAIT 상태"
summary: "지연된 세그먼트와 마지막 ACK 재전송을 처리하기 위해 연결 상태를 잠시 유지하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 110
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
---
# TIME_WAIT 상태

TCP 연결 종료가 끝난 직후 능동 종료(active close)를 수행한 쪽은 연결 정보를 바로 완전히 버리지 않고 **TIME_WAIT 상태로 일정 시간 유지**할 수 있다. 이 상태는 단순히 소켓을 낭비하는 것이 아니라 이전 연결의 지연된 세그먼트와 마지막 종료 ACK를 안전하게 처리하기 위한 장치다.

### 마지막 ACK를 다시 보낼 수 있어야 한다

능동 종료 측이 상대의 FIN에 대한 마지막 ACK를 보냈는데 그 ACK가 유실됐다고 하자. 상대는 ACK를 받지 못했으므로 FIN을 다시 보낼 수 있다. TIME_WAIT 상태가 남아 있으면 같은 연결의 FIN임을 알아보고 마지막 ACK를 다시 보낼 수 있다.

```text
상대 FIN
  ↓
마지막 ACK 전송 ──X 유실
  ↓
TIME_WAIT 유지
  ↓
상대 FIN 재전송
  ↓
ACK 다시 전송
```

### 이전 연결의 늦은 세그먼트가 새 연결에 섞이는 것을 막는다

네트워크에는 이전 연결에서 늦게 도착하는 세그먼트가 남아 있을 수 있다. 같은 IP·포트 조합을 너무 빨리 새 연결에 재사용하면 이런 오래된 세그먼트가 새 연결의 데이터처럼 보일 위험이 생긴다. TIME_WAIT은 충분한 시간이 지나 이전 연결의 세그먼트가 사라질 기회를 준다.

RFC 9293의 전통적인 모델에서는 TIME-WAIT을 2 MSL 동안 유지한다. 실제 운영체제에는 자원 관리와 재사용을 위한 구현별 최적화가 있을 수 있으므로 특정 OS의 관찰값을 TCP 전체의 고정 보장처럼 일반화하면 안 된다.

따라서 TIME_WAIT가 많다는 이유만으로 무조건 비정상이라고 볼 수 없다. 짧은 연결을 지나치게 많이 생성하는지, 어느 쪽이 능동 종료를 맡는지, 연결 재사용이 가능한지를 함께 봐야 한다. **TIME_WAIT는 종료된 연결의 전송 상태를 잠시 보존해 마지막 ACK와 늦은 세그먼트를 안전하게 처리하는 상태다.**
