---
kind: concept
contentKey: network-http.core.tcp.sequence-number
topicContentKey: network-http.core.tcp
slug: sequence-number
title: "TCP 시퀀스 번호"
summary: "TCP가 패킷 개수가 아니라 바이트 위치를 시퀀스 번호로 추적해 순서·중복·손실 구간을 판단하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
---
# TCP 시퀀스 번호

TCP 시퀀스 번호는 `몇 번째 패킷인가`를 세는 번호가 아니라 **TCP 바이트 스트림에서 이 데이터가 어느 위치에 놓이는가**를 나타낸다. 수신 측은 이 번호를 이용해 어떤 바이트가 도착했고, 어느 범위가 비어 있으며, 재전송된 데이터가 이미 받은 범위와 겹치는지 판단한다.

예를 들어 시퀀스 번호 1000에서 시작하는 세그먼트가 데이터 500바이트를 담고 있다면 이 세그먼트가 차지하는 바이트 위치는 1000~1499이고 다음 새 바이트는 1500부터 시작한다.

```text
seq = 1000, data length = 500

1000 ........................ 1499
[          500 bytes            ]

next sequence = 1500
```

### 네트워크 도착 순서와 애플리케이션 전달 순서는 다를 수 있다

네트워크에서는 뒤쪽 세그먼트가 먼저 도착할 수 있다. 수신 TCP는 구현에 따라 순서가 뒤바뀐 데이터를 보관할 수 있지만, 앞쪽 바이트가 빠져 있으면 그 빈 구간을 건너뛰어 뒤 바이트를 순서 있는 스트림으로 애플리케이션에 전달할 수 없다.

```text
도착: 1000~1499, 2000~2499
누락: 1500~1999

애플리케이션 전달은 1500~1999 복구를 기다림
```

누락 구간이 재전송으로 채워지면 연속된 바이트 범위를 앞으로 전달할 수 있다. 같은 시퀀스 범위가 중복 도착해도 애플리케이션 스트림에 같은 바이트를 다시 추가하지 않도록 시퀀스 공간으로 구분한다.

### SYN과 FIN도 시퀀스 공간을 소비한다

TCP의 SYN과 FIN은 데이터 바이트는 아니지만 각각 시퀀스 공간에서 한 위치를 사용한다. 그래서 핸드셰이크·종료 과정의 ACK 번호를 계산할 때 단순히 데이터 길이만 더하면 맞지 않을 수 있다.

시퀀스 번호의 핵심은 **TCP가 패킷이 아니라 바이트 스트림의 위치를 추적해 순서 복원, 중복 제거, 재전송 판단을 가능하게 한다는 점**이다.
