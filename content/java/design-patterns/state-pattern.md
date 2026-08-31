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

객체의 행동이 현재 상태에 따라 달라지는 것은 자연스럽습니다. 주문은 `DRAFT`, `PAID`, `COMPLETED`, `CANCELLED` 같은 lifecycle을 가질 수 있고 각 상태에서 허용되는 행동도 다릅니다.

상태가 몇 개 없고 규칙이 단순하면 조건문으로도 충분합니다.

```java
void cancel() {
    if (status == PAID) {
        status = CANCELLED;
    } else {
        throw new IllegalStateException();
    }
}
```

문제는 상태가 늘어나면서 여러 method가 같은 `switch(status)`를 반복할 때입니다.

```java
publish()
revise()
archive()
restore()
...
```

각 method가 상태별 분기를 따로 가지면 새 상태를 추가할 때 여러 switch를 동시에 고쳐야 하고, 허용 전이 규칙이 흩어질 수 있습니다. State 패턴은 **현재 상태를 object로 표현하고 그 상태에서 가능한 행동과 전이를 가까이 모으는 방식**입니다.

```text
Document(Context)
   │ current State
   ▼
DocumentState
   ├─ DraftState
   ├─ PublishedState
   └─ ArchivedState
```

### 먼저 transition table을 만들면 패턴이 필요한지 판단하기 쉽다

State class를 만들기 전에 상태 전이 자체를 명확히 하는 것이 먼저입니다.

| 현재 상태 | publish   | revise | archive  |
| --------- | --------- | ------ | -------- |
| DRAFT     | PUBLISHED | 거부   | 거부     |
| PUBLISHED | 거부      | DRAFT  | ARCHIVED |
| ARCHIVED  | 거부      | 거부   | 거부     |

이 표는 단순 문서가 아니라 **테스트 가능한 contract**입니다. 어떤 요청이 성공하고 다음 상태가 무엇인지, 거부된 요청에서 상태가 유지되는지를 분명히 합니다.

State 패턴을 적용해도 이 전이 규칙이 사라지는 것이 아닙니다. 오히려 각 State object가 표의 한 행을 소유하게 됩니다.

### State object는 현재 상태의 행동을 응집한다

```java
interface DocumentState {
    void publish(Document document);
    void revise(Document document);
    void archive(Document document);
}
```

```java
final class DraftState implements DocumentState {
    @Override
    public void publish(Document document) {
        document.changeState(new PublishedState());
    }

    @Override
    public void revise(Document document) {
        throw new IllegalStateException();
    }

    @Override
    public void archive(Document document) {
        throw new IllegalStateException();
    }
}
```

Context는 현재 State에게 행동을 위임합니다.

```java
final class Document {
    private DocumentState state = new DraftState();

    void publish() {
        state.publish(this);
    }
}
```

이제 `DRAFT`의 publish/revise/archive 규칙은 `DraftState`에 모이고 `PUBLISHED` 규칙은 `PublishedState`에 모입니다.

### 장점은 조건문을 없애는 것이 아니라 관련 변경 이유를 모으는 데 있다

State class가 많아졌다고 좋은 설계가 되는 것은 아닙니다. 진짜 이점은 특정 상태의 규칙이 함께 변할 때 관련 코드가 같은 위치에 있다는 것입니다.

예를 들어 `ARCHIVED`에서 새 `restore()` 정책이 추가되면 `ArchivedState`를 중심으로 검토할 수 있습니다. 반대로 상태별 행동은 거의 없고 단순 `canCancel()` 하나뿐이라면 여러 State class가 오히려 과할 수 있습니다.

패턴의 목표는 `if`를 0개로 만드는 것이 아니라 **상태별 policy의 응집도를 높이는 것**입니다.

### 실패한 전이는 현재 상태를 유지해야 하는가를 명확히 한다

다음 sequence를 생각해 봅시다.

```text
DRAFT
  publish  -> PUBLISHED
  revise   -> DRAFT
  archive  -> reject, DRAFT 유지
  publish  -> PUBLISHED
  archive  -> ARCHIVED
```

세 번째 `archive()`가 실패했다고 해서 과거에 한 번 PUBLISHED였다는 이유로 archive를 허용하면 안 됩니다. 매 호출은 **현재 state**를 기준으로 판단해야 합니다.

또한 실패를 표현하기 전에 state를 먼저 바꾸면 contract가 깨질 수 있습니다.

```java
void archive(Document document) {
    document.changeState(ARCHIVED);
    validateCanArchive(document); // 여기서 실패하면 이미 state가 바뀜
}
```

가능하면 전이 가능성을 확인한 뒤 state를 변경하고, 실패 후 상태가 무엇인지 명시해야 합니다. Java exception은 앞선 field 변경을 자동으로 되돌리지 않습니다.

### “누가 state를 바꾸는가”도 설계 선택이다

앞의 예시는 State가 `document.changeState(...)`를 호출했습니다. 다른 설계에서는 State가 다음 상태를 반환하고 Context가 실제 변경을 수행할 수도 있습니다.

