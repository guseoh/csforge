---
kind: concept
contentKey: network-http.core.tcp.rto
topicContentKey: network-http.core.tcp
slug: rto
title: "재전송 타임아웃(RTO)"
summary: "TCP가 관측한 RTT와 변동성을 이용해 재전송을 기다릴 시간을 정하고 너무 이른 재전송과 느린 손실 복구 사이에서 균형을 잡는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6298"
    title: "Computing TCP's Retransmission Timer"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "SRTT·RTTVAR를 이용한 TCP RTO 계산과 반복 타임아웃의 지수 백오프 규칙을 확인한다."
    displayOrder: 1
---
# 재전송 타임아웃(RTO)

TCP는 데이터를 보낸 직후 ACK가 오지 않았다고 바로 손실로 판단할 수 없다. 네트워크 왕복 시간이 경로와 혼잡 상태에 따라 달라지기 때문이다. **RTO(Retransmission Timeout)**는 송신 측이 ACK를 얼마나 기다린 뒤 확인되지 않은 데이터를 재전송할지 정하는 타이머다.

RTO가 너무 짧으면 단지 늦게 오는 패킷을 손실로 잘못 판단해 불필요한 재전송을 만든다. 반대로 너무 길면 실제 손실이 생겼을 때 복구가 늦어진다.

### 하나의 고정 타임아웃이 아니라 RTT 관측을 반영한다

TCP는 왕복 시간(RTT) 표본을 이용해 평활화한 RTT(SRTT)와 RTT 변동성(RTTVAR)을 추정하고 이를 바탕으로 RTO를 계산한다.

```text
RTT 표본
   ↓
SRTT + RTTVAR 갱신
   ↓
RTO 계산
   ↓
ACK가 RTO 안에 오지 않음
   ↓
재전송 판단
```

평균 RTT만 사용하면 지연 변동이 큰 경로에서 정상적으로 늦어진 ACK를 손실로 오인하기 쉽다. 변동성에 대한 여유를 두는 이유다.

### 반복 타임아웃에서는 더 공격적으로 보내지 않는다

같은 상황에서 RTO가 반복해서 만료되면 TCP는 재전송 타이머를 지수적으로 늘리는 백오프를 적용한다. 네트워크가 심하게 혼잡하거나 끊긴 상태에서 같은 속도로 계속 재전송해 상황을 악화시키는 것을 줄이기 위해서다.

### TCP RTO와 HTTP 요청 timeout은 다른 시계다

TCP RTO는 **전송 계층이 바이트 재전송 시점을 결정하는 타이머**다. HTTP 클라이언트의 요청 timeout은 애플리케이션이 전체 요청 결과를 얼마나 기다릴지 정하는 별도 정책이다.

애플리케이션 timeout이 먼저 끝나 POST를 다시 보내더라도 아래 TCP 연결에서는 첫 요청 바이트를 계속 재전송하거나 서버가 이미 처리했을 수 있다. 이 차이가 비멱등 요청 재시도에서 중요한 이유다.

핵심은 **RTO가 RTT와 지연 변동을 바탕으로 전송 계층 손실 복구 시점을 정하며, 애플리케이션 요청 마감 시간과는 별개의 상태라는 점**이다.
