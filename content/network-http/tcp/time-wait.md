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

일반적인 능동 종료 측은 상대 FIN을 확인한 뒤 연결 정보를 즉시 제거하지 않고 TIME-WAIT 상태를 유지합니다. 이는 연결 종료의 신뢰성과 이전 연결의 늦은 세그먼트 처리를 위한 전송 계층 상태입니다.

### 마지막 ACK가 유실되면

마지막 ACK가 손실되면 상대는 자신의 FIN을 다시 보낼 수 있습니다. TIME-WAIT 상태를 유지하면 재전송된 FIN을 확인하여 ACK를 다시 보낼 수 있습니다. 동시 종료에서는 양쪽이 TIME-WAIT에 진입할 수도 있습니다.

### 이전 연결의 세그먼트

같은 주소·포트 조합을 바로 재사용하면 지연된 이전 연결의 세그먼트와 새 연결을 혼동할 위험이 있습니다. RFC 9293의 전통적인 모델에서 TIME-WAIT 기간은 2 MSL입니다. 실제 운영체제의 타이머와 안전한 재사용 조건은 구현에 따라 다를 수 있습니다.

TIME-WAIT 수가 많다고 즉시 비정상인 것은 아닙니다. 연결 생성률과 능동 종료 측, 임시 포트 사용량, 연결 풀 정책을 함께 확인합니다. CLOSE-WAIT처럼 애플리케이션의 종료 처리를 기다리는 상태와도 구분해야 합니다.
