---
kind: concept
contentKey: network-http.core.http-state-intermediary.proxy
topicContentKey: network-http.core.http-state-intermediary
slug: proxy
title: "정방향 프록시"
summary: "클라이언트가 선택한 정방향 프록시가 외부 목적지로 요청을 대신 전달하고, 각 연결 구간과 신뢰 경계를 나누는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 정방향 프록시

정방향 프록시는 클라이언트가 원본 서버에 직접 연결하는 대신 선택하는 중개자다. 클라이언트는 프록시에 요청을 보내고, 프록시는 원본 서버를 향한 별도 연결을 만들어 요청을 전달한다. 이는 원본 서버 앞에서 들어오는 요청을 받는 역방향 프록시와 배치가 다르다.

```text
클라이언트 → 정방향 프록시 → 원본 서버
```

정방향 프록시는 외부로 나가는 요청을 제한하는 정책, 캐시, 감사 기록 등을 제공할 수 있지만 이런 기능이 정의에 반드시 포함되는 것은 아니다. 핵심은 클라이언트와 원본 서버 사이에 중개 지점과 새 요청 구간이 생긴다는 점이다. 클라이언트에서 프록시까지와 프록시에서 원본 서버까지는 별개의 연결이다.

HTTPS 목적지와의 TLS 연결을 끝까지 유지하려면 클라이언트가 HTTP `CONNECT` 메서드로 터널 생성을 요청할 수 있다. 이때 프록시는 암호화된 바이트를 전달할 수 있지만 TLS를 직접 종료하지 않는 한 안의 HTTP 내용을 자동으로 읽을 수 없다. 프록시가 TLS를 종료해 내용을 검사하면 클라이언트와 원본 서버 사이의 신뢰 경계가 바뀐다.

원본 서버가 보는 소켓 연결 상대는 원래 클라이언트가 아니라 프록시일 수 있다. 원래 클라이언트 정보를 전달하려면 별도 규칙이 필요하다. 중개자가 추가한 메타데이터도 신뢰할 프록시 경계를 확인하기 전에는 클라이언트 신원을 증명하는 값으로 취급하면 안 된다.
