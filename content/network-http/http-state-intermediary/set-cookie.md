---
kind: concept
contentKey: network-http.core.http-state-intermediary.set-cookie
topicContentKey: network-http.core.http-state-intermediary
slug: set-cookie
title: "Set-Cookie"
summary: "server response가 cookie 값을 저장하도록 지시하는 구조를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6265"
    title: "HTTP State Management Mechanism"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP cookie state와 전송 scope를 확인한다."
    displayOrder: 1
---
# Set-Cookie

Set-Cookie response header는 user agent가 cookie를 저장할 name/value와 Domain, Path, Max-Age/Expires, Secure, HttpOnly 등의 attribute를 전달한다. response에 header가 있다고 모든 subdomain과 모든 request에 전송되는 것은 아니다.

동일 name cookie가 path/domain에 따라 여러 개 존재할 수 있어 server parsing과 삭제 header의 scope를 일치시킨다. secret rotation과 logout은 만료·server session revoke를 함께 처리한다.

### Backend 연결

Spring response에서 session cookie와 CSRF cookie의 scope·HttpOnly 요구가 다를 수 있다. reverse proxy가 Set-Cookie domain/path를 rewrite하는지 확인하고 테스트한다.

