---
kind: concept
contentKey: network-http.core.tcp.acknowledgement
topicContentKey: network-http.core.tcp
slug: acknowledgement
title: "확인 응답(ACK)"
summary: "누적 ACK가 다음에 기대하는 바이트 위치를 나타내는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
---
# 확인 응답(ACK)

TCP의 ACK 번호(acknowledgment number)는 수신 측이 **다음에 받기를 기대하는 시퀀스 번호**를 나타낸다. 일반적인 누적 ACK에서는 이 값보다 앞선 연속된 바이트 범위를 수신했다는 뜻이다.

예를 들어 시퀀스 번호 1000부터 1499까지 연속된 500바이트를 받았다면 다음 기대 위치는 1500이다.

```text
수신 완료: 1000 ... 1499
다음 기대: 1500
ACK = 1500
```

### 중간에 빈 구간이 있으면 ACK가 앞으로 나아가지 않는다

1000~1499를 받은 뒤 2000~2499가 먼저 도착하고 1500~1999가 빠져 있다면, 누적 ACK는 여전히 1500을 가리킬 수 있다. 뒤쪽 바이트가 먼저 도착했더라도 애플리케이션에 연속된 바이트 스트림으로 넘기려면 앞의 빈 구간이 채워져야 하기 때문이다.

SACK(Selective Acknowledgment)이 협상된 경우에는 누적 ACK와 별도로 이미 받은 비연속 범위를 알려 송신 측이 손실 위치를 더 정확히 판단하도록 도울 수 있다.

### ACK와 애플리케이션 처리 성공은 다르다

TCP ACK는 수신 측 TCP가 바이트 수신 진행 상태를 알리는 전송 계층 신호다. 상대 애플리케이션이 그 바이트를 읽었는지, HTTP 메시지로 파싱했는지, 데이터베이스에 반영했는지는 ACK만으로 알 수 없다.

따라서 결제나 저장처럼 실제 업무 처리가 완료됐는지 알아야 한다면 HTTP 응답이나 별도의 애플리케이션 확인 절차가 필요하다. **TCP ACK는 바이트 전달 진행을 확인하는 값이지 업무 처리 완료 확인이 아니다.**
