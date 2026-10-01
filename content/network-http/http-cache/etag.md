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

`ETag`는 서버가 **현재 선택된 표현을 구분하기 위해 제공하는 불투명한 검증자**다. HTTP는 ETag를 어떤 알고리즘으로 만들어야 하는지 정하지 않는다. 해시, 버전 번호, 빌드 식별자 등을 사용할 수 있지만 클라이언트는 그 내부 의미를 해석하지 않고 값 자체를 비교한다.

```http
ETag: "v7"
ETag: W/"v7"
```

### 강한 ETag와 약한 ETag는 비교 강도가 다르다

강한 검증자는 표현 데이터의 관찰 가능한 변화가 생기면 이를 구분할 수 있어야 한다. 따라서 바이트 단위 동일성이 필요한 비교에 사용할 수 있다.

`W/`가 붙은 약한 ETag는 바이트가 완전히 같지 않아도 의미상 동등한 표현을 같은 버전으로 취급할 수 있다. 이 차이 때문에 조건부 요청마다 사용할 수 있는 비교 방식이 다르다.

| 구분 | 의미 | 대표 사용 경계 |
| --- | --- | --- |
| 강한 ETag | 표현 데이터의 강한 동일성 비교 | `If-Match`, 범위 요청처럼 강한 비교가 필요한 조건 |
| 약한 ETag | 의미상 동등한 표현을 허용할 수 있음 | `If-None-Match` 재검증의 약한 비교 등 |

### 같은 ETag도 요청 목적에 따라 역할이 달라진다

클라이언트는 ETag를 `If-None-Match`에 넣어 캐시에 저장한 표현이 여전히 현재 버전인지 확인할 수 있다. 반대로 `If-Match`를 사용하면 상태 변경 요청을 **특정 버전일 때만 적용하는 전제조건**으로 사용할 수 있다.

```text
캐시 재검증
ETag → If-None-Match
→ 같은 표현이면 304로 본문 전송 생략 가능

동시 수정 방지
ETag → If-Match
→ 현재 버전이 다르면 변경 적용 거부 가능
```

두 경우 모두 ETag를 사용하지만 하나는 캐시 전송 최적화이고 다른 하나는 상태 변경 전제조건이다. 목적과 비교 규칙을 섞으면 안 된다.

### ETag의 범위는 실제로 선택되는 표현과 맞아야 한다

언어, 콘텐츠 인코딩, 질의 조건처럼 응답 표현을 바꾸는 요소가 있는데도 모두 같은 ETag를 사용하면 서로 다른 표현을 같은 버전으로 오인할 수 있다. 캐시 키와 `Vary`, 표현 선택 조건을 함께 고려해야 한다.

ETag는 인증 토큰이나 자원의 영구 ID가 아니다. 핵심은 **클라이언트가 생성 방식을 몰라도 현재 선택된 표현의 버전을 비교할 수 있게 하는 HTTP 검증자**라는 점이다.
