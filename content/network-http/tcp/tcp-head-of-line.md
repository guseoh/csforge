---
kind: concept
contentKey: network-http.core.tcp.tcp-head-of-line
topicContentKey: network-http.core.tcp
slug: tcp-head-of-line
title: "TCP 전송 계층 HOL 차단"
summary: "앞선 바이트 범위의 손실이 복구될 때까지 뒤에 이미 도착한 바이트도 애플리케이션 전달을 기다리는 TCP HOL을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 120
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
---
# TCP 전송 계층 HOL 차단

TCP는 한 연결의 바이트를 **시퀀스 순서대로 애플리케이션에 전달하는 스트림**을 제공한다. 그래서 앞쪽 바이트 범위가 손실되면 그보다 뒤의 데이터가 네트워크에서 먼저 도착했더라도 누락 구간이 복구될 때까지 뒤 바이트를 애플리케이션에 먼저 넘길 수 없다.

```text
TCP 시퀀스
[A][B][손실][D][E]
        ↑
     빈 구간

D/E가 이미 도착해도
애플리케이션 전달은 빈 구간 복구를 기다림
```

이 현상을 TCP의 전송 계층 Head-of-Line(HOL) 차단으로 볼 수 있다.

### 수신 버퍼에 뒤 데이터가 있어도 순서 보장은 깨지지 않는다

TCP 구현은 순서가 뒤바뀌어 먼저 도착한 데이터를 수신 버퍼에 보관할 수 있다. 하지만 TCP가 애플리케이션에 약속하는 것은 순서 있는 바이트 스트림이므로 앞의 빈 구간을 뛰어넘어 뒤 바이트를 먼저 노출할 수 없다.

누락된 바이트가 재전송으로 도착하면 연속 범위가 만들어지고 그때 뒤 데이터까지 전달할 수 있다.

### HTTP/2 멀티플렉싱이 이 문제를 완전히 없애지는 못한다

HTTP/2는 여러 논리 스트림의 프레임을 한 TCP 연결 위에서 번갈아 전송해 HTTP/1.1의 응답 순서 제약을 줄인다. 하지만 결국 모든 HTTP/2 프레임 바이트가 **하나의 TCP 바이트 스트림**에 들어간다.

TCP 앞쪽 바이트가 손실되면 그 뒤에 배치된 다른 HTTP/2 스트림의 바이트도 TCP 전달 단계에서 함께 기다릴 수 있다. 이것이 HTTP/2에서 TCP 수준 HOL이 남는 이유다.

QUIC은 전송 계층부터 스트림별 순서 전달 상태를 분리해 한 스트림의 손실이 다른 스트림의 바이트 전달까지 같은 방식으로 막는 문제를 줄인다. 그렇다고 네트워크 혼잡이나 공유 대역폭 같은 연결 전체 자원 문제가 사라지는 것은 아니다.

핵심은 **TCP의 순서 보장이 앞선 누락 바이트를 복구할 때까지 뒤의 이미 도착한 바이트까지 애플리케이션 전달에서 기다리게 만든다는 점**이다.
