---
kind: concept
contentKey: java.core.design-patterns.state-pattern
topicContentKey: java.core.design-patterns
slug: state-pattern
title: "State 패턴과 상태별 행동"
summary: "상태별 허용 행동과 전이 규칙을 명시하고, 실패 시 상태 보존·전이 주체·enum 대안·workflow orchestration과의 경계를 함께 판단한다"
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: class 기반 상태 객체 구현의 언어 기반 확인
---
# State 패턴과 상태별 행동

객체의 행동이 현재 상태에 따라 달라지는 것은 자연스럽습니다. 상태가 몇 개 없고 규칙이 단순하다면 enum과 조건문만으로도 충분할 수 있습니다.

```java
void cancel() {
    if (status != PAID) {
        throw new IllegalStateException();
    }
    status = CANCELLED;
}
```

문제는 상태가 늘어나면서 여러 메서드가 같은 `switch(status)`를 반복하고, 상태별 허용 행동과 전이 규칙이 여러 곳에 흩어질 때입니다. State 패턴은 **현재 상태를 객체로 표현하고 그 상태에서 가능한 행동과 다음 상태를 가까이 모으는 방식**입니다.

```text
Document
   │ current state
   ▼
DocumentState
   ├─ DraftState
   ├─ PublishedState
   └─ ArchivedState
```

### 먼저 상태 전이를 명확히 한다

패턴을 적용하기 전에 어떤 상태에서 어떤 행동이 허용되는지 정리하는 것이 먼저입니다.

| 현재 상태 | publish | revise | archive |
| --- | --- | --- | --- |
| DRAFT | PUBLISHED | 거부 | 거부 |
| PUBLISHED | 거부 | DRAFT | ARCHIVED |
| ARCHIVED | 거부 | 거부 | 거부 |

State 객체는 이런 전이 규칙을 상태별 책임으로 나눌 수 있습니다.

```java
interface DocumentState {
    DocumentState publish();
    DocumentState revise();
    DocumentState archive();
}

final class Document {
    private DocumentState state = new DraftState();

    void publish() {
        state = state.publish();
    }
}
```

`DraftState`는 DRAFT에서 가능한 행동과 다음 상태를 알고, `PublishedState`는 PUBLISHED의 규칙을 가집니다.

### 장점은 조건문 제거가 아니라 상태별 규칙의 응집이다

상태마다 클래스 하나를 만들었다고 자동으로 좋아지는 것은 아닙니다. State 패턴의 가치는 **한 상태의 행동 규칙이 함께 바뀔 때 관련 코드도 함께 위치할 수 있다는 점**입니다.

반대로 상태가 세 개뿐이고 `canCancel()` 같은 규칙 몇 개만 있다면 enum이 더 단순할 수 있습니다.

```java
enum OrderStatus {
    READY,
    PAID,
    CANCELLED;

    boolean canCancel() {
        return this == PAID;
    }
}
```

State 객체는 상태별 행동이나 상태 전용 데이터가 충분히 커져 하나의 책임으로 분리할 가치가 있을 때 더 자연스럽습니다.

### 실패한 전이는 상태를 어떻게 남기는지도 계약이다

전이가 허용되지 않을 때 예외를 던지기 전에 상태를 먼저 바꾸면 객체가 잘못된 상태로 남을 수 있습니다. Java 예외가 앞선 필드 변경을 자동으로 되돌리는 것은 아니기 때문입니다.

따라서 **현재 상태 확인 → 전이 가능 여부 판단 → 상태 변경**의 흐름을 명확히 해야 합니다.

State 객체가 다음 상태를 직접 Context에 설정할 수도 있고, 다음 상태를 반환해서 Context가 변경하게 할 수도 있습니다. 어느 방식이든 핵심은 `setState(...)`가 여러 호출자에 흩어지지 않고 **전이 규칙을 일관된 경계가 소유하는 것**입니다.

### Strategy와 의도를 구분한다

둘 다 interface와 여러 구현 객체를 사용해 코드 모양이 비슷할 수 있습니다.

```text
Strategy → 어떤 정책을 선택할 것인가
State    → 현재 상태에서 무엇을 할 수 있고 어디로 전이하는가
```

할인 계산 방식을 고르는 문제는 Strategy에 가깝고, 주문이 `PAID → SHIPPED`로 진행되면서 가능한 행동이 달라지는 문제는 State에 가깝습니다.

또 State 객체가 외부 결제 호출, 여러 저장소 조정, 트랜잭션 경계까지 모두 담당할 필요는 없습니다. State 패턴은 **객체 내부의 상태별 행동과 전이 규칙**을 모델링하는 도구이며, 여러 외부 작업을 조정하는 유스케이스 책임과는 구분하는 것이 좋습니다.
