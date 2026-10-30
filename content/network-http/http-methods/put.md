---
kind: concept
contentKey: network-http.core.http-methods.put
topicContentKey: network-http.core.http-methods
slug: put
title: "PUT과 전체 표현 교체"
summary: "PUT이 요청 표현으로 대상 자원의 상태를 생성하거나 대체하도록 요청하는 멱등 의미를 설명한다."
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
# PUT과 전체 표현 교체

PUT은 요청 콘텐츠에 담긴 표현(representation)이 나타내는 상태로 **대상 자원의 현재 상태를 생성하거나 대체해 달라**고 요청하는 메서드다. POST가 대상 자원에 처리 방법을 맡기는 것과 달리, PUT에서는 클라이언트가 어느 대상 URI에 어떤 상태를 적용하려는지 알고 있다는 점이 중요하다.

```text
변경 전: /profiles/42의 표현 상태 = {"nickname":"old"}
                     │
                     └─ PUT /profiles/42 {"nickname":"new"}
변경 후: /profiles/42의 표현 상태 = {"nickname":"new"}
반복   : 같은 PUT ───────────────→ 원하는 대상 상태는 그대로
```

이 전후 관계는 대상 자원의 원하는 상태를 대체한다는 의미를 보여 준다. 서버가 관리하는 내부 필드나 저장 방식을 요청 JSON 그대로 덮어쓴다는 뜻은 아니다.

자원이 아직 존재하지 않고 서버가 PUT을 통한 생성을 허용한다면 성공 후 `201 Created`를 반환할 수 있다. 기존 자원의 상태를 성공적으로 대체했다면 `200 OK`나 `204 No Content` 같은 응답을 사용할 수 있다.

### PUT은 멱등하다

같은 대상에 같은 원하는 상태를 반복해서 PUT하는 것은 새로운 효과를 계속 누적하는 의미가 아니다. 그래서 PUT은 HTTP에서 멱등 메서드(idempotent method)로 정의된다.

다만 멱등성이 다음을 뜻하는 것은 아니다.

- 매번 같은 상태 코드나 응답 바이트가 반환된다.
- 서버 코드가 정확히 한 번만 실행된다.
- 요청마다 남기는 감사 로그까지 한 번만 기록된다.
- 두 요청 사이 다른 사용자가 상태를 바꿔도 충돌이 자동 해결된다.

멱등성은 **동일한 PUT 요청이 요구하는 대상 상태 효과가 반복 횟수만큼 누적되지 않는다는 HTTP 의미**에 관한 계약이다.

### PUT은 데이터베이스 행 전체 덮어쓰기 규칙이 아니다

PUT을 `모든 필드를 DB 행에 그대로 overwrite한다`는 구현 규칙으로 축소하면 안 된다. HTTP가 정의하는 것은 대상 자원을 요청 표현이 나타내는 상태로 생성·대체하려는 **의도**다. 서버가 표현을 어떻게 저장하고, 서버 전용 필드나 파생 상태를 어떻게 관리할지는 자원 구현의 책임이다.

예를 들어 서버가 `updatedAt`, 내부 식별자, 감사 정보를 따로 관리해도 PUT 의미와 충돌하지 않는다. 중요한 것은 공개된 자원 표현 계약과 실제 적용 결과가 일관되는가다.

### 부분 변경은 별도 의미로 구분한다

일반적인 API에서 일부 필드만 바꾸려면 PATCH처럼 부분 변경 의미를 명시한 메서드를 사용할 수 있다.

```text
PUT
→ 대상 자원이 원하는 전체 상태를 표현

PATCH
→ 현재 상태에 적용할 변경 지시를 표현
```

핵심은 **PUT이 특정 대상 URI의 원하는 상태를 표현하며, 동일 요청 반복의 의도한 상태 효과가 누적되지 않도록 멱등하게 정의된다는 점**이다.
