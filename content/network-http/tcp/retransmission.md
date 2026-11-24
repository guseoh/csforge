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
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc6298"
    title: "Computing TCP's Retransmission Timer"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 재전송 타이머와 RTO 계산 규칙을 확인한다."
    displayOrder: 2
---
# 재전송

IP 네트워크에서 데이터가 손실되면 TCP는 확인되지 않은 바이트를 다시 보내 순서 있는 스트림의 전달을 복구할 수 있습니다.

![TCP RTO 만료와 재전송: 1000~1499 바이트가 손실되어 ACK가 없고 RTO 만료 시 같은 범위를 재전송한다. 수신 측의 누적 ACK는 1500이다.](/learning/network-http/tcp-retransmission.svg)

예시에서 SEQ 1000의 500바이트가 손실됩니다. RTO가 만료되면 송신 측은 해당 범위를 다시 전송합니다. 수신 측에서 1000~1499를 연속적으로 받으면 누적 ACK는 1500으로 진행합니다.

### 손실 복구의 계기

RFC 6298의 재전송 타이머는 RTT와 변동을 고려하며 반복 만료 시 백오프를 적용합니다. 중복 ACK와 SACK 등의 신호로 타이머 만료 전에 복구를 시작할 수도 있습니다. ACK가 오지 않았다고 데이터가 반드시 손실된 것은 아닙니다. 데이터는 도착했지만 ACK만 손실되었을 수 있습니다.

수신 TCP는 시퀀스 번호로 이미 받은 바이트를 구분하여 동일한 범위를 애플리케이션 스트림에 중복 전달하지 않습니다.

### 요청 재시도와 구분

HTTP 클라이언트가 타임아웃 뒤 POST 요청을 새로 보내면 별도의 애플리케이션 요청이 됩니다. TCP의 바이트 중복 제거는 업무 요청의 멱등성이나 외부 결제의 정확히 한 번 실행을 제공하지 않습니다.
