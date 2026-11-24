---
kind: concept
contentKey: network-http.core.http-state-intermediary.set-cookie
topicContentKey: network-http.core.http-state-intermediary
slug: set-cookie
title: "Set-Cookie로 쿠키 저장하기"
summary: "`Set-Cookie` 응답 필드가 사용자 에이전트에 쿠키의 값·전송 범위·저장 수명을 설정하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6265.html"
    title: "RFC 6265: HTTP State Management Mechanism"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "정식 발행된 2011년 Cookie/Set-Cookie 기본 명세다. SameSite는 이후 확장으로 별도 확인한다."
    displayOrder: 1
    relationNote: "RFC 6265의 4.1.1 문법·4.1.2 의미를 확인한다. 2011년 RFC는 SameSite 속성을 규정하지 않는다."
  - url: "https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html"
    title: "HTTPWG RFC 6265bis: Cookies (Internet-Draft, 미발행)"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "SameSite 등 최신 쿠키 동작을 다루지만 2026-10-17 현재 발행 전의 변경 가능한 초안이다."
    displayOrder: 2
    relationNote: "6265bis 최신 초안의 4.1과 5.6.1~5.6.7 속성·SameSite 처리를 읽고 최종 발행 전 문서임을 구분한다."
---
# Set-Cookie로 쿠키 저장하기

Set-Cookie는 사용자 에이전트에 쿠키의 저장 또는 갱신을 요청하는 HTTP 응답 필드입니다. 이름과 값 외에 Domain, Path, Max-Age, Expires, Secure, HttpOnly, SameSite 등의 속성으로 저장 및 전송 조건을 표현합니다.

```http
Set-Cookie: sid=example; Path=/; Secure; HttpOnly; SameSite=Lax
Set-Cookie: theme=dark; Path=/
```

여러 쿠키를 설정할 때는 Set-Cookie 필드를 각각 사용합니다. 특히 Expires에 쉼표가 포함될 수 있으므로 일반적인 쉼표 목록처럼 합치면 안 됩니다. 유효한 Max-Age와 Expires가 모두 있다면 일반적으로 Max-Age가 우선합니다.

### 갱신과 만료

같은 이름이라도 범위가 다르면 별도 쿠키로 저장될 수 있습니다. 기존 쿠키를 제거하려면 해당 쿠키의 범위와 저장 조건에 맞춰 Max-Age=0 등의 만료 지시를 전달합니다. 다른 범위의 쿠키까지 이름만으로 모두 제거되는 것은 아닙니다.

사용자 에이전트는 정책에 따라 저장을 거절하거나 전송 조건이 맞지 않는 쿠키를 생략할 수 있습니다. Set-Cookie가 응답에 포함된 사실만으로 이후 요청의 Cookie를 보장하지 않습니다.
