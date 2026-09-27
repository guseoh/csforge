---
kind: concept
contentKey: network-http.core.tcp.retransmission
topicContentKey: network-http.core.tcp
slug: retransmission
title: "재전송"
summary: "손실을 판단한 뒤 확인되지 않은 바이트를 다시 보내는 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 재전송이 전송 계층 복구이고 애플리케이션 요청 재시도와 다른 동작임을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc6298"
    title: "Computing TCP's Retransmission Timer"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 재전송 타이머와 RTO 계산 원칙을 확인한다."
    displayOrder: 2
---
# 재전송

TCP는 보낸 바이트가 확인되지 않았을 때 필요한 범위를 다시 보내 손실을 복구한다. 이 덕분에 아래 애플리케이션은 개별 IP 패킷 손실을 직접 처리하기보다 **순서가 보장된 바이트 스트림**을 사용할 수 있다.

대표적인 재전송 계기는 재전송 타이머 만료다. 또한 중복 ACK 같은 손실 신호를 이용해 타이머가 끝나기 전에 손실 가능성을 판단하는 방식도 있다.

### RTO가 만료되면 확인되지 않은 바이트를 다시 보낸다

송신 측은 아직 ACK를 받지 못한 데이터에 대해 재전송 타이머를 관리한다. RTO(Retransmission Timeout)가 만료되면 확인되지 않은 가장 앞쪽 데이터를 다시 보내고, 반복해서 타임아웃이 발생하면 무한히 같은 간격으로 보내지 않도록 대기 시간을 늘리는 backoff를 적용한다.

```text
바이트 전송
   ↓
ACK 대기
   ├─ ACK 도착 → 전송 진행
   └─ RTO 만료 → 미확인 바이트 재전송
```

### TCP 재전송은 애플리케이션 요청을 두 번 실행하는 것과 다르다

수신 측 TCP는 시퀀스 번호로 이미 받은 바이트와 새 바이트를 구분한다. 같은 시퀀스 범위가 다시 도착해도 애플리케이션 바이트 스트림에 동일한 데이터가 두 번 추가되는 방식으로 동작하지 않는다.

하지만 이것은 **전송 계층의 바이트 중복 처리**다. HTTP 클라이언트가 타임아웃 뒤 POST 요청 자체를 다시 보내면 서버 애플리케이션은 두 요청을 실제로 받을 수 있다. TCP 내부 재전송이 결제·주문 같은 업무 요청의 exactly-once 실행을 보장하지 않는 이유다.

따라서 TCP 재전송과 애플리케이션 재시도는 단위와 책임이 다르다. 전자는 신뢰할 수 있는 바이트 스트림을 만들기 위한 전송 계층 동작이고, 후자는 HTTP 메서드 의미·멱등성·업무 부수 효과를 고려해 애플리케이션이 결정하는 정책이다.
