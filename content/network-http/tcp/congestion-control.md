---
kind: concept
contentKey: network-http.core.tcp.congestion-control
topicContentKey: network-http.core.tcp
slug: congestion-control
title: "TCP 혼잡 제어"
summary: "송신 측이 손실·ACK 진행 등 네트워크 상태를 바탕으로 혼잡 윈도(cwnd)를 조절해 경로에 내보내는 데이터 양을 제한하는 목적을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc5681"
    title: "TCP Congestion Control"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "slow start·congestion avoidance와 혼잡 윈도 조절의 표준 기본 동작을 확인한다."
    displayOrder: 1
---
# TCP 혼잡 제어

TCP 혼잡 제어(congestion control)는 **송신 측이 네트워크 경로에 지나치게 많은 미확인 데이터를 밀어 넣지 않도록 전송량을 조절하는 기능**이다. 흐름 제어가 수신자의 버퍼를 보호한다면 혼잡 제어는 여러 통신이 공유하는 라우터 큐와 링크의 과부하를 줄이는 데 초점을 둔다.

송신 측은 혼잡 윈도(congestion window, `cwnd`) 같은 상태를 유지하고 ACK 진행과 손실 신호 등을 바탕으로 얼마나 많은 데이터를 네트워크에 내보낼지 조절한다.

```text
ACK가 안정적으로 진행
      ↓
더 전송할 여지가 있다고 판단
      ↓
cwnd 증가 가능

손실·혼잡 신호
      ↓
전송량이 과할 가능성
      ↓
cwnd 감소
```

### `rwnd`와 `cwnd`는 같은 윈도가 아니다

- `rwnd`: 수신 측이 `내 버퍼에 이만큼 더 받을 수 있다`고 알리는 값
- `cwnd`: 송신 측이 `현재 네트워크에는 이 정도를 미확인 상태로 둘 수 있다`고 관리하는 값

실제 전송은 두 제한을 모두 만족해야 하므로 수신 버퍼가 넉넉해도 네트워크 혼잡 때문에 느려질 수 있고, 반대로 네트워크가 한가해도 수신 버퍼가 부족하면 흐름 제어에 막힐 수 있다.

### TCP 혼잡 제어는 하나의 고정 공식이 아니다

RFC 5681은 slow start, congestion avoidance 같은 기본 알고리즘을 정의하지만 실제 운영체제는 CUBIC 등 다른 혼잡 제어 알고리즘을 사용할 수 있다. 알고리즘마다 대역폭과 RTT, 손실에 반응하는 방식이 다를 수 있다.

따라서 장애 분석에서는 `TCP니까 전송률은 이렇게 변한다`고 하나의 공식으로 단정하기보다 **현재 운영체제의 알고리즘, RTT, 재전송, cwnd, 애플리케이션 동시성**을 함께 확인해야 한다.

핵심은 **혼잡 제어가 수신자 속도가 아니라 공유 네트워크 경로의 상태를 고려해 송신 측의 in-flight 데이터 양을 조절한다는 점**이다.
