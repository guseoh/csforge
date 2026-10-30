---
kind: concept
contentKey: network-http.core.http-versions.http10-connection
topicContentKey: network-http.core.http-versions
slug: http10-connection
title: "HTTP/1.0 연결"
summary: "HTTP/1.0의 기본 연결당 한 번의 요청·응답 교환(connection-per-exchange) 모델과 연결 종료로 본문 끝을 판단하는 방식(connection-close framing)의 관계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1945"
    title: "Hypertext Transfer Protocol — HTTP/1.0"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP connection reuse와 version framing을 확인한다."
    displayOrder: 1
---
# HTTP/1.0 연결

HTTP/1.0의 일반적인 사용 방식에서는 HTTP 요청·응답 교환이 끝난 뒤 TCP 연결을 닫는 경우가 많았다. 여러 리소스를 요청하면 연결 수립과 종료를 반복하므로 TCP 핸드셰이크 비용도 다시 발생할 수 있다.

```text
TCP 연결 → 요청 1 → 응답 1 → 연결 종료
TCP 연결 → 요청 2 → 응답 2 → 연결 종료
```

연결 종료는 일부 응답에서 메시지 본문이 끝났음을 알리는 프레이밍 역할도 할 수 있었다. 이때 HTTP 메시지 경계와 전송 연결의 수명은 강하게 연결된다.

HTTP/1.0에서도 `Keep-Alive` 확장을 통해 연결 재사용을 시도할 수 있었지만, 이를 HTTP/1.1의 기본 지속 연결 모델과 혼동해서는 안 된다.

핵심은 **요청마다 새 전송 연결을 만들 때 비용이 반복되고, 연결 종료가 메시지 프레이밍에 관여할 수 있다는 점**이다. HTTP/1.1은 이 비용과 제약을 줄이기 위해 지속 연결을 기본 모델로 삼는다.
