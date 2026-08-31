---
kind: concept
contentKey: java.core.api-design.builder-pattern-construction
topicContentKey: java.core.api-design
slug: builder-pattern-construction
title: "Builder로 복잡한 생성 인자 다루기"
summary: "Builder를 단순한 가독성 도구가 아니라 완성 전의 가변 구성 상태와 유효한 결과 객체를 분리하는 생성 API로 이해하고, 불변식·방어적 복사·재사용·Lombok·도메인/JPA 적용 판단까지 다룬다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.9"
    title: "JLS 15.9 Class Instance Creation Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 생성자 선택과 인자 전달의 Java 언어 규칙 확인
  - url: "https://projectlombok.org/features/Builder"
    title: "Project Lombok: @Builder"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Lombok이 생성하는 Builder API와 한계 확인
  - url: "https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html"
    title: "Jakarta Persistence 3.2 Specification"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: JPA entity의 no-arg constructor 등 persistence 생성 요구사항과 application 생성 API를 구분하기 위한 참고
---
# Builder로 복잡한 생성 인자 다루기

Builder를 이해할 때 먼저 봐야 할 문제는 “메서드 체이닝이 예쁘다”가 아닙니다. Java의 생성자 호출은 인자를 **위치 순서대로** 전달하며, 언어 차원에서 `size: 50`처럼 매개변수 이름을 붙여 호출하는 named argument 문법을 제공하지 않습니다. 그래서 같은 타입의 인자가 많고 선택 조합까지 늘어나면 생성자 자체는 유효해도 호출 코드가 생성 의도를 잃기 쉽습니다.

```java
new SearchOption("java", 1, 50, true, false, null);
```

여기서 `true`, `false`, `null`이 무엇을 뜻하는지 알려면 생성자 선언을 다시 봐야 합니다. 선택 인자 조합마다 생성자를 늘리는 telescoping constructor 방식도 가능하지만, 인자 수와 조합이 커질수록 호출부와 생성자 overload가 함께 복잡해집니다.

Builder는 이 문제를 **완성 전의 구성 상태(construction state)를 별도 객체에 모으고, 마지막에 유효한 결과 객체를 만든다**는 방식으로 해결합니다.

```java
SearchOption option = SearchOption.builder("java")
        .page(1)
        .size(50)
        .includeClosed(true)
        .build();
```

호출자는 값의 의미를 이름으로 읽을 수 있고 선택 값만 지정할 수 있습니다. 하지만 더 중요한 차이는 `Builder`와 `SearchOption`이 같은 생명주기의 객체가 아니라는 점입니다.

```text
Builder: 완성 전이라 일부 값이 비어 있어도 되는 가변 상태
        │
        │ build() - 검증 / 복사 / 정규화
        ▼
SearchOption: 외부에 공개되는 유효한 결과 상태
```

## Builder의 가변성과 결과 객체의 불변성은 별개다

Builder 자신은 값을 단계적으로 모아야 하므로 대개 가변입니다. 반면 결과 객체는 `final` 필드만 갖고 setter를 제공하지 않는 불변 객체로 만들 수 있습니다.

```java
final class SearchOption {
    private final String keyword;
    private final int page;
    private final int size;
    private final List<String> tags;

    private SearchOption(Builder builder) {
        this.keyword = builder.keyword;
        this.page = builder.page;
        this.size = builder.size;
        this.tags = List.copyOf(builder.tags);
    }

    static Builder builder(String keyword) {
        return new Builder(keyword);
    }

    static final class Builder {
        private final String keyword;
        private int page = 1;
        private int size = 20;
        private final List<String> tags = new ArrayList<>();

        private Builder(String keyword) {
            this.keyword = Objects.requireNonNull(keyword);
        }

        Builder page(int page) {
            this.page = page;
            return this;
        }

        Builder size(int size) {
            this.size = size;
            return this;
        }

        Builder addTag(String tag) {
            tags.add(Objects.requireNonNull(tag));
            return this;
        }

        SearchOption build() {
            if (page < 1) {
                throw new IllegalArgumentException("page는 1 이상이어야 합니다.");
            }
            if (size < 1 || size > 100) {
                throw new IllegalArgumentException("size는 1..100이어야 합니다.");
            }
            return new SearchOption(this);
        }
    }
}
```

