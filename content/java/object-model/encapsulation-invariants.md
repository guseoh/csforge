---
kind: concept
contentKey: java.core.object-model.encapsulation-invariants
topicContentKey: java.core.object-model
slug: encapsulation-invariants
title: "캡슐화와 객체의 불변 조건"
summary: "객체 상태를 직접 노출하기보다 상태 변경 규칙을 객체의 동작으로 감싸 유효한 상태를 지키는 이유를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.6"
    title: "JLS 6.6 Access Control"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java 접근 제어의 언어 규칙 확인
  - url: "https://tecoble.techcourse.co.kr/post/2020-04-28-ask-instead-of-getter/"
    title: "Tecoble: getter를 사용하는 대신 객체에 메시지를 보내자"
    referenceType: KOREAN_BLOG
    language: ko
    displayOrder: 2
    relationNote: 상태를 꺼내 외부에서 판단하기보다 객체에 의도를 전달하는 설계 사례 보충
---
# 캡슐화와 객체의 불변 조건

캡슐화를 단순히 “필드를 `private`으로 만든다”라고 이해하면 절반만 이해한 것입니다. 중요한 목적은 **객체가 자신의 상태를 어떤 규칙으로 바꿀 수 있는지 스스로 관리하게 하는 것**입니다.

예를 들어 재고는 음수가 되면 안 된다고 해 보겠습니다.

```java
class Stock {
    private int quantity;
}
```

필드가 `private`인 것만으로는 아직 규칙이 만들어지지 않았습니다. 다음처럼 모든 값을 그대로 받는 setter를 공개하면 외부 코드가 객체의 유효성을 쉽게 깨뜨릴 수 있습니다.

```java
void setQuantity(int quantity) {
    this.quantity = quantity;
}
```

### 상태가 아니라 의도를 드러내는 동작을 제공한다

재고가 줄어드는 이유가 “출고”라면 그 의도를 메서드로 표현할 수 있습니다.

```java
void decrease(int amount) {
    if (amount <= 0) {
        throw new IllegalArgumentException();
    }
    if (quantity < amount) {
        throw new IllegalStateException("재고가 부족합니다.");
    }
    quantity -= amount;
}
```

이제 외부에서는 `quantity`를 마음대로 바꾸는 것이 아니라 `decrease`라는 동작을 요청합니다. 객체는 그 과정에서 자신이 지켜야 할 조건을 검사합니다.

이처럼 객체가 항상 지켜야 하는 조건을 **불변 조건(invariant)** 이라고 부릅니다. “재고는 0 이상”, “완료된 주문은 다시 결제 대기 상태로 돌아갈 수 없음” 같은 규칙이 예입니다.

### getter가 많다고 캡슐화가 자동으로 깨지는 것은 아니다

객체의 상태를 읽는 일이 모두 나쁜 것은 아닙니다. 화면에 주문 금액을 표시하거나 응답 DTO를 만들려면 값이 필요할 수 있습니다.

문제는 외부 코드가 객체 내부 상태를 꺼낸 뒤 **객체가 알아야 할 규칙까지 밖에서 판단하고 변경하는 구조**입니다.

```java
if (order.getStatus() == PAID) {
    order.setStatus(CANCELLED);
}
```

이 코드가 여러 곳에 퍼지면 “어떤 상태에서 취소 가능한가”라는 정책도 여러 곳에 흩어집니다.

```java
order.cancel();
```

취소 가능 여부를 `Order`가 판단한다면 규칙의 위치가 더 분명해집니다.

### 캡슐화는 변경 영향을 줄인다

객체 내부 표현이 `int quantity`에서 별도 값 객체로 바뀌더라도 외부가 `decrease()`라는 동작만 알고 있다면 변경 범위가 작아질 수 있습니다. 반대로 외부가 필드 구조와 변경 순서를 자세히 알고 있다면 내부 표현을 바꿀 때 여러 호출부를 함께 고쳐야 합니다.

그래서 캡슐화는 단순한 “정보 숨기기”를 넘어 **변경될 수 있는 세부와 반드시 지켜야 할 규칙을 한 경계 안에 모으는 설계**로 이해하는 것이 좋습니다.

### 실무에서 확인할 질문

객체를 리뷰할 때는 다음을 보면 좋습니다.

- 외부가 필드를 어떤 값으로든 바꿀 수 있는가?
- 상태 변경 전에 확인해야 하는 규칙이 여러 서비스에 흩어져 있는가?
- 메서드 이름이 `setStatus`보다 `complete`, `cancel`, `publish`처럼 의도를 드러낼 수 있는가?
- 컬렉션을 그대로 반환해 외부가 내부 상태를 직접 변경할 수 있지는 않은가?

모든 규칙을 무조건 엔티티에 넣는다는 뜻은 아닙니다. 여러 객체·외부 시스템을 함께 조정하는 유스케이스는 application 계층의 책임일 수 있습니다. 다만 **한 객체 자신의 유효 상태와 상태 전이는 그 객체가 소유할 수 있는지 먼저 검토**하는 것이 좋은 출발점입니다.

### 면접에서 이렇게 나옵니다

#### Q. 필드를 `private`으로 만들면 캡슐화가 된 것인가요?

`private`은 외부의 직접 필드 접근을 제한하는 **언어 수준의 접근 제어**입니다. 그것만으로 객체의 상태 변경 규칙까지 보호되지는 않습니다.

예를 들어 모든 값을 그대로 받는 public setter를 열어 두면 외부가 여전히 invariant를 깨뜨릴 수 있습니다. 좋은 캡슐화는 `cancel()`, `decrease()`처럼 **허용된 상태 변화와 검증을 객체의 의도 있는 동작 안에 모으는 것**까지 함께 봅니다.

#### Q. 객체의 규칙은 모두 도메인 객체 안에 넣어야 하나요?

아닙니다. 한 객체 자신의 유효 상태와 상태 전이는 객체가 소유하기 좋은 책임이지만, 여러 객체나 저장소·외부 시스템을 함께 조정하는 use case는 application 계층에서 orchestration할 수 있습니다.

핵심은 “무조건 엔티티에 넣는다”가 아니라 **어떤 규칙이 어느 상태를 보호하는지에 맞춰 책임 경계를 정하는 것**입니다.
