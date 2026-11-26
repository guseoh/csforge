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
    recommendation: "TCP 재전송 타이머와 RTO 계산 규칙을 확인한다."
    displayOrder: 1
---
# 재전송 타임아웃(RTO)

ACK가 즉시 오지 않는다고 데이터를 잃었다고 판단할 수는 없습니다. 네트워크 왕복 시간은 연결과 경로 상태에 따라 달라지기 때문입니다. RTO는 송신 측의 재전송 타이머가 만료되는 기준입니다.

### RTT와 지연 변동

RFC 6298은 RTT 표본을 바탕으로 평활 RTT(SRTT)와 RTT 변동(RTTVAR)을 갱신합니다. 기본 계산은 RTO = SRTT + max(G, 4 × RTTVAR)이며 G는 시계의 해상도입니다. 명세의 초기값과 최소값 규칙, 실제 구현의 타이머 정책도 고려해야 합니다.

RTO가 너무 짧으면 늦은 ACK를 손실로 오인할 수 있고 너무 길면 복구가 지연됩니다. 재전송된 데이터의 RTT 표본은 어느 전송에 대한 ACK인지 모호할 수 있으므로 Karn 알고리즘 등 별도 규칙이 적용됩니다.

### 반복 만료와 요청 timeout

타이머 만료 시 확인되지 않은 가장 앞쪽 데이터를 재전송하고 RTO에 지수 백오프를 적용합니다. 이 전송 타이머는 HTTP 요청의 전체 시간 예산과 별개입니다.

애플리케이션 timeout 이후 서버가 이미 처리했거나 전송 중인 상태일 수 있습니다. 연결 종료나 재시도를 결정할 때 요청의 멱등성과 처리 결과의 불확실성도 고려해야 합니다.
