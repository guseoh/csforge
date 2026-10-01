---
kind: concept
contentKey: network-http.core.tcp.sliding-window
topicContentKey: network-http.core.tcp
slug: sliding-window
title: "슬라이딩 윈도"
summary: "TCP가 ACK 하나를 기다릴 때마다 멈추지 않고 여러 바이트 범위를 전송한 뒤 ACK 진행에 맞춰 전송 가능한 범위를 이동시키는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc5681"
    title: "TCP Congestion Control"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 혼잡 제어의 slow start·congestion avoidance와 혼잡 윈도 조절 규칙을 확인한다."
    displayOrder: 2
---
# 슬라이딩 윈도

TCP가 바이트 하나나 세그먼트 하나를 보낸 뒤 매번 ACK 하나를 기다리는 정지 후 대기(stop-and-wait) 방식만 사용한다면 왕복 시간이 긴 네트워크에서 전송 효율이 매우 낮아진다. TCP는 **일정한 바이트 범위를 ACK 전에 여러 개 전송해 미확인 상태로 둘 수 있고, ACK가 진행되면 전송 가능한 범위를 앞으로 이동**시킨다.

```text
시퀀스 공간

[ 확인 완료 ][ 보냈지만 미확인 ][ 새로 보낼 수 있음 ][ 아직 제한됨 ]
                  ↑ ACK 진행
        윈도의 왼쪽 경계가 앞으로 이동
```

### 윈도는 패킷 개수가 아니라 바이트 범위다

세그먼트마다 크기가 달라도 TCP는 시퀀스 번호를 기준으로 어떤 바이트가 확인됐고 어떤 바이트가 아직 미확인인지 추적한다. 따라서 `윈도 10 = 패킷 10개`처럼 단순화하면 안 된다.

### 실제로 새로 보낼 수 있는 양은 여러 제한을 동시에 받는다

대표적으로 다음 두 값이 중요하다.

- `rwnd`: 수신 측 버퍼가 얼마나 더 받을 수 있는지 광고한 수신 윈도
- `cwnd`: 네트워크 혼잡 상태를 고려해 송신 측이 관리하는 혼잡 윈도

송신 측은 수신자의 처리 능력과 네트워크 혼잡을 모두 넘지 않도록 전송량을 제한한다. 흔히 실제 미확인 데이터의 상한을 `min(rwnd, cwnd)` 관점으로 이해할 수 있다.

### ACK가 진행되면 새로운 바이트 범위를 보낼 수 있다

수신 측의 누적 ACK가 앞으로 이동하면 이전에 미확인 상태였던 바이트가 확인되고, 그만큼 윈도의 오른쪽에서도 새 데이터를 보낼 여지가 생긴다. 이 때문에 왕복마다 한 세그먼트만 보내는 것보다 링크를 더 효율적으로 사용할 수 있다.

핵심은 **TCP 슬라이딩 윈도가 여러 바이트 범위를 동시에 전송 중 상태로 유지하고 ACK 진행에 따라 사용 가능한 시퀀스 범위를 앞으로 이동시키는 방식**이라는 점이다.
