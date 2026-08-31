---
kind: concept
contentKey: network-http.core.http-state-intermediary.cookie-scope
topicContentKey: network-http.core.http-state-intermediary
slug: cookie-scope
title: "Cookie Scope"
summary: "Domain·Path·Secure·SameSite가 전송 범위를 제한하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6265"
    title: "HTTP State Management Mechanism"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP cookie state와 전송 scope를 확인한다."
    displayOrder: 1
---
# Cookie Scope

Domain과 Path는 cookie가 어느 host/path request에 포함되는지, Secure는 HTTPS channel에서만 보낼지, SameSite는 cross-site context에서 전송을 제한할지 결정한다. 이 attribute들은 서로 다른 scope 축이므로 하나의 “cookie 보안” flag로 합치지 않는다.

Path는 authorization boundary가 아니며, subdomain과 public suffix 규칙도 browser가 해석한다. 너무 넓은 Domain과 오래 사는 session cookie는 compromise 영향 범위를 키운다.

### Backend 연결

관리자와 일반 UI가 다른 host/path를 사용하면 cookie 이름·scope·CSRF 정책을 분리한다. local HTTP 개발 설정이 production Secure cookie의 동작을 가리지 않게 profile별 테스트를 둔다.

