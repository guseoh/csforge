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

HTTP/1.1 파이프라이닝(pipelining)은 같은 지속 연결에서 앞선 응답을 기다리지 않고 여러 요청을 연속해서 보내는 방식이다. 요청 전송은 겹칠 수 있지만 서버는 파이프라인으로 받은 요청의 **응답 순서를 요청 순서와 맞춰야 한다.**

```text
요청:  R1 → R2 → R3
응답:  S1 → S2 → S3
```

R1 처리가 오래 걸리고 R2·R3 결과가 먼저 준비되어도 S1을 건너뛰고 S2부터 보낼 수 없다. 앞선 응답이 뒤 응답을 막는 이 순서 제약을 선두 차단(Head-of-Line, HOL)이라고 한다.

여러 요청을 보낸 뒤 연결이 끊기면 클라이언트는 서버가 실제로 어느 요청까지 처리했는지 알기 어려울 수 있다. 특히 POST처럼 멱등하지 않은 작업이 섞여 있다면 모든 요청을 그대로 다시 보내 중복 부수 효과를 만들 수 있다.

HTTP/2는 요청마다 독립 스트림을 만들고 여러 스트림의 프레임을 교차 전송해 HTTP/1.1의 응답 순서 차단을 줄인다. 다만 HTTP/2가 TCP 위에서 동작하면 TCP 바이트 스트림의 손실로 다른 계층의 선두 차단이 남을 수 있다.

따라서 파이프라이닝은 **HTTP/1.1에서 여러 요청을 먼저 보낼 수 있게 하는 기법**이지 HTTP/2의 독립 스트림 다중화와 같은 구조가 아니다.
