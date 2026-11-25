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

CDN은 여러 엣지 지점에서 클라이언트의 요청을 받는 분산 HTTP 중개 서비스입니다. 엣지가 원본 서버 앞에 배치되고 캐시 기능을 사용한다면 여러 사용자가 공유하는 저장 응답을 제공할 수 있습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "CDN의 HTTP 중개와 캐시",
  "description": "프로토콜 상태·요청 경계와 이전·이후 결과를 고정 예제로 확인합니다.",
  "example": "cdn-http-intermediary"
}
```

재사용할 수 있는 신선한 응답이 있으면 원본에 새 요청을 보내지 않고 응답합니다. 캐시 미스 또는 재검증이 필요한 경우 엣지가 원본에 별도 요청을 보냅니다. 캐시 적중 여부만이 아니라 Vary, 인증 자격, 캐시 지시어 및 실제 키가 재사용 조건에 맞아야 합니다.

### 연결과 캐시의 독립성

클라이언트와 엣지의 연결, 엣지와 원본의 연결은 독립적입니다. TLS 종료, 압축, 필드 정리 및 부하 분산 등은 실제 서비스 설정에 따라 다릅니다. 엣지 캐시의 상태가 원본 DB나 애플리케이션 내부 캐시와 항상 일치하는 것도 아닙니다.

일부 지역에서만 이전 표현을 반환한다면 엣지별 캐시 상태, Age, ETag, 캐시 키와 원본 응답을 비교합니다. CDN 무효화와 원본 데이터 변경은 별도의 작업입니다.
