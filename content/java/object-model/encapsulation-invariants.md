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

캡슐화를 단순히 “필드를 `private`으로 만든다”라고 이해하면 부족합니다. 접근을 제한하는 것보다 더 중요한 목적은 **객체가 자신의 상태를 어떤 규칙으로 바꿀 수 있는지 한 경계 안에서 관리하는 것**입니다.

예를 들어 재고는 음수가 되면 안 된다고 해 보겠습니다.

```java
class Stock {
    private int quantity;
}
```

필드를 `private`으로 만들었다고 아직 재고 규칙이 생긴 것은 아닙니다. 다음처럼 모든 값을 그대로 받는 setter를 공개하면 외부 코드가 객체의 유효성을 쉽게 깨뜨릴 수 있습니다.

```java
void setQuantity(int quantity) {
    this.quantity = quantity;
}
```

## 상태 값보다 의도를 드러내는 동작을 제공한다

재고가 줄어드는 이유가 출고라면 그 상태 변화를 메서드로 표현할 수 있습니다.

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

이제 외부에서는 `quantity`에 임의의 값을 넣는 대신 `decrease`라는 동작을 요청합니다. 객체는 그 과정에서 자신이 지켜야 할 조건을 확인합니다.

객체가 항상 지켜야 하는 조건을 **불변 조건(invariant)** 이라고 합니다. “재고는 0 이상이다”, “완료된 주문은 다시 결제 대기 상태로 돌아갈 수 없다” 같은 규칙이 이에 해당합니다.

## getter가 존재한다고 캡슐화가 자동으로 깨지는 것은 아니다

상태를 읽는 일이 모두 나쁜 것은 아닙니다. 화면이나 응답을 만들기 위해 현재 값을 조회해야 할 수 있습니다. 문제는 외부 코드가 상태를 꺼낸 뒤 **객체가 지켜야 할 판단과 상태 변경 규칙까지 대신 수행하는 구조**입니다.

```java
if (order.getStatus() == PAID) {
    order.setStatus(CANCELLED);
}
```

이 코드가 여러 곳에 퍼지면 “언제 취소할 수 있는가”라는 규칙도 함께 흩어집니다.

```java
order.cancel();
```

취소 가능 여부를 `Order`가 판단한다면 상태 전이 규칙의 위치가 더 분명해집니다. 내부 표현이 바뀌어도 호출자는 `cancel()`이라는 동작을 계속 사용할 수 있습니다.

## 캡슐화는 변경의 범위를 좁힌다

외부가 필드 구조와 변경 순서를 자세히 알수록 객체 내부를 바꿀 때 호출부도 함께 수정해야 합니다. 반대로 외부가 의미 있는 동작만 알고 내부 표현과 검증 규칙이 객체 안에 모여 있다면 변경 영향이 작아질 수 있습니다.

따라서 캡슐화는 단순한 정보 숨기기를 넘어 **변경될 수 있는 세부와 반드시 지켜야 할 규칙을 적절한 경계 안에 모으는 설계**로 이해하는 편이 좋습니다.

모든 규칙을 한 객체에 몰아넣는다는 뜻은 아닙니다. 여러 객체나 외부 시스템을 함께 조정해야 하는 작업은 별도의 조정 책임이 필요할 수 있습니다. 다만 한 객체 자신의 유효 상태와 상태 전이라면 **그 객체가 규칙을 소유할 수 있는지** 먼저 검토하는 것이 좋은 출발점입니다.
