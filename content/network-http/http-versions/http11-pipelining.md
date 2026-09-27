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
    recommendation: "HTTP/1.1의 요청·응답 순서와 메시지 프레이밍 규칙을 확인한다."
    displayOrder: 1
---
# HTTP/1.1 파이프라이닝

HTTP/1.1 파이프라이닝(pipelining)은 같은 지속 연결에서 이전 응답을 기다리지 않고 여러 요청을 연속으로 보내는 방식이다. 요청 전송은 겹칠 수 있지만 서버는 파이프라인으로 받은 요청의 **응답 순서를 요청 순서와 맞춰야 한다.**

```text
요청:  R1 → R2 → R3
응답:  S1 → S2 → S3
```

R1의 처리가 오래 걸리고 R2·R3 결과가 먼저 준비되더라도 S1을 건너뛰어 S2부터 보낼 수 없다. 이런 응답 순서 제약 때문에 뒤 요청이 앞 요청을 기다리는 head-of-line(HOL) 문제가 생긴다.

### 연결이 끊기면 재시도 판단도 어려워진다

여러 요청을 이미 파이프라인으로 보낸 상태에서 연결이 끊기면 클라이언트는 서버가 어느 요청까지 실제로 처리했는지 알기 어려울 수 있다. 특히 POST처럼 비멱등한 작업이 섞여 있으면 단순히 모든 요청을 다시 보내는 것이 중복 부수 효과를 만들 수 있다.

HTTP/2는 요청마다 독립적인 스트림을 만들고 여러 스트림의 프레임을 교차 전송할 수 있게 해 HTTP/1.1의 응답 순서 HOL을 줄인다. 그러나 HTTP/2가 TCP 위에서 동작하면 TCP 바이트 스트림의 손실 때문에 다른 계층의 HOL은 여전히 생길 수 있다.

따라서 파이프라이닝은 **여러 요청을 먼저 보낼 수 있게 한 HTTP/1.1 기법**이지 HTTP/2의 독립 스트림 다중화와 같은 모델이 아니다.
