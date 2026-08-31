---
kind: concept
contentKey: network-http.core.http-state-intermediary.cookie
topicContentKey: network-http.core.http-state-intermediary
slug: cookie
title: "Cookie"
summary: "client가 origin 요청에 state token을 다시 보내는 cookie 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6265"
    title: "HTTP State Management Mechanism"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP cookie state와 전송 scope를 확인한다."
    displayOrder: 1
---
# Cookie

cookie는 server가 Set-Cookie로 저장을 지시한 name/value와 scope metadata를 user agent가 이후 조건에 맞는 request에 Cookie header로 다시 보내는 HTTP state mechanism이다. cookie는 transport encryption이나 authentication 자체가 아니라 state 전달 수단이다.

domain·path·secure·expiry·SameSite와 browser policy가 전송 여부를 결정한다. cookie value를 client가 임의로 바꿀 수 있다는 전제에서 signed/encrypted session token과 server-side session을 선택한다.

### Backend 연결

session cookie에는 Secure, HttpOnly, SameSite와 적절한 scope를 설정한다. CSRF 방어와 authentication state validation을 cookie 저장만으로 해결하지 않는다.

