---
kind: concept
contentKey: network-http.core.http-state-intermediary.cdn-http-intermediary
topicContentKey: network-http.core.http-state-intermediary
slug: cdn-http-intermediary
title: "CDN의 HTTP 중개와 캐시"
summary: "CDN 엣지가 역방향 프록시와 공유 캐시로서 원본 서버 앞에 별도 HTTP 구간을 만들고 응답을 직접 반환할 수도 있음을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# CDN의 HTTP 중개와 캐시

CDN은 여러 엣지 지점에 HTTP 중개자를 배치해 클라이언트 가까이에서 요청을 받고 응답을 전달한다. HTTP 관점에서 CDN 엣지는 원본 서버 앞의 분산 역방향 프록시이며, 캐시 기능을 사용하면 여러 요청이 함께 이용하는 공유 캐시가 될 수 있다.

엣지에 현재 재사용할 수 있는 신선한 응답이 있으면 원본 서버에 새 요청을 보내지 않고 클라이언트에 바로 돌려줄 수 있다. 캐시가 비었거나 다시 확인해야 하면 엣지는 원본 서버를 향한 별도 HTTP 요청을 만든다. 따라서 클라이언트에서 엣지까지와 엣지에서 원본까지는 서로 다른 연결 구간이다.

```text
클라이언트 → CDN 엣지
               ├─ 신선한 응답 적중 → 응답 반환
               └─ 미스·재검증 필요 → 원본 서버에 요청
```

CDN은 TLS 종료, 압축, 필드 변환 같은 기능을 더할 수 있지만 모든 배포 환경에서 항상 켜져 있는 것은 아니다. 엣지 캐시는 원본 애플리케이션의 데이터베이스나 별도 애플리케이션 캐시와 같은 상태를 공유하지 않는다.

그러므로 클라이언트가 받은 응답이 매번 현재 원본 요청에서 새로 만들어졌다고 가정하면 안 된다. **CDN은 원본 서버 앞에서 요청을 전달하거나 저장된 응답을 직접 반환하는 HTTP 중개자**다. 응답을 언제 재사용하고 다시 확인하는지는 HTTP 캐시 규칙에 따라 판단한다.
