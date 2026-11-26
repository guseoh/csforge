---
kind: concept
contentKey: network-http.core.http-state-intermediary.cookie-scope
topicContentKey: network-http.core.http-state-intermediary
slug: cookie-scope
title: "쿠키의 전송 범위와 SameSite"
summary: "`Domain`·`Path`·`Secure`·`SameSite`가 쿠키를 보낼 호스트·경로·전송 채널·사이트 문맥을 각각 제한하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6265.html"
    title: "RFC 6265: HTTP State Management Mechanism"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "정식 발행된 2011년 Cookie/Set-Cookie 기본 명세다. SameSite는 이후 확장으로 별도 확인한다."
    displayOrder: 1
    relationNote: "RFC 6265의 5.1.3 Domain 매칭·5.1.4 Path 매칭 및 5.2의 Secure/HttpOnly를 확인한다. SameSite는 당시 명세에 없다."
  - url: "https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html"
    title: "HTTPWG RFC 6265bis: Cookies (Internet-Draft, 미발행)"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "SameSite 등 최신 쿠키 동작을 다루지만 2026-10-17 현재 발행 전의 변경 가능한 초안이다."
    displayOrder: 2
    relationNote: "6265bis 초안의 5.2 same-site/cross-site, 5.6.7 SameSite, 5.8 반환 모델을 확인한다. 정식 RFC가 아닌 작업 문서임을 구분한다."
---
# 쿠키의 전송 범위와 SameSite

사용자 에이전트는 모든 저장 쿠키를 모든 요청에 포함하지 않습니다. 요청 호스트, 경로, 보안 전송 여부, 사이트 문맥과 쿠키의 저장 상태를 비교하여 전송 자격을 판단합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "쿠키의 전송 범위와 SameSite",
  "description": "프로토콜 상태·요청 경계와 이전·이후 결과를 고정 예제로 확인합니다.",
  "example": "cookie-scope"
}
```

| 속성 | 역할 |
| --- | --- |
| Domain | 도메인 매칭 범위 |
| Path | 요청 경로 매칭 범위 |
| Secure | 보안 전송 조건 |
| HttpOnly | 비 HTTP API를 통한 접근 제한 |
| SameSite | 사이트 문맥에 따른 전송 조건 |

Domain을 생략하면 일반적으로 설정한 호스트에만 적용되는 host-only 쿠키가 됩니다. Path는 접근 권한이나 동일 호스트의 애플리케이션 격리를 위한 보안 경계가 아닙니다. HttpOnly 쿠키도 다른 조건이 맞으면 HTTP 요청에 포함될 수 있습니다.

### 사이트와 Origin은 다릅니다

SameSite의 사이트는 Origin과 동일한 판정 기준이 아닙니다. 일반적인 쿠키 범위에는 포트가 포함되지 않으므로 같은 호스트의 443과 8443이 다른 Origin이라도 쿠키가 자동으로 격리되지는 않습니다. 교차 사이트 전송 여부는 SameSite 값 및 요청 문맥, 사용자 에이전트 정책에 따라 달라집니다.

쿠키의 전송 자격은 사용자 인증과 자원별 인가를 대신하지 않습니다. 세션 기반 인증에서는 필요한 CSRF 방어도 별도로 고려합니다.
