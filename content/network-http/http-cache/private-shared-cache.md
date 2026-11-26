---
kind: concept
contentKey: network-http.core.http-cache.private-shared-cache
topicContentKey: network-http.core.http-cache
slug: private-shared-cache
title: "개인 캐시와 공유 캐시"
summary: "한 사용자 에이전트가 쓰는 개인 캐시와 여러 사용자의 요청을 처리하는 공유 캐시의 범위를 구분한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 개인 캐시와 공유 캐시

개인 캐시는 특정 사용자 에이전트를 위한 캐시이고 공유 캐시는 여러 사용자 요청에 저장 응답을 재사용할 수 있는 캐시입니다. 브라우저 캐시와 CDN은 대표적인 사례입니다.

| 응답 지시어 | 의미 |
| --- | --- |
| private | 필드 이름을 지정하지 않은 경우 공유 캐시 저장 금지 |
| no-store | 저장 금지 |
| public | 공유 저장을 명시적으로 허용할 수 있음 |
| s-maxage | 공유 캐시 신선도 수명 지정 |

### 인증 요청과 쿠키

RFC 9111 §3.2에 따라 Authorization이 있는 요청의 저장 응답을 공유 캐시가 재사용하려면 해당 지시어와 재사용 조건을 충족해야 합니다. 예를 들어 public, s-maxage, must-revalidate는 각 지시어의 요구사항에 따라 공유 재사용을 허용할 수 있습니다. Set-Cookie가 존재한다고 캐싱이 자동으로 금지되지는 않습니다.

개인별 주문 목록을 URI만으로 캐싱하면 다른 사용자의 데이터가 노출될 수 있습니다. 개인 표현에는 private 또는 필요한 경우 no-store를 검토합니다. Vary는 변형을 구분하는 기능이지 인증과 인가의 대체물이 아닙니다.

정책을 잘못 배포했다면 원본 헤더 수정 외에도 이미 저장된 객체의 무효화와 접근 기록을 통한 영향 조사가 필요합니다.
