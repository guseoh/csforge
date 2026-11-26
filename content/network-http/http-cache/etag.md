---
kind: concept
contentKey: network-http.core.http-cache.etag
topicContentKey: network-http.core.http-cache
slug: etag
title: "ETag 검증자"
summary: "선택된 표현을 비교하기 위한 불투명한 엔터티 태그와 강한·약한 검증자의 차이를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# ETag 검증자

ETag는 선택된 표현을 비교하기 위한 불투명한 HTTP 검증자입니다. 서버는 해시나 버전 번호 등으로 생성할 수 있지만 클라이언트는 내부 의미를 해석하지 않고 비교 규칙을 적용합니다.

```http
ETag: "v7"
ETag: W/"v7"
```

강한 검증자는 표현 데이터의 관찰 가능한 변경을 구분할 수 있어야 합니다. 약한 검증자는 바이트가 다르더라도 서버가 의미상 동등하다고 판단한 표현을 같은 태그로 나타낼 수 있습니다.

| 조건 | 비교 방식 |
| --- | --- |
| If-Match | 강한 비교 |
| If-None-Match | 약한 비교 |
| If-Range에 사용하는 ETag | 강한 검증자 필요 |

### 표현과 검증자의 일관성

gzip과 identity로 코딩된 표현의 바이트가 다르다면 강한 태그를 동일하게 사용해서는 안 됩니다. 언어, 미디어 유형 및 콘텐츠 코딩 등 선택 조건과 Vary, 캐시 키, ETag 계산을 맞춰야 합니다.

조건부 GET은 ETag를 활용하여 304로 콘텐츠 전송을 줄일 수 있습니다. 상태 변경에서는 If-Match로 오래된 표현을 기준으로 하는 갱신을 거부할 수 있습니다. 실제 검사와 저장의 원자성이 필요하며 ETag가 DB의 낙관적 락을 자동으로 구현하지는 않습니다.

ETag는 자원의 영구 ID나 사용자 인증 수단이 아닙니다.
