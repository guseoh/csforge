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

`Set-Cookie`는 response가 user agent에게 cookie를 생성·갱신·삭제하도록 지시하는 response header다. name/value와 함께 `Domain`, `Path`, `Max-Age`/`Expires`, `Secure`, `HttpOnly`, `SameSite` 등의 attribute를 전달하지만, 이 attribute들은 이후 `Cookie` request header에 복사되어 전송되는 값이 아니다. 한 response에서 여러 cookie를 설정할 때는 여러 `Set-Cookie` field를 사용하며, 일반적인 comma-joined list header처럼 합치면 값의 구분이 깨질 수 있다.

`Domain`이 없으면 보통 해당 host에 묶인 host-only cookie가 되고, 있으면 허용된 하위 host까지 범위를 넓힐 수 있다. `Path`가 생략되면 user agent가 default path를 계산하며, `Max-Age`가 있으면 저장 lifetime 판단에서 `Expires`보다 우선한다. response에 `Set-Cookie`가 있다고 모든 subdomain이나 모든 request에 자동 전송되는 것은 아니며, secure·same-site·만료 조건을 다시 통과해야 한다.

같은 name이라도 Domain과 Path가 다르면 여러 cookie가 공존할 수 있다. logout이나 삭제를 구현할 때 빈 value만 보내서는 원래 cookie가 지워지지 않을 수 있으므로, 기존 name·domain·path와 같은 scope에 `Max-Age=0` 또는 과거 `Expires`를 내려야 한다. 그래도 server-side session이나 signing key가 살아 있으면 탈취된 token은 계속 유효할 수 있으므로 revoke·rotation과 함께 처리한다.

### Backend 연결

Spring response에서 session cookie와 CSRF cookie는 읽기 주체와 scope가 다를 수 있으므로 하나의 기본 attribute를 기계적으로 공유하지 않는다. reverse proxy나 ingress가 `Set-Cookie`의 domain/path를 rewrite하는지, logout이 모든 관련 scope를 만료시키는지 contract test로 확인한다.

