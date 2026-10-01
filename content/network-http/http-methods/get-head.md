---
kind: concept
contentKey: network-http.core.http-methods.get-head
topicContentKey: network-http.core.http-methods
slug: get-head
title: "GET과 HEAD"
summary: "GET의 표현 조회 의미와 HEAD가 응답 콘텐츠 전송을 생략하는 차이를 비교한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# GET과 HEAD

GET은 대상 자원의 **현재 선택된 표현을 전송해 달라**고 요청하는 메서드다. 웹 문서, JSON 응답, 이미지처럼 자원의 현재 표현을 조회할 때 가장 일반적으로 사용한다. GET은 안전하고 멱등인 메서드로 정의되므로 계정 삭제처럼 자원 상태를 바꾸는 명령 의미를 GET에 숨겨서는 안 된다.

HEAD는 GET과 같은 조회 의미를 사용하지만 서버가 **응답 콘텐츠를 전송하지 않는다**는 차이가 있다. 클라이언트는 큰 본문을 내려받지 않고도 상태 코드, 캐시 검증자, 콘텐츠 형식 같은 메타데이터를 확인할 수 있다.

```text
GET  → 상태 코드 + 헤더 + 표현 콘텐츠
HEAD → 상태 코드 + 헤더, 응답 콘텐츠 없음
```

### HEAD 응답이 GET 응답을 그대로 복사한 것은 아니다

서버는 일반적으로 대응하는 GET에서 보낼 헤더 필드와 같은 의미의 메타데이터를 HEAD에도 제공해야 한다. 다만 실제 콘텐츠를 생성해야만 계산할 수 있는 일부 필드는 생략할 수 있다. 따라서 HEAD를 단순히 `GET 응답을 만든 뒤 본문 바이트만 제거한 것`이라고 이해하면 구현 비용과 세부 규칙을 놓칠 수 있다.

예를 들어 클라이언트는 HEAD를 사용해 ETag나 Last-Modified를 확인하고 전체 콘텐츠를 다시 받을 필요가 있는지 판단할 수 있다. 하지만 특정 헤더가 GET에서 보였다는 이유만으로 HEAD에도 항상 존재한다고 가정해서는 안 된다.

### 요청 콘텐츠와 메서드 의미는 별개다

GET이나 HEAD 요청에 전송 수준의 콘텐츠가 존재할 가능성과, 그 콘텐츠에 표준화된 의미가 있는지는 구분해야 한다. HTTP는 일반적인 GET/HEAD 요청 콘텐츠에 보편적인 의미를 정의하지 않는다. 그래서 대상 자원 식별이나 명령 입력을 요청 본문에 의존하도록 설계하면 중개자·캐시·클라이언트 사이에서 상호운용성이 떨어질 수 있다.

핵심은 **GET은 선택된 표현을 전송하고, HEAD는 같은 조회 의미를 유지하면서 응답 콘텐츠 전송만 생략한다**는 점이다.
