---
kind: concept
contentKey: network-http.core.http-state-intermediary.reverse-proxy
topicContentKey: network-http.core.http-state-intermediary
slug: reverse-proxy
title: "역방향 프록시"
summary: "역방향 프록시가 공개 요청을 받아 백엔드로 새 요청을 전달하며, 두 연결 구간의 전송·TLS·시간 제한이 독립적임을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 역방향 프록시

역방향 프록시는 원본 서버 앞에서 클라이언트 요청을 받고 선택한 백엔드로 별도 요청을 보내는 서버 쪽 중개자다. 클라이언트에는 공개 진입점으로 보이지만 백엔드가 연결 상대 주소로 관찰하는 대상은 프록시다.

```text
클라이언트 → 역방향 프록시 → 백엔드
```

역방향 프록시는 여러 백엔드 중 경로를 선택하거나 TLS 종료, 부하 분산, 캐시 기능을 제공할 수 있다. 이런 기능이 역방향 프록시 역할에 모두 필수로 포함되지는 않는다.

클라이언트에서 프록시까지와 프록시에서 백엔드까지는 서로 다른 연결이다. 각 구간의 전송 방식, TLS, 시간 제한, 상대 주소가 다를 수 있다. 프록시가 클라이언트 쪽 TLS를 종료해도 백엔드 연결이 자동으로 TLS를 사용하는 것은 아니다. 프록시가 요청을 다시 보낼 때 백엔드가 첫 요청을 이미 처리했을 가능성도 있어 중복 효과가 생길 수 있다.

백엔드가 원래 클라이언트의 스킴, 호스트 또는 주소를 알아야 한다면 프록시가 전달 필드로 별도 정보를 넘겨야 한다. **역방향 프록시는 클라이언트 쪽 연결을 받고 백엔드 쪽에 새로운 HTTP 요청 구간을 만드는 역할이다.**
