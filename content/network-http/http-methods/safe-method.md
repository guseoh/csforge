---
kind: concept
contentKey: network-http.core.http-methods.safe-method
topicContentKey: network-http.core.http-methods
slug: safe-method
title: "안전한 메서드(Safe Method)"
summary: "안전한 HTTP 메서드가 클라이언트가 대상 리소스의 상태 변경을 요청하지 않는 읽기 중심 의미를 가지며, 서버 내부의 모든 부수 효과를 금지하는 개념은 아닌 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 안전한 메서드(Safe Method)

HTTP 메서드가 **안전하다(safe)**는 것은 클라이언트가 그 요청을 통해 대상 리소스의 상태를 변경하도록 요구하거나 기대하지 않는다는 뜻이다. RFC 9110에서 GET, HEAD, OPTIONS, TRACE가 안전한 메서드로 정의된다.

```text
안전한 메서드의 질문

클라이언트가 이 요청으로
대상 리소스의 상태 변경을 요구하는가?
        ↓
아니오 → 안전한 메서드의 의미
```

여기서 `safe = 서버에서 아무 상태도 바뀌지 않는다`라고 이해하면 안 된다.

서버는 GET을 처리하면서 접근 로그를 남기거나 요청 수 지표를 증가시킬 수 있다. 광고 조회가 과금 통계를 바꾸는 것처럼 부수 효과가 생길 수도 있다. 중요한 것은 이런 변화가 **클라이언트가 GET의 의미로 요청한 리소스 상태 변경이 아니라는 점**이다.

### GET에 삭제 같은 동작을 숨기면 safe 계약을 깨뜨린다

다음 API를 생각해 보자.

```http
GET /posts/42?do=delete
```

메서드 이름이 GET이라는 이유만으로 이 요청이 안전해지는 것은 아니다. 실제로 게시글을 삭제한다면 서버가 GET의 표준 의미와 맞지 않는 동작을 구현한 것이다.

이런 설계가 특히 위험한 이유는 크롤러, 링크 검사기, 브라우저의 사전 가져오기(prefetch) 같은 도구가 **안전한 메서드는 상태 변경을 요청하지 않는다는 전제**로 GET을 자동 실행할 수 있기 때문이다.

```text
크롤러가 링크 발견
      ↓
GET 자동 요청
      ↓
GET 안에 삭제 동작이 숨겨져 있다면
의도하지 않은 삭제 발생 가능
```

따라서 삭제·결제·상태 전이처럼 사용자의 명시적인 변경 의도가 필요한 작업을 GET에 숨겨서는 안 된다.

### Safe는 인증·인가가 필요 없다는 뜻도 아니다

안전한 메서드는 리소스 상태 변경 의도에 관한 속성이지 공개 접근 여부에 관한 속성이 아니다.

```http
GET /members/me
```

이 요청은 조회 의미이므로 안전할 수 있지만, 다른 사용자가 임의로 조회하지 못하도록 인증과 인가는 필요할 수 있다.

즉 다음 속성은 서로 다른 질문이다.

```text
Safe?
→ 상태 변경을 요청하는가?

Authorized?
→ 이 사용자가 이 리소스에 접근할 권한이 있는가?
```

### Safe와 멱등성도 같은 속성이 아니다

안전한 메서드는 모두 멱등하지만, 모든 멱등 메서드가 안전한 것은 아니다. PUT과 DELETE는 상태 변경을 요청하므로 안전하지 않지만, 같은 요청을 반복했을 때 의도된 효과가 누적되지 않도록 멱등하게 정의된다.

```text
GET     안전 O / 멱등 O
PUT     안전 X / 멱등 O
DELETE  안전 X / 멱등 O
POST    안전 X / 멱등 X (메서드 자체 기준)
```

핵심은 **안전한 메서드가 서버 구현의 모든 부수 효과를 금지하는 것이 아니라, 클라이언트가 대상 리소스의 상태 변경을 요청하지 않는다는 HTTP 의미 계약이라는 점**이다.