```java
interface DocumentState {
    DocumentState publish();
}
```

```java
void publish() {
    state = state.publish();
}
```

첫 방식은 State가 Context 전이를 직접 제어하고, 두 번째는 State가 transition 결과만 계산합니다. 둘 중 하나가 절대적으로 맞는 것은 아닙니다.

중요한 것은 transition 책임이 여러 호출자에 흩어져 `document.setState(...)`를 아무 곳에서나 호출하지 않도록 하는 것입니다. **현재 상태와 전이 규칙이 한 일관된 경계를 통해 변경되는가**를 봐야 합니다.

### 상태와 상태 데이터가 함께 움직이면 State object의 가치가 커질 수 있다

단순 enum 값만 다르게 동작하는 것이 아니라 상태별로 필요한 데이터가 다를 수 있습니다.

```text
DRAFT      : lastEditedAt
PUBLISHED  : publishedAt, publisher
ARCHIVED   : archivedAt, reason
```

이런 데이터와 행동이 각 상태에 강하게 묶이면 State object로 분리했을 때 응집도가 좋아질 수 있습니다.

반대로 모든 상태가 같은 데이터 구조를 공유하고 행동 차이도 작다면 enum이 더 단순할 수 있습니다.

### enum에 행동을 두는 방식이 더 적절한 경우도 많다

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

상태 수가 적고 state-specific data나 복잡한 transition logic이 없다면 enum + intention-revealing domain method만으로 충분할 수 있습니다.

```java
void cancel() {
    if (!status.canCancel()) {
        throw new IllegalStateException();
    }
    status = CANCELLED;
}
```

이 구조는 class 수가 적고 전체 transition을 한눈에 보기 쉽습니다. State 패턴은 조건문이 보인다는 이유만으로 도입하는 것이 아니라 **상태별 행동이 독립된 책임으로 커지는 시점**에 검토합니다.

### Strategy와 모양이 비슷해도 교체 이유가 다르다

State와 Strategy 모두 interface field에 concrete implementation을 넣는 합성 구조가 될 수 있습니다.

```text
Context -> interface -> implementation
```

Strategy는 보통 호출자나 구성 코드가 **알고리즘/정책을 선택**합니다. State는 객체의 lifecycle이 진행되면서 **현재 상태가 내부 전이에 따라 바뀌고 그에 따라 행동이 달라지는 것**이 중심입니다.

할인 알고리즘을 GoldPolicy에서 VipPolicy로 외부 설정에 따라 바꾸는 것은 Strategy에 가깝고, 주문이 `PAID -> SHIPPED`로 이동하면서 가능한 행동이 바뀌는 것은 State에 가깝습니다.

### State object 안에 전체 use case orchestration을 넣지 않는다

주문 취소가 다음 작업을 포함한다고 해 보겠습니다.

```text
현재 상태 검증
결제 provider 환불 호출
재고 복구
DB transaction
notification
```

현재 주문 상태에서 취소가 가능한지와 어떤 내부 상태로 전이하는지는 domain State가 소유할 수 있습니다. 하지만 외부 PG 호출과 여러 aggregate 조정, transaction boundary까지 `PaidState.cancel()` 하나에 모두 넣으면 State object가 application orchestration까지 떠안을 수 있습니다.

```text
Application use case
   ├─ 외부 시스템 / repository 조정
   └─ Domain에게 상태 전이 요청
           │
           ▼
        State 규칙
```

State는 **객체 내부의 상태별 행동과 전이 규칙**을 모델링하는 도구이지 모든 workflow를 흡수하는 패턴이 아닙니다.

### 상태가 늘어날 때 class 수 증가라는 비용도 생긴다

10개 상태와 8개 행동이 있다고 해서 무조건 10개 State class가 더 읽기 쉬운 것은 아닙니다. 간단한 규칙까지 class 여러 곳에 흩어지면 전체 transition graph를 보기 어려워질 수 있습니다.

그래서 적용 전후로 다음을 비교해야 합니다.

```text
현재 문제
- 반복 switch가 여러 method에 흩어졌는가
- 상태별 데이터/행동이 충분히 큰가
- 새 상태 추가 시 여러 곳을 동시에 고쳐야 하는가

State 적용 비용
- class 수 증가
- context와 state 사이 전이 연결
- 전체 workflow를 여러 파일에서 추적해야 함
```

State 패턴의 품질은 class diagram으로 판단하기보다 실제 transition sequence로 검증하는 편이 좋습니다. 시작 상태에서 여러 행동을 차례로 호출했을 때 어떤 요청이 성공하고 실패하는지, 실패 후 state가 유지되는지, transition 변경 지점이 한곳에 있는지 추적하면 됩니다. 좋은 State 설계는 상태 이름을 class로 옮기는 것이 아니라 **현재 상태가 허용하는 행동과 다음 상태를 명시적인 책임으로 만든다**는 데 의미가 있습니다.
