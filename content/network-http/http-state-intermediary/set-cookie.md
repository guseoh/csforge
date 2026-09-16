---
kind: concept
contentKey: network-http.core.http-state-intermediary.set-cookie
topicContentKey: network-http.core.http-state-intermediary
slug: set-cookie
title: "Set-Cookie"
summary: "server가 user agent에게 cookie의 값·scope·lifetime을 저장하도록 지시하는 Set-Cookie를 설명한다."
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

`Set-Cookie`는 HTTP response에서 user agent에게 cookie를 생성하거나 갱신하도록 지시하는 field다. 기본 name/value와 함께 `Domain`, `Path`, `Max-Age` 또는 `Expires`, `Secure`, `HttpOnly`, `SameSite` 같은 attribute를 사용해 저장 수명과 이후 전송 조건을 정할 수 있다.

이 attribute들은 cookie 저장 규칙을 설명하는 정보이므로 이후 request의 `Cookie` header에 그대로 복사되지 않는다. 한 response에서 여러 cookie를 설정하려면 여러 `Set-Cookie` field를 사용하며, 일반적인 comma-separated list field처럼 단순 결합해서는 안 된다.

같은 name이라도 Domain과 Path가 다르면 서로 다른 cookie가 공존할 수 있다. 따라서 cookie를 만료시키려면 보통 원래 cookie와 같은 scope를 지정한 뒤 `Max-Age=0` 또는 이미 지난 expiry를 사용해야 한다. 단순히 같은 이름에 빈 문자열을 설정한다고 다른 scope의 cookie까지 모두 사라지는 것은 아니다.

`Set-Cookie`가 성공적으로 전달됐다고 모든 다음 요청에 cookie가 포함되는 것도 아니다. user agent는 저장 후 각 request마다 scope와 security 조건을 다시 평가한다. **Set-Cookie는 값을 저장하라는 server의 지시이고, 실제 Cookie 전송은 user agent가 저장된 규칙을 적용한 결과**다.
