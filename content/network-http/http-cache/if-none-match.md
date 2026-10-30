---
kind: concept
contentKey: network-http.core.http-cache.if-none-match
topicContentKey: network-http.core.http-cache
slug: if-none-match
title: "If-None-Match 조건부 요청"
summary: "클라이언트가 ETag를 보내 현재 표현과 일치하지 않을 때만 전체 응답을 받도록 하는 조건부 요청을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# If-None-Match 조건부 요청

`If-None-Match`는 클라이언트가 알고 있는 ETag를 요청에 보내고, 현재 선택된 표현이 그 검증자와 **일치하지 않을 때만** 일반 응답을 수행하도록 만드는 조건부 요청 필드다.

GET 또는 HEAD에서 ETag가 일치하면 서버는 표현 콘텐츠를 다시 보내지 않고 `304 Not Modified`를 반환할 수 있다. 일치하지 않으면 현재 표현을 일반적인 `200 OK` 응답으로 반환한다.

```text
If-None-Match: "v7"
        ↓
현재 ETag == "v7" ?
   예 → 304, 저장된 표현 재사용
   아니오 → 200 + 현재 표현
```

### GET/HEAD와 상태 변경 메서드는 조건 실패 결과가 다르다

`If-None-Match`는 단순 캐시 헤더만은 아니다. GET/HEAD에서는 기존 표현 재사용을 위한 재검증에 주로 쓰지만, 다른 메서드에서는 `*` 등을 사용해 대상 자원이 없을 때만 새로 만들도록 하는 전제조건에도 사용할 수 있다.

GET/HEAD에서 조건이 거짓이면 일반적으로 304를 사용하지만, 상태 변경 메서드의 전제조건이 거짓이면 `412 Precondition Failed`가 적용될 수 있다.

### If-Modified-Since보다 우선한다

같은 요청에 `If-None-Match`와 `If-Modified-Since`가 함께 있다면 ETag 기반 조건을 우선 평가하고 날짜 조건은 무시한다. 시간 정밀도보다 표현 버전을 직접 비교하는 조건을 우선하도록 한 것이다.

또한 약한 ETag도 `If-None-Match`의 약한 비교에 사용할 수 있으므로 단순 문자열 비교 규칙만으로 구현해서는 안 된다.

### ETag 일치가 인증·인가를 대신하지 않는다

조건부 요청을 평가하기 전에 어떤 자원과 어떤 표현을 대상으로 하는지 먼저 올바르게 선택해야 한다. 서로 다른 사용자 응답이 우연히 같은 ETag를 가졌다고 해서 한 사용자의 저장 표현을 다른 사용자에게 재사용할 수 있는 것은 아니다.

핵심은 **`If-None-Match`가 ETag를 이용해 현재 선택된 표현의 버전을 비교하는 HTTP 전제조건이며, 캐시 재검증과 상태 변경 보호에서 메서드별 결과가 달라질 수 있다는 점**이다.
