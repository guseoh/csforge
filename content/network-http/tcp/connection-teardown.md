---
kind: concept
contentKey: network-http.core.tcp.connection-teardown
topicContentKey: network-http.core.tcp
slug: connection-teardown
title: "TCP 연결 종료"
summary: "TCP의 양방향 바이트 스트림을 FIN·ACK로 방향별 종료하고 정상 종료와 RST 중단을 구분하는 과정을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP FIN 상태 전이, half-close와 RST를 이용한 연결 중단 의미를 확인한다."
    displayOrder: 1
---
# TCP 연결 종료

TCP 연결은 양방향 바이트 스트림이므로 **A→B 전송 종료와 B→A 전송 종료를 따로 처리할 수 있다.** 한쪽이 더 보낼 바이트가 없으면 FIN을 보내 자신의 송신 방향 끝을 알리고 상대는 ACK로 이를 확인한다.

```text
A ── FIN ──> B   A → B 방향의 바이트 스트림 종료
A <─ ACK ─── B

B → A 방향은 아직 데이터 전송 가능

A <─ FIN ─── B   B → A 방향도 종료
A ── ACK ──> B
```

이처럼 한 방향의 송신만 끝나고 반대 방향은 열려 있는 상태를 half-close라고 한다.

### FIN은 `지금까지의 바이트 뒤에 더 이상 보낼 데이터가 없다`는 의미다

FIN은 정상적인 바이트 스트림 끝을 표현한다. 수신 측은 FIN보다 앞선 데이터가 정상적으로 전달된 뒤 EOF를 관찰할 수 있다. FIN도 TCP 시퀀스 공간을 한 위치 사용하므로 ACK 계산에 반영된다.

### RST는 정상적인 FIN 종료와 다르다

RST는 현재 연결 상태를 즉시 중단(abort)하는 신호다. 존재하지 않는 연결로 세그먼트가 왔거나 애플리케이션·운영체제가 연결을 즉시 포기하는 등 여러 상황에서 사용될 수 있다.

RST를 FIN과 같은 `정상 EOF`로 취급하면 애플리케이션이 아직 읽지 못한 데이터나 오류 상태를 놓칠 수 있다.

### TCP EOF는 업무 처리 완료 신호가 아니다

상대의 FIN을 받았다는 것은 상대 TCP가 그 방향으로 더 이상 바이트를 보내지 않겠다는 뜻이다. 주문이 데이터베이스에 commit됐거나 파일 저장이 성공했다는 뜻은 아니다.

핵심은 **TCP가 두 송신 방향을 독립적으로 종료할 수 있고, FIN 기반 정상 종료와 RST 기반 즉시 중단은 의미가 다르다는 점**이다.
