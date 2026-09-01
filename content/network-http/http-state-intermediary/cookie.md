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

cookie는 user agent가 보관하는 작은 name/value 상태다. server가 response의 `Set-Cookie`로 저장을 지시하면 user agent는 Domain·Path·Secure·expiry·SameSite 같은 조건을 기록하고, 다음 request가 그 조건에 맞을 때만 `Cookie` header에 값을 포함한다. server가 매 request마다 session 전체를 다시 보내는 대신, 이 값으로 session record나 서명된 state를 찾는 흐름을 만들 수 있다.

`Cookie` header에는 보통 name/value만 실리고 `Set-Cookie`의 attribute가 그대로 되돌아오지 않는다. 따라서 cookie가 전송되었다는 사실만으로 HTTPS confidentiality, authentication, integrity가 생기지 않는다. user agent와 network 경로를 통과하는 값은 탈취·변조될 수 있고, session ID처럼 bearer credential로 쓰는 값은 client가 임의로 바꿀 수 있다는 전제에서 server-side session 검증, 서명, 만료와 rotation을 설계해야 한다.

cookie의 scope는 URL의 host/path, secure channel, site context, 저장 lifetime과 browser policy가 함께 결정한다. 같은 cookie가 전송되었다고 server의 DB session이 아직 유효하다는 뜻도 아니며, cookie 삭제·만료와 server-side session revoke는 별개의 상태 변화다. 또한 cookie는 HTTP state를 운반할 뿐 CSRF 방어, access control, TLS를 대신하지 않는다.

### Backend 연결

session cookie에는 production HTTPS에서 `Secure`, script 접근 제한이 필요한 값에 `HttpOnly`, 요청 흐름에 맞는 `SameSite`와 최소한의 scope를 설정한다. URL·query parameter에 session token을 복제하지 않아 access log·history·referer로 퍼지지 않게 하고, CSRF 방어와 authentication state validation은 cookie 저장 정책과 별도의 server 검증으로 둔다.

