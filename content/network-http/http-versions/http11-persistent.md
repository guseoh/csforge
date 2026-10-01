---
kind: concept
contentKey: network-http.core.http-versions.http11-persistent
topicContentKey: network-http.core.http-versions
slug: http11-persistent
title: "HTTP/1.1 지속 연결"
summary: "HTTP/1.1에서 하나의 TCP 연결을 여러 요청·응답 교환에 재사용하는 기본 모델을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 메시지 구문, 프레이밍과 연결 재사용 규칙을 확인한다."
    displayOrder: 1
---
# HTTP/1.1 지속 연결

HTTP/1.1은 하나의 TCP 연결에서 여러 요청·응답 교환을 처리하는 지속 연결을 기본으로 사용한다. 매 요청마다 TCP 연결을 새로 만드는 비용을 줄이고 이미 만들어 둔 전송 상태를 재사용할 수 있다.

```text
하나의 TCP 연결
  ├─ 요청 1 → 응답 1
  ├─ 요청 2 → 응답 2
  └─ 요청 3 → 응답 3
```

연결을 재사용하려면 수신자가 각 HTTP 메시지의 끝을 정확히 알아야 한다. 따라서 `Content-Length`, 전송 코딩, 상태 코드·메서드별 규칙 같은 HTTP/1.1 프레이밍이 중요하다. 앞 응답의 본문 끝을 잘못 판단하면 뒤 응답의 바이트와 섞일 수 있다.

지속 연결이 기본이라는 말은 연결이 영원히 유지된다는 뜻이 아니다. 끝점은 `Connection: close`로 연결 종료 의사를 알리거나 타임아웃·자원 정책에 따라 연결을 닫을 수 있다.

지속 연결은 여러 교환이 연결을 **재사용**하는 방식이다. HTTP/2처럼 여러 독립 스트림의 프레임을 동시에 교차 전송하는 다중화와는 다르다. 이 차이를 이해하면 HTTP/1.1 파이프라이닝과 HTTP/2 스트림 모델을 구분할 수 있다.
