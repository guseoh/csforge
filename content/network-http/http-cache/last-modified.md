---
kind: concept
contentKey: network-http.core.http-cache.last-modified
topicContentKey: network-http.core.http-cache
slug: last-modified
title: "Last-Modified 검증자"
summary: "선택된 표현의 수정 시각을 HTTP 날짜로 제공하는 시간 기반 검증자의 의미와 정밀도·시계 한계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Last-Modified 검증자

Last-Modified는 서버가 선택된 표현이 마지막으로 변경되었다고 판단한 시각을 HTTP 날짜로 표현합니다. 클라이언트는 이후 If-Modified-Since에 해당 값을 넣어 재검증할 수 있습니다.

```http
Last-Modified: Tue, 15 Sep 2026 09:30:00 GMT
```

표현의 수정 시각이 요청 날짜보다 늦지 않으면 조건부 GET 또는 HEAD에서 304로 콘텐츠 전송을 생략할 수 있습니다.

### 시간 기반 검증의 한계

HTTP-date는 초 단위이므로 같은 초에 두 번 변경된 표현을 구분하지 못할 수 있습니다. 파일 복원이나 시계 불일치도 영향을 줍니다. Last-Modified는 일반적으로 약한 검증자이며 강한 검증자로 인정하는 데는 별도의 조건이 있습니다.

### 내부 수정 시각과 표현

여러 DB 행과 렌더링 규칙을 합쳐 응답을 만든다면 한 행의 updatedAt만으로 최종 표현의 변경을 식별하기 어렵습니다. 표현과 검증자를 일관된 상태에서 계산해야 합니다. ETag를 함께 제공하는 경우 If-None-Match의 우선순위를 지켜야 합니다.
