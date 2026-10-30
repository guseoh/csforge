---
kind: concept
contentKey: network-http.core.http-cache.if-modified-since
topicContentKey: network-http.core.http-cache
slug: if-modified-since
title: "If-Modified-Since 조건부 요청"
summary: "Last-Modified 시각 이후 선택된 표현이 변경되었는지를 확인하는 시간 기반 조건부 GET/HEAD를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# If-Modified-Since 조건부 요청

`If-Modified-Since`는 클라이언트가 이전 응답에서 받은 `Last-Modified` 값을 요청에 보내고, **선택된 표현이 그 시각 이후 변경되었는지** 묻는 조건부 요청 필드다.

GET 또는 HEAD에서 표현이 지정한 시각 이후 변경되지 않았다면 서버는 콘텐츠를 다시 보내지 않고 `304 Not Modified`를 반환할 수 있다. 변경되었다면 현재 표현을 일반 응답으로 전달한다.

```text
If-Modified-Since: T
        ↓
표현이 T 이후 변경됐는가?
   아니오 → 304
   예     → 200 + 현재 표현
```

### 시간 기반 조건에는 정밀도 한계가 있다

이 방식은 HTTP 날짜의 초 단위 정밀도와 서버 시계에 의존한다. 같은 초 안에서 여러 번 변경된 표현을 구분하지 못하거나, 수정 시각이 실제 표현 변경과 정확히 맞지 않을 수 있다.

그래서 더 직접적인 표현 버전 비교가 필요하면 ETag와 `If-None-Match`를 사용할 수 있다.

### If-None-Match가 함께 있으면 ETag 조건이 우선한다

요청에 `If-None-Match`와 `If-Modified-Since`가 모두 있다면 서버는 ETag 조건을 우선하고 날짜 조건은 무시한다. 같은 표현에 대해 버전 검증과 날짜 검증이 서로 다른 결론을 내리는 상황을 피하기 위한 평가 순서다.

```text
If-None-Match 있음
→ ETag 조건 평가
→ If-Modified-Since는 사용하지 않음

If-None-Match 없음
→ If-Modified-Since를 사용할 수 있음
```

### 업무 버전과 같은 값은 아니다

`If-Modified-Since`는 HTTP 표현의 전송을 줄이기 위한 시간 기반 재검증 수단이다. 데이터베이스 낙관적 락 버전이나 업무 상태 전이 버전을 완전히 대신하는 값으로 사용하면 안 된다.

핵심은 **Last-Modified를 이용해 표현 변경 여부를 시간 기준으로 확인하는 조건부 요청이며, ETag 조건이 함께 있을 때는 ETag가 우선한다는 점**이다.