`builder()`에서 `keyword`를 받으면 필수값 하나를 Builder 생성 순간부터 강제할 수 있고, `build()`에서는 `page`와 `size`처럼 여러 값의 조합을 검사할 수 있습니다. 어느 방식을 선택하든 핵심은 **완성 객체가 잘못된 상태로 외부에 나오지 않게 하는 것**입니다.

## `build()`는 단순 field 복사가 아니다

Builder에 값이 들어갔다고 해서 그 값이 곧 유효한 결과 상태라는 뜻은 아닙니다. 예를 들어 기간을 만드는 Builder라면 `start`와 `end` 각각은 정상 값이어도 `start > end` 조합은 잘못될 수 있습니다.

```java
Period period = Period.builder()
        .start(10)
        .end(5)
        .build(); // 여기서 조합 규칙을 거부해야 한다.
```

필드별 메서드에서 가능한 검증은 일찍 수행할 수 있지만, 모든 값이 모여야 알 수 있는 invariant는 최종 생성 경계에서 확인해야 합니다. 검증 실패 전에 결과 객체를 먼저 외부에 반환한 뒤 나중에 고치는 방식은 Builder의 장점을 잃습니다.

또한 Builder 외에 public constructor나 다른 factory가 같은 결과 타입을 만들 수 있다면 그 경로가 invariant를 우회하지 않는지도 봐야 합니다. **Builder 한 곳에서만 검증한다고 타입 전체의 invariant가 자동으로 보장되는 것은 아닙니다.**

## mutable 입력을 저장하면 Builder와 결과 객체가 다시 연결될 수 있다

결과 객체의 필드가 `final`이라고 해서 내부 객체까지 자동으로 불변이 되는 것은 아닙니다. Builder가 가진 mutable collection을 그대로 저장하면 Builder를 다시 사용하거나 외부 collection을 수정할 때 이미 만들어진 결과가 바뀔 수 있습니다.

```java
private SearchOption(Builder builder) {
    this.tags = builder.tags; // 위험: 같은 List를 공유한다.
}
```

이 상태에서 다음 코드를 생각해 봅시다.

```java
Builder builder = SearchOption.builder("java")
        .addTag("jvm");

SearchOption first = builder.build();
builder.addTag("gc");
```

`first`가 `builder.tags`와 같은 List를 들고 있다면 `first`도 나중에 `gc`를 보게 됩니다. Builder의 재사용 자체가 Java에서 금지된 것이 아니라 **완성 객체가 Builder의 이후 가변 상태와 aliasing되어 있는 설계**가 문제입니다.

그래서 결과가 독립 snapshot이어야 한다면 생성 시점에 `List.copyOf` 같은 방법으로 collection 구조를 분리합니다. 다만 이것도 원소가 mutable이면 원소 객체까지 깊은 복사하지는 않습니다. 필요한 불변성의 범위를 정한 뒤 어느 계층까지 복사할지 결정해야 합니다.

## Builder 재사용은 API 계약의 문제다

한 번 `build()`한 Builder를 다시 사용할 수 있는지는 패턴 자체가 정해 주지 않습니다. 재사용을 허용한다면 첫 결과와 두 번째 결과가 어떤 상태를 공유하는지 명확해야 합니다.

```java
Period.Builder builder = Period.builder().start(10).end(20);
Period first = builder.build();

builder.end(5);
Period second = builder.build(); // invariant 위반으로 실패할 수 있다.
```

`first`가 primitive 값이나 안전하게 복사된 값을 보관한다면 `first`는 여전히 `10..20`입니다. Builder는 다시 invalid 중간 상태가 될 수 있지만 이미 완성된 객체의 invariant까지 깨져서는 안 됩니다. 반대로 재사용이 의미 없거나 실수를 만들기 쉽다면 Builder를 일회성으로 문서화하거나 새 Builder 생성을 더 자연스럽게 만드는 API도 선택할 수 있습니다.

## 생성자, 정적 팩터리, Builder는 경쟁 패턴이 아니라 서로 다른 생성 문제를 푼다

필수 인자가 적고 의미가 명확하다면 생성자가 가장 직접적입니다.

```java
new Point(10, 20);
```

