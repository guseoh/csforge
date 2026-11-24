---
kind: concept
contentKey: network-http.core.request-journey.origin
topicContentKey: network-http.core.request-journey
slug: origin
title: "출처(Origin)"
summary: "웹 Origin을 스킴·호스트·포트 조합으로 구분하고, 같은 IP 주소나 같은 호스트 이름만으로 같은 Origin이 되지는 않는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6454"
    title: "The Web Origin Concept"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "origin과 URL authority의 경계를 확인한다."
    displayOrder: 1
---
# 출처(Origin)

일반적인 HTTP·HTTPS URL의 Origin은 스킴, 호스트, 적용 포트의 조합입니다. 브라우저는 이 논리적 출처를 이용하여 문서와 데이터의 접근 경계를 구분합니다.

| URL | https://api.example.com 기준 |
| --- | --- |
| https://api.example.com/v1 | 같은 Origin |
| https://api.example.com:443/v2 | 같은 Origin |
| https://api.example.com:8443 | 포트가 달라 다른 Origin |
| http://api.example.com | 스킴이 달라 다른 Origin |
| https://admin.example.com | 호스트가 달라 다른 Origin |

경로와 질의 문자열은 Origin을 구분하지 않습니다. 기본 포트는 정규화하여 비교합니다. 일부 URL 및 sandbox 문서에는 불투명한 origin이 적용되므로 모든 웹 자원이 반드시 이 튜플로 표현된다고 일반화하지 않습니다.

### 네트워크와 보안 경계

같은 IP에서 여러 도메인을 제공하더라도 호스트가 다르면 Origin이 다릅니다. DNS 결과나 CDN의 실제 연결 주소가 달라져도 원래 HTTP URL의 Origin을 자동으로 바꾸지 않습니다.

Same-Origin Policy와 CORS는 이러한 브라우저 경계에 관련됩니다. CORS가 서버의 인증·인가를 대신하는 것은 아니며 쿠키의 SameSite도 Origin과 동일한 판정 기준이 아닙니다.
