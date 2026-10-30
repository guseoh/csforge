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

중간 캐시는 클라이언트와 원본 서버 사이의 프록시나 CDN이 HTTP 응답을 저장해 여러 요청에 재사용하는 공유 캐시다. 요청이 들어오면 캐시는 사용할 수 있는 저장 응답이 있는지 확인하고, 신선도와 요청 조건을 평가한다.

```text
요청 → 중간 캐시
          ├─ 신선한 응답 적중 → 저장 응답 반환
          ├─ 오래된 응답 → 조건부 재검증 → 304 또는 새 응답
          └─ 미스 → 원본 요청 → 필요하면 저장
```

### 신선한 응답이 적중하면 원본까지 가지 않을 수 있다

캐시 키와 `Vary`, 인증·캐시 지시어 같은 재사용 조건이 맞고 응답이 신선하다면 캐시는 원본 서버에 요청을 전달하지 않고 저장된 응답을 바로 반환할 수 있다. 이것이 원본 부하와 지연을 줄이는 핵심 경로다.

### stale 항목은 검증자를 이용해 재검증할 수 있다

저장된 응답이 오래됐다면 ETag나 Last-Modified 같은 검증자가 있을 때 조건부 요청을 원본 서버로 보낼 수 있다.

```text
오래된 응답 + ETag
    ↓ If-None-Match
원본 서버
    ├─ 변경 없음 → 304 → 기존 본문 재사용 + 메타데이터 갱신
    └─ 변경 있음 → 새 200 응답 저장
```

검증자가 없거나 조건부 재검증을 사용할 수 없다면 새 표현을 다시 받아야 할 수 있다.

### 여러 캐시는 서로 다른 상태를 가질 수 있다

브라우저 캐시, 회사 프록시, CDN 엣지처럼 여러 캐시가 연속으로 존재하면 각 캐시는 별도의 저장 응답과 현재 나이를 가진다. 원본 데이터가 변경되었다고 모든 중간 캐시가 같은 순간 새 표현으로 바뀌는 것은 아니다.

```text
원본 서버: 새 버전
CDN 서울: 아직 이전 버전
CDN 부산: 재검증 후 새 버전
브라우저: 자체 캐시에 이전 버전
```

그래서 일부 사용자만 오래된 응답을 보는 장애에서는 원본 데이터만 확인하지 말고 **어느 캐시 계층에서 어떤 버전과 `Age`, ETag를 반환하는지** 분리해서 봐야 한다.

### 프록시와 캐시는 같은 개념이 아니다

역방향 프록시는 라우팅, TLS 종료, 요청 전달 같은 역할을 할 수 있지만 반드시 응답 캐시 기능을 사용하는 것은 아니다. 반대로 애플리케이션 내부 캐시는 HTTP 중간 캐시와 다른 계층이다.

한 캐시의 항목을 지웠다고 다른 캐시까지 자동으로 제거되는 것도 아니다. 핵심은 **중간 캐시가 HTTP 요청 경로 안에서 공유 응답의 저장·재사용·재검증을 담당하며, 각 캐시 계층이 독립적인 상태를 가질 수 있다는 점**이다.
