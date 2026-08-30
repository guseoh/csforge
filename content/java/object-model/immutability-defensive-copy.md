---
kind: concept
contentKey: java.core.object-model.immutability-defensive-copy
topicContentKey: java.core.object-model
slug: immutability-defensive-copy
title: "Immutability와 defensive copying"
summary: "mutable state의 ownership 경계를 방어적 복사로 보호하는 설계를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 120
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html"
    title: "Java Language Specification 4장: Types, Values, and Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: reference value와 object mutation의 언어 의미 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html"
    title: "Java SE 25 List API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: List.copyOf와 unmodifiable view의 API 계약 확인
---
# Immutability와 defensive copying

## 쉬운 진입

내가 만든 주문 객체에 호출자가 가진 장바구니 list를 그대로 넣으면, 호출자가 나중에 list를
수정해 주문 내용까지 바뀔 수 있다. 불변 객체는 “누가 내 상태를 바꿀 수 있는가”를 차단하고,
defensive copy는 ownership이 넘어오는 순간 별도 상태를 만들어 그 경계를 지킨다.

## 정확한 메커니즘

```java
final class Order {
    private final List<String> items;

    Order(List<String> items) {
        this.items = List.copyOf(items); // 입력 list와 내부 상태 분리
    }

    List<String> items() {
        return items;                    // immutable list이므로 안전한 공개
    }
}
```

불변 객체는 생성 후 관찰 가능한 상태가 바뀌지 않고, 내부 mutable 객체의 변경 경로를 외부에
노출하지 않아야 한다. `final` field는 참조 재대입을 막을 뿐 내부 list의 mutation을 막지 않는다.
`Collections.unmodifiableList` 같은 view는 원본이 바뀌면 관찰 결과도 바뀔 수 있지만 `List.copyOf`
는 입력을 복사한 불변 list를 제공한다. 복사는 얕은 복사일 수 있으므로 list 안의 mutable 원소
ownership까지 필요하면 원소도 별도로 보호해야 한다.

```text
caller list ──copy──> Order.items (외부가 소유하지 않는 snapshot)
caller가 원본 변경 ──X──> Order 내부 상태
```

## 실전·면접 연결

request DTO나 domain value object가 컬렉션을 보관할 때 입력·출력 각각의 소유권을 정한다. 큰
객체를 매번 복사하면 비용이 있으므로 immutable value를 공유하거나 명확한 read-only 계약을
사용하는 trade-off도 함께 검토한다. 불변성은 thread-safe 설계에 도움을 주지만 모든 협력 객체와
외부 자원이 자동으로 안전해지는 것은 아니다.

## 흔한 오해

- `final List`는 list 원소 추가를 막지 않는다.
- unmodifiable view와 독립 snapshot은 같은 의미가 아니다.
- 얕은 defensive copy는 내부 mutable 원소까지 불변으로 만들지 않는다.
