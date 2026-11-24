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

TCP 시퀀스 번호는 패킷 개수가 아니라 바이트 스트림의 위치를 나타냅니다. 수신 측은 이를 이용해 수신한 범위와 누락·중복 구간을 판단합니다.

![TCP 시퀀스 번호 예제: 1000~1499 수신, 1500~1999 누락, 2000~2499 선도착 시 ACK 1500이며 누락 구간을 재전송으로 복구한 뒤 ACK 2500으로 진행하는 바이트 범위 비교](/learning/network-http/tcp-sequence-number.svg)

SEQ 1000에서 시작하는 500바이트는 1000~1499를 차지합니다. 그다음 800바이트를 보내면 시작 SEQ는 1500이고 마지막 위치는 2299입니다. 두 구간을 연속 수신했다면 ACK는 2300입니다.

### 그림의 누락 구간

그림에서는 1500~1999가 누락되고 2000~2499가 먼저 도착합니다. 뒤 데이터가 보존된 상태라면 누적 ACK는 1500에 머물다가 누락 구간이 채워졌을 때 2500으로 진행합니다. SACK는 이미 수신한 비연속 범위를 별도로 알릴 수 있습니다.

### SYN과 FIN

SYN과 FIN은 데이터 바이트는 아니지만 각각 시퀀스 공간 한 위치를 소비합니다. 연결 수립이나 종료에서 데이터 길이만 더하면 ACK 계산을 틀릴 수 있습니다. 실제 시퀀스 번호는 32비트 공간에서 순환하며 위 예시는 순환 경계가 없는 경우입니다.

TCP ACK는 수신한 연속 바이트의 진행 상태이지 상대 애플리케이션의 처리 완료를 나타내지 않습니다.
