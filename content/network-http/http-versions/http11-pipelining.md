---
kind: concept
contentKey: network-http.core.http-versions.http11-pipelining
topicContentKey: network-http.core.http-versions
slug: http11-pipelining
title: "HTTP/1.1 파이프라이닝"
summary: "여러 요청을 먼저 보내도 응답 순서를 유지해야 하는 HTTP/1.1 파이프라이닝과 HOL 한계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 메시지 구문, 프레이밍과 연결 재사용 규칙을 확인한다."
    displayOrder: 1
---
# HTTP/1.1 파이프라이닝

HTTP/1.1 파이프라이닝은 지속 연결에서 앞 요청의 응답을 기다리지 않고 후속 요청을 전송하는 방식입니다. 서버는 응답을 요청 순서대로 보내야 합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "HTTP/1.1 파이프라이닝",
  "description": "프로토콜 상태·요청 경계와 이전·이후 결과를 고정 예제로 확인합니다.",
  "example": "http11-pipelining"
}
```

R1의 처리 시간이 500ms이고 R2가 10ms에 완료되어도 R1의 최종 응답을 앞지르도록 R2의 응답을 보낼 수 없습니다. 이는 HTTP 수준의 Head-of-Line(HOL) 차단입니다. 서버가 안전한 메서드의 요청을 병렬로 처리하더라도 응답 순서의 제약은 남습니다.

### 연결 실패와 재시도

여러 요청을 전송한 뒤 연결이 끊기면 서버가 어느 요청까지 처리했는지 모를 수 있습니다. 멱등하지 않은 요청의 파이프라이닝과 자동 재시도에는 특별한 주의가 필요합니다. 전송 실패가 업무 처리 실패를 보장하지는 않습니다.

HTTP/2는 독립 스트림의 프레임을 교차 전송하여 이러한 응답 순서 제약을 줄입니다. 다만 TCP의 바이트 순서에 따른 전송 계층 HOL은 별도로 남습니다.
