---
kind: concept
contentKey: network-http.core.http-methods.idempotent-method
topicContentKey: network-http.core.http-methods
slug: idempotent-method
title: "멱등 메서드(Idempotent Method)"
summary: "같은 요청을 여러 번 수행했을 때 intended effect가 한 번 수행한 것과 같다는 HTTP idempotency를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 멱등 메서드(Idempotent Method)

HTTP에서 메서드가 멱등(idempotent)하다는 것은 같은 요청을 여러 번 수행해도 클라이언트가 의도한 서버 효과가 한 번 수행했을 때와 같도록 메서드 의미가 정의되어 있다는 뜻이다. 안전한 메서드와 PUT, DELETE가 멱등 메서드에 해당한다.

예를 들어 특정 리소스의 상태를 원하는 값으로 바꾸는 같은 PUT 요청을 두 번 보내도 두 번째 요청이 상태 변경을 한 번 더 누적하지 않는다. DELETE도 이미 리소스와 URI의 연결이 제거된 대상에 같은 삭제 의도를 반복한다고 해서 삭제 효과가 계속 누적되지는 않는다.

| 반복하는 요청 | 의도한 서버 효과 | 응답이 달라질 수 있는가? |
| --- | --- | --- |
| 같은 PUT으로 설정 값을 `dark`로 지정 | 값은 `dark` 상태로 유지 | 예. 날짜·상태 코드·동시 변경 관찰은 달라질 수 있음 |
| 같은 DELETE로 대상 리소스의 연결 제거 | 연결은 계속 제거된 상태 | 예. 반복 요청은 `404` 또는 자원별 응답을 반환할 수 있음 |
| 같은 POST로 주문 생성 | 애플리케이션에 따라 새 주문이 추가될 수 있음 | 가능. 별도 중복 방지 계약이 필요할 수 있음 |

### 멱등성은 응답이 항상 같다는 뜻이 아니다

두 PUT 사이에 다른 클라이언트가 리소스를 수정할 수도 있고, 서버는 요청마다 새 `Date` 필드나 감사 로그를 만들 수 있다. 첫 DELETE가 `204`를 반환하고 반복 DELETE는 리소스 상태에 따라 다른 상태 코드를 반환할 수도 있다. 이런 차이가 있다고 메서드의 의도한 효과가 곧바로 비멱등성이 되는 것은 아니다.

이 속성은 통신 실패 뒤 재시도할지 판단할 때 중요하다. 클라이언트가 요청을 보냈지만 응답을 받기 전에 연결이 끊겼다면, 멱등 메서드는 원래 요청이 이미 적용됐을 가능성이 있어도 같은 의도한 효과를 다시 요청할 수 있도록 정의되어 있다.

하지만 멱등성이 네트워크가 요청을 정확히 한 번만 전달하거나 실행한다는 뜻은 아니다. 요청은 서버에 여러 번 도착할 수 있다. **HTTP 멱등성은 반복 요청의 의도한 효과에 관한 의미 계약**이며, 특정 업무 부수 효과의 중복 방지에는 별도의 애플리케이션 계약이 필요할 수 있다.
