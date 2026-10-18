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

`Set-Cookie`는 서버가 응답에 넣어 사용자 에이전트의 쿠키를 만들거나 갱신하도록 지시하는 필드다. 기본 이름·값과 함께 `Domain`, `Path`, `Max-Age`, `Expires`, `Secure`, `HttpOnly`, `SameSite` 같은 속성으로 저장 수명과 이후 전송 조건을 정할 수 있다.

| 단계 | HTTP 교환 | 사용자 에이전트의 동작 |
| --- | --- | --- |
| 1 | 응답에 `Set-Cookie`와 속성 포함 | 쿠키 값과 저장·전송 조건 저장 |
| 2 | 다음 요청이 호스트·경로·보안 전송·사이트 조건 충족 | 해당 쿠키를 `Cookie` 필드에 포함할 수 있음 |
| 3 | 조건 불충족 또는 쿠키 만료 | 그 요청에는 쿠키를 보내지 않음 |

속성은 저장과 선택 규칙을 정하므로 다음 요청의 `Cookie` 필드에 그대로 복사되지 않는다. 한 응답에서 여러 쿠키를 설정할 때는 `Set-Cookie` 필드를 각각 사용해야 한다. 특히 `Expires` 값에 쉼표가 들어갈 수 있어 여러 필드를 일반 쉼표 구분 목록처럼 합치면 안 된다.

같은 이름의 쿠키라도 `Domain`이나 `Path`가 다르면 별도로 저장될 수 있다. 만료시키려면 보통 기존 쿠키와 같은 범위를 지정하고 `Max-Age=0` 또는 이미 지난 `Expires` 값을 보낸다. 같은 이름에 빈 값을 설정하는 것만으로 다른 범위의 쿠키까지 삭제되지는 않는다.

`Set-Cookie`를 보냈다고 다음 요청마다 쿠키가 실리는 것도 아니다. 사용자 에이전트는 저장 규칙에 따라 요청마다 전송 여부를 판단한다. **`Set-Cookie`는 저장 규칙을 전달하고, 실제 `Cookie` 전송은 사용자 에이전트가 그 규칙을 적용한 결과다.**
