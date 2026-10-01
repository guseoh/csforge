---
kind: concept
contentKey: network-http.core.http-state-intermediary.gateway
topicContentKey: network-http.core.http-state-intermediary
slug: gateway
title: "게이트웨이의 중계 역할"
summary: "게이트웨이가 클라이언트와 백엔드 사이에서 프로토콜 변환·경로 선택·경계 정책을 수행할 수 있는 중개 역할임을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 게이트웨이의 중계 역할

게이트웨이는 클라이언트와 백엔드 사이에서 요청을 받아 다른 프로토콜의 대상이나 백엔드로 전달하는 중개자다. 역방향 프록시 제품 위에 구현될 수도 있다. ‘게이트웨이’라는 이름은 경로 선택, 프로토콜 변환, 외부 진입 경계의 정책 적용 같은 역할을 강조할 때 자주 쓰인다.

예를 들어 외부 HTTP 요청을 내부 gRPC 호출로 바꾸거나 여러 백엔드 중 하나를 골라 전달할 수 있다. 이때 클라이언트가 보낸 요청과 백엔드로 가는 요청은 같은 전송 메시지가 아닐 수 있으며 게이트웨이가 둘 사이를 변환한다.

```text
클라이언트 요청
    ↓
게이트웨이
    ├─ 경로 선택
    ├─ 프로토콜·메시지 변환 가능
    └─ 백엔드 요청
```

게이트웨이가 인증, 요청 빈도 제한, 캐시 같은 정책을 수행할 수도 있지만 모든 게이트웨이에 공통으로 요구되는 기능은 아니다. 요청을 백엔드로 전달했다는 사실만으로 백엔드의 업무 처리가 성공한 것도 아니다.

게이트웨이를 볼 때는 제품 이름보다 **어느 연결과 프로토콜을 끝내고, 무엇을 변환하며, 어느 지점에서 다음 요청 구간을 새로 시작하는지** 살펴봐야 한다.
