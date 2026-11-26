---
kind: concept
contentKey: network-http.core.http-cache.cache-control
topicContentKey: network-http.core.http-cache
slug: cache-control
title: "Cache-Control 지시어"
summary: "max-age·no-cache·no-store·must-revalidate가 저장·신선도·재사용 조건을 어떻게 나누어 제어하는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
  - url: "https://toss.tech/article/smart-web-service-cache"
    title: "웹 서비스 캐시 똑똑하게 다루기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "브라우저 HTTP 캐시와 재검증을 적용한 사례다. 지시어의 규범적 의미와 예외는 RFC 9111을 기준으로 읽는다."
    displayOrder: 2
    relationNote: "Cache-Control·validator를 활용한 브라우저 캐시 운영 사례로 보완한다. 일부 브라우저 동작을 표준 보장으로 일반화하지 않는다."
---
# Cache-Control 지시어

Cache-Control은 저장 가능성, 신선도 수명 및 재사용 조건을 각각 제어하는 HTTP 필드입니다. 저장 여부와 재사용 여부를 구분해야 합니다.

| 응답 지시어 | 기본 의미 |
| --- | --- |
| max-age=N | 신선도 수명을 N초로 지정 |
| no-cache | 재사용 전에 성공적인 검증 요구 |
| no-store | 해당 응답의 저장 금지 |
| must-revalidate | stale 상태에서 성공적 검증 없이 재사용 금지 |
| s-maxage=N | 공유 캐시의 신선도 수명 지정 및 stale 재사용 제한 |
| private | 공유 캐시 저장 제한 |
| public | 공유 캐시 저장 허용에 관한 명시적 지시 |

표는 일반적인 필드 이름을 지정하지 않은 응답 지시어의 의미입니다. 요청 지시어와 필드별 제한에는 별도 규칙이 적용됩니다.

### no-cache와 no-store

no-cache 응답은 저장할 수 있지만 재사용하려면 원본에서 성공적으로 검증해야 합니다. ETag가 있다면 조건부 요청으로 304를 받아 기존 본문을 유지할 수 있습니다. no-store는 저장 자체를 금지합니다. 다만 이미 저장된 다른 응답을 자동으로 무효화하거나 모든 환경에서 개인정보 보호를 보장하는 것은 아닙니다.

### 공유 캐시의 안전성

개인화된 응답에 public을 잘못 지정하면 다른 사용자에게 재사용될 위험이 있습니다. 실제 저장 및 재사용 조건과 캐시 키를 함께 검토해야 합니다. 캐시 정책 변경만으로 기존 객체가 즉시 제거되지는 않으므로 노출 대응에는 무효화와 영향 범위 확인도 필요합니다.
