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

`Last-Modified`는 **선택된 표현(selected representation)이 마지막으로 변경되었다고 서버가 판단한 시각**을 HTTP 날짜 형식으로 제공하는 검증자다. 클라이언트는 이 값을 다음 요청의 `If-Modified-Since`에 넣어 그 이후 표현이 변경되었는지 조건부로 확인할 수 있다.

```text
Last-Modified: Tue, 15 Sep 2026 09:30:00 GMT
        ↓
If-Modified-Since: Tue, 15 Sep 2026 09:30:00 GMT
```

표현이 그 시각 이후 바뀌지 않았다면 조건부 GET/HEAD에서 `304 Not Modified`로 본문 전송을 생략할 수 있다.

### 시간 기반 검증자는 정밀도와 시계에 한계가 있다

HTTP 날짜는 초 단위 정밀도를 사용하므로 같은 초 안에서 표현이 여러 번 바뀌면 각 변경을 구분하지 못할 수 있다. 서버 시계가 부정확하거나 파일 복원·복사 과정에서 수정 시각이 실제 표현 변경과 어긋나면 값의 의미도 흔들릴 수 있다.

따라서 빠른 변경을 정확히 구분해야 한다면 ETag처럼 표현 버전을 더 직접적으로 식별하는 검증자가 적합할 수 있다. `Last-Modified`와 ETag를 함께 제공할 수도 있으며 조건부 요청에서는 HTTP가 정의한 전제조건 평가 순서를 따라야 한다.

### 내부 저장 시각을 그대로 복사하면 항상 맞는 것은 아니다

`Last-Modified`를 데이터베이스 행의 `updatedAt`이나 파일의 mtime과 기계적으로 동일시하면 안 된다. 하나의 HTTP 응답이 여러 행을 조합하거나 렌더링 규칙에 따라 달라진다면 내부 객체 하나의 수정 시각과 클라이언트가 받는 표현의 변경 시각이 다를 수 있다.

```text
DB 행 A updatedAt ─┐
DB 행 B updatedAt ─┼─→ 최종 HTTP 표현
렌더링 규칙 변경 ─┘

어느 한 시각만 그대로 Last-Modified로 쓰면
실제 표현 변경을 놓칠 수 있음
```

핵심은 **Last-Modified가 내부 저장 객체의 시각을 노출하는 필드가 아니라, 클라이언트가 받는 HTTP 표현의 변경 시점을 일관되게 나타내는 시간 기반 검증자라는 점**이다.
