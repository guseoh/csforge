---
kind: concept
contentKey: network-http.core.http-cache.intermediary-cache
topicContentKey: network-http.core.http-cache
slug: intermediary-cache
title: "중간 캐시의 재사용 판단"
summary: "프록시·CDN 같은 공유 캐시가 클라이언트와 원본 서버 사이에서 적중·미스·재검증을 처리하는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
  - url: "https://tech.kakao.com/posts/345"
    title: "분산 웹 캐시 (Wcache)의 개선과정 - Part 1"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "HTTP 중간 캐시의 저장·분산 구조와 운영상 절충을 보여 주는 사례로 읽는다. 프로토콜 보장은 RFC 9111을 기준으로 한다."
    displayOrder: 2
    relationNote: "공유 캐시의 적중률, 인기 항목, 계층 분리를 운영 설계의 절충과 함께 보여 주는 Kakao 사례다."
---
# 중간 캐시의 재사용 판단

CDN이나 프록시의 공유 캐시는 원본 응답을 저장해 여러 요청에 재사용할 수 있습니다. 그러나 URL이 같거나 응답이 신선하다는 이유만으로 모든 요청에 저장 본문을 반환해서는 안 됩니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "중간 캐시의 재사용 판단",
  "description": "프로토콜 상태·요청 경계와 이전·이후 결과를 고정 예제로 확인합니다.",
  "example": "intermediary-cache"
}
```

### 저장 응답의 재사용 자격

먼저 요청과 저장 응답이 캐시 키와 Vary 조건에 맞는지 확인합니다. Authorization이 있는 요청 및 private, no-store, no-cache 같은 지시어의 의미도 구분합니다. 예를 들어 사용자별 주문 목록은 단순히 URL만 같다고 다른 사용자에게 반환할 수 없습니다. private 응답은 공유 캐시 저장이 제한되고 no-cache는 저장 자체를 무조건 금지하는 것이 아니라 재사용 전 검증 요구와 관련됩니다.

### 신선도와 재검증

사용할 수 있는 저장 응답이 신선하고 다른 조건이 허용하면 원본을 다시 호출하지 않고 응답할 수 있습니다. 오래된 응답에 ETag가 있다면 조건부 요청을 보내 304로 메타데이터를 갱신하거나 새 표현을 받을 수 있습니다. 검증자가 없다면 일반 요청으로 새 표현을 가져올 수 있습니다. stale-while-revalidate처럼 오래된 응답을 제한적으로 허용하는 별도 정책도 있습니다.

### 운영에서의 관찰

원본이 v2로 변경돼도 CDN 엣지와 브라우저가 아직 v1을 반환할 수 있습니다. 어느 계층에서 응답을 생성했는지, Age와 ETag, 요청의 Vary 관련 필드 및 캐시 정책을 함께 살펴야 합니다. 잘못 저장된 개인 응답은 원본 헤더만 수정해도 즉시 제거되지 않을 수 있으므로 별도의 무효화와 영향 조사도 필요합니다.

역방향 프록시가 항상 캐시를 제공하는 것은 아닙니다. HTTP 캐시와 애플리케이션 내부 캐시도 별개의 책임입니다.
