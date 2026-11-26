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

TCP의 누적 ACK 번호는 수신 측이 다음에 기대하는 시퀀스 번호입니다. 예를 들어 1000~1499의 500바이트가 연속해서 수신되었다면 ACK는 1500입니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "확인 응답(ACK)",
  "description": "개념의 기술적 관계와 상태를 검증된 고정 예제로 보여줍니다.",
  "example": "acknowledgement"
}
```

1500~1999가 빠진 상태에서 2000~2499가 먼저 도착해도 누적 ACK는 1500에 머뭅니다. 뒤쪽 데이터가 수신 버퍼에 보존되었다면 빠진 구간이 채워질 때 ACK는 2500으로 진행할 수 있습니다.

### 누적 ACK와 SACK

SACK가 협상된 경우 수신 측은 누적 ACK와 함께 이미 수신한 비연속 범위를 알려 줄 수 있습니다. 이를 통해 송신 측은 어떤 바이트가 아직 필요한지 더 정확하게 판단합니다. SACK가 뒤 범위를 알렸다고 해서 그 앞의 빈 구간을 건너뛰어 누적 ACK가 이동하는 것은 아닙니다.

### 업무 처리와의 경계

TCP ACK는 상대 TCP의 수신 진행 상태를 나타냅니다. 상대 애플리케이션이 그 바이트를 읽었는지, HTTP 메시지로 해석했는지, DB에 커밋했는지는 알 수 없습니다. 업무 완료는 애플리케이션 응답이나 별도의 상태 조회 계약으로 확인합니다.
