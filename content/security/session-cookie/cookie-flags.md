---
kind: concept
contentKey: security.core.session-cookie.cookie-flags
topicContentKey: security.core.session-cookie
slug: cookie-flags
title: "Secure·HttpOnly·SameSite가 막는 공격 범위"
summary: "cookie attribute가 각각 전송 채널, JavaScript 접근, cross-site 전송을 제한한다는 점을 구분하고 하나의 flag가 session 탈취·CSRF·XSS를 모두 해결한다고 오해하지 않는다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie"
    title: "MDN: Set-Cookie"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Secure, HttpOnly, SameSite와 cookie scope 동작 확인
---
# Secure·HttpOnly·SameSite가 막는 공격 범위

Session cookie를 보호할 때 세 flag가 자주 함께 나오지만 역할은 서로 다릅니다.

| 속성       | 주로 제한하는 것                     | 해결하지 못하는 것                                           |
| ---------- | ------------------------------------ | ------------------------------------------------------------ |
| `Secure`   | HTTPS가 아닌 연결로 cookie 전송      | XSS 자체, 잘못된 authorization                               |
| `HttpOnly` | JavaScript의 `document.cookie` 접근  | 브라우저가 요청에 cookie를 보내는 것, XSS의 same-origin 요청 |
| `SameSite` | cross-site 상황에서 cookie 전송 범위 | 모든 CSRF/XSS, same-site 공격                                |

### Secure는 network transport 경계를 보호한다

```http
Set-Cookie: SESSION=S123; Secure
```

브라우저는 일반적으로 HTTPS 요청에서만 이 cookie를 전송합니다. 하지만 TLS를 쓴다고 session ID가 XSS나 log leakage에서 자동 보호되는 것은 아닙니다.

### HttpOnly는 cookie 읽기를 막지만 XSS를 무력화하지 않는다

```http
Set-Cookie: SESSION=S123; HttpOnly
```

공격 script가 `document.cookie`로 session ID를 직접 읽는 것을 줄일 수 있습니다. 그러나 script는 사용자의 origin 안에서 실행되므로 `fetch('/orders')`처럼 **브라우저가 자동으로 cookie를 붙이는 same-origin 요청**을 수행할 수 있습니다. 즉 HttpOnly는 매우 중요하지만 XSS의 impact를 완전히 제거하지 않습니다.

### SameSite는 cross-site credential 전송을 줄인다

- `Strict`: cross-site 상황에서 가장 제한적
- `Lax`: 일부 top-level safe navigation 등에 cookie 허용
- `None`: cross-site 전송 허용, 현대 browser에서는 `Secure`와 함께 요구

외부 identity provider redirect나 cross-site embed가 필요한 서비스는 Strict가 기능을 깨뜨릴 수 있습니다. 보안 강도와 실제 navigation flow를 함께 확인해야 합니다.

### Domain과 Path를 authorization으로 쓰지 않는다

Cookie `Path=/admin`은 브라우저 전송 범위를 조절하는 속성이지만 같은 origin script 간 강한 보안 격리 경계가 아닙니다. 관리자 authorization은 서버에서 별도로 검사해야 합니다.

Cookie flag를 외울 때는 “세 개 다 켜기”보다 **각 flag가 공격 chain의 어느 단계를 끊는지**를 분리해서 이해하는 것이 중요합니다.