같은 타입을 만드는 여러 의미를 이름으로 구분하거나 구현 선택·인스턴스 재사용 정책을 숨기고 싶다면 정적 팩터리가 자연스러울 수 있습니다.

```java
Money.won(10_000);
User.registered(email);
```

선택 인자가 많고 조합을 단계적으로 표현해야 한다면 Builder의 가치가 커집니다. 이 셋을 모두 겹쳐서 `builder() -> factory -> constructor`처럼 간접 계층을 만드는 것이 좋은 설계라는 뜻은 아닙니다. **현재 생성 복잡성이 어디에 있는지**를 기준으로 가장 작은 API를 선택합니다.

## Lombok `@Builder`는 invariant를 설계해 주지 않는다

Lombok의 `@Builder`는 Builder class, setter 형태의 메서드, `build()` 같은 기계적인 코드를 생성해 줍니다. 하지만 어떤 값이 필수인지, 두 값의 조합이 유효한지, mutable collection을 어느 수준까지 복사해야 하는지, 이 객체를 애초에 Builder로 만들어야 하는지는 도메인 지식입니다.

```java
@Builder
class Order {
    private OrderStatus status;
    private long paidAmount;
}
```

이 코드만으로 `CANCELLED` 상태인데 `paidAmount > 0`이어도 되는지, 생성 직후 어떤 상태여야 하는지 같은 규칙은 보호되지 않습니다. 생성된 Builder가 모든 field를 자유롭게 설정하게 해 **의도 있는 생성 경로를 오히려 우회**할 수도 있습니다.

따라서 `@Builder`는 생성 API의 구현량을 줄이는 도구이지 “안전한 객체 생성”을 보장하는 애너테이션이 아닙니다.

## DTO의 Builder와 Domain 생성 API는 같은 기준으로 판단하지 않는다

전송용 DTO는 많은 선택 필드를 읽기 좋게 조립하는 것이 주목적일 수 있습니다. 이런 데이터 carrier에서는 Builder가 실용적일 수 있습니다.

반면 domain 객체의 생성에는 “새 주문은 반드시 `DRAFT`로 시작한다”, “결제 완료 주문만 배송을 시작할 수 있다”처럼 의미 있는 lifecycle과 invariant가 붙습니다. 이때 모든 field를 외부에서 임의로 채우는 Builder보다 다음처럼 의도를 드러내는 생성 API가 더 안전할 수 있습니다.

```java
Order order = Order.place(customerId, items);
QuizSession session = QuizSession.start(questionIds);
```

즉 **DTO Builder의 편의성을 Domain Entity에 기계적으로 복사하지 않습니다.** Domain 객체에서는 호출자가 어떤 상태를 설정할지보다 객체가 어떤 유효한 상태로 태어나야 하는지가 더 중요합니다.

## JPA Entity에서는 persistence 생성과 application 생성을 분리한다

Jakarta Persistence entity는 provider가 사용할 public 또는 protected no-arg constructor를 요구하고, application용 constructor를 추가로 둘 수 있습니다. 이 persistence 요구사항 때문에 application 코드까지 public no-arg constructor와 setter 조립 방식을 써야 하는 것은 아닙니다.

```java
@Entity
class Order {
    @Id
    private Long id;

    private OrderStatus status;

    protected Order() {
        // persistence용
    }

    private Order(OrderStatus status) {
        this.status = status;
    }

    static Order place() {
        return new Order(OrderStatus.DRAFT);
    }
}
```

JPA Entity에 Builder가 절대 금지되는 것은 아닙니다. 다만 Builder가 `id`, `status`, 감사 필드처럼 application이 임의로 지정하면 안 되는 persistence/domain 상태까지 열어 버리거나 lifecycle invariant를 우회한다면 좋은 선택이 아닙니다. 생성 옵션이 정말 복잡한 value/object 조립 문제인지, 아니면 `place()`, `open()`, `start()`처럼 **의도 있는 domain creation API**가 필요한 문제인지 먼저 구분합니다.

Builder를 선택했다면 마지막으로 확인할 질문은 단순합니다. 호출 코드가 읽기 좋아졌는가만 보지 말고, **완성 전의 가변 상태가 어디에 있고, 유효한 객체가 언제 만들어지며, 그 이후 외부나 Builder의 변경이 완성 객체를 다시 흔들 수 없는가**까지 추적해야 합니다.
