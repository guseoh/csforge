---
kind: concept
contentKey: security.core.session-cookie.cookie-flags
topicContentKey: security.core.session-cookie
slug: cookie-flags
title: "쿠키 보안 속성(Secure·HttpOnly·SameSite)의 방어 범위"
summary: "`Secure`·`HttpOnly`·`SameSite`가 각각 쿠키 전송과 스크립트 접근을 어떻게 제한하는지 구분하고, 각 속성의 방어 범위를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie"
    title: "MDN: Set-Cookie"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Secure·HttpOnly·SameSite와 쿠키 범위의 동작 확인"
---
# 쿠키 보안 속성(Secure·HttpOnly·SameSite)의 방어 범위

세션 쿠키를 보호할 때 세 가지 속성을 자주 함께 사용하지만 역할은 서로 다릅니다.

| 속성       | 주로 제한하는 것                     | 해결하지 못하는 것                                           |
| ---------- | ------------------------------------ | ------------------------------------------------------------ |
| `Secure`   | HTTPS가 아닌 연결로 쿠키 전송      | XSS 자체, 잘못된 인가                               |
| `HttpOnly` | JavaScript의 `document.cookie` 접근  | 브라우저가 요청에 쿠키를 보내는 것, XSS의 동일 출처 요청 |
| `SameSite` | 교차 사이트 상황에서 쿠키 전송 범위 | 모든 CSRF/XSS, 동일 사이트에서 시작한 공격                    |

### Secure는 HTTPS 전송 구간을 보호한다

```http
Set-Cookie: SESSION=S123; Secure
```

브라우저는 일반적으로 HTTPS 요청에서만 이 쿠키를 전송합니다. 하지만 TLS를 사용해도 세션 ID가 XSS나 로그를 통한 유출로부터 자동으로 보호되지는 않습니다.

### HttpOnly는 쿠키 읽기를 막지만 XSS를 무력화하지 않는다

```http
Set-Cookie: SESSION=S123; HttpOnly
```

공격 스크립트가 `document.cookie`로 세션 ID를 직접 읽지 못하게 합니다. 그러나 스크립트는 사용자의 출처에서 실행되므로 `fetch('/orders')`처럼 **브라우저가 자동으로 쿠키를 붙이는 동일 출처 요청**을 수행할 수 있습니다. 따라서 HttpOnly만으로 XSS의 피해를 모두 막을 수는 없습니다.

### SameSite는 교차 사이트 자격 증명 전송을 줄인다

- `Strict`: 교차 사이트 상황에서 가장 제한적
- `Lax`: 교차 사이트에서 최상위 페이지로 이동하는 안전한 메서드 요청 등에 쿠키 허용
- `None`: 교차 사이트 전송 허용, 현대 브라우저에서는 `Secure`와 함께 요구

외부 신원 제공자로 이동했다가 돌아오거나 교차 사이트에서 페이지를 포함해야 한다면 `Strict`가 기능을 방해할 수 있습니다. 실제 페이지 이동 흐름을 함께 확인해야 합니다.

### SameSite의 site와 SOP/CORS의 origin은 같은 경계가 아니다

브라우저가 SameSite 쿠키를 판단할 때 사용하는 **schemeful site**는 대체로 **scheme + 등록 가능한 도메인(registrable domain)** 경계입니다. 반면 **origin은 scheme + host + port** 조합입니다.

| 요청 관계 | site 관점 | origin 관점 |
| --- | --- | --- |
| `https://app.example.com` → `https://api.example.com` | 같은 site | 다른 origin |
| `https://example.com:443` → `https://example.com:8443` | 같은 site | 다른 origin |
| `http://app.example.com` → `https://api.example.com` | 다른 site (scheme이 다름) | 다른 origin |

따라서 app/API가 같은 site라도 **다른 origin의 스크립트가 응답을 읽으려면 CORS 조건을 충족**해야 합니다. 또한 `SameSite=Lax`/ `Strict` 조건을 통과해도 쿠키의 `Domain`, `Path`, `Secure` 등의 전송 조건을 따로 만족해야 합니다. `Domain`이 없는 host-only 쿠키는 기본적으로 발급한 호스트에만 전송되며, `Domain=example.com`처럼 설정하면 관련 하위 도메인으로 범위가 확장될 수 있습니다. 같은 site에서 발생한 공격이나 잘못된 서버 인가까지 SameSite가 차단하는 것은 아닙니다.

### Domain과 Path를 인가로 쓰지 않는다

쿠키의 `Path=/admin`은 브라우저 전송 범위를 조절하지만 같은 출처의 스크립트를 격리하는 보안 경계는 아닙니다. 관리자 인가는 서버에서 별도로 검사해야 합니다.

쿠키 속성을 외울 때는 **각 속성이 어떤 공격 경로를 제한하는지** 구분해 이해하는 것이 중요합니다.
