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

Java의 생성자 호출은 값을 매개변수 순서에 맞춰 전달합니다. 같은 타입의 선택 인자가 많아지면 생성자는 유효해도 호출부에서 각 값의 의미를 읽기 어려워질 수 있습니다.

```java
new SearchOption("java", 1, 50, true, false, null);
```

Builder는 이런 경우 **완성 전의 구성 상태를 별도 객체에 모으고 마지막에 결과 객체를 만드는 생성 API**입니다.

```java
SearchOption option = SearchOption.builder("java")
        .page(1)
        .size(50)
        .includeClosed(true)
        .build();
```

호출자는 선택한 값의 의미를 이름으로 읽을 수 있고, 필요한 값만 단계적으로 지정할 수 있습니다.

```text
Builder
완성 전이라 일부 값이 비어 있을 수 있는 구성 상태
        │
        │ build()
        │ 검증 · 정규화 · 필요한 복사
        ▼
결과 객체
외부에 사용할 수 있는 유효한 상태
```

### Builder와 결과 객체의 가변성은 별개다

Builder는 값을 단계적으로 모아야 하므로 보통 가변입니다. 그렇다고 결과 객체까지 가변일 필요는 없습니다.

```java
final class SearchOption {
    private final String keyword;
    private final int page;
    private final int size;

    private SearchOption(Builder builder) {
        this.keyword = builder.keyword;
        this.page = builder.page;
        this.size = builder.size;
    }

    static Builder builder(String keyword) {
        return new Builder(keyword);
    }

    static final class Builder {
        private final String keyword;
        private int page = 1;
        private int size = 20;

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

        SearchOption build() {
            if (page < 1 || size < 1 || size > 100) {
                throw new IllegalArgumentException();
            }
            return new SearchOption(this);
        }
    }
}
```

필수값은 Builder 생성 시점에 받을 수도 있고, 여러 값의 조합이 필요한 검증은 `build()`에서 수행할 수도 있습니다. 중요한 점은 **잘못된 완성 객체가 외부로 나오지 않도록 생성 경계를 설계하는 것**입니다.

### 가변 입력을 그대로 넘기면 완성 객체가 다시 흔들릴 수 있다

Builder가 컬렉션을 모은다면 결과 객체에 같은 가변 컬렉션 참조를 그대로 넘기지 않는지 확인해야 합니다.

```java
private SearchOption(Builder builder) {
    this.tags = List.copyOf(builder.tags);
}
```

복사 없이 `this.tags = builder.tags`로 저장하면 Builder를 나중에 다시 수정했을 때 이미 만들어진 결과 객체에서도 변경이 보일 수 있습니다. `List.copyOf`는 컬렉션 구조를 분리하는 데 유용하지만 원소 객체까지 깊은 복사하는 것은 아닙니다.

따라서 Builder를 사용할 때도 방어적 복사의 깊이는 결과 객체가 제공하려는 불변성 수준에 맞춰 결정해야 합니다.

### 생성자와 정적 팩터리보다 Builder가 나은 경우

Builder는 인자가 많다는 이유만으로 자동 선택할 필요는 없습니다.

| 생성 방식 | 자연스러운 상황 |
| --- | --- |
| 생성자 | 필수 인자가 적고 의미가 분명함 |
| 정적 팩터리 | 같은 타입의 여러 생성 의미를 이름으로 구분하고 싶음 |
| Builder | 선택 인자가 많고 조합을 단계적으로 표현해야 함 |

옵션이 많아 생성자 오버로딩이 늘어나거나 boolean·nullable 인자의 의미를 읽기 어렵다면 Builder의 가치가 커집니다. 반대로 필수 값 두세 개뿐인 단순 객체에 Builder를 쓰면 생성 흐름만 길어질 수 있습니다.

### 코드 생성 도구는 생성 규칙을 대신 설계하지 않는다

Lombok의 `@Builder`는 Builder 클래스와 메서드를 만드는 반복 코드를 줄여 줍니다. 하지만 어떤 값이 필수인지, 값 조합이 유효한지, 가변 컬렉션을 복사해야 하는지까지 결정해 주지는 않습니다.

특히 객체가 정해진 생명주기와 불변 조건을 가져야 한다면 모든 필드를 자유롭게 설정하는 Builder가 오히려 잘못된 생성 경로를 열 수 있습니다. 이 경우 `Order.place(...)`처럼 의도를 드러내는 생성 API가 더 적합할 수 있습니다.

JPA처럼 프레임워크가 특정 생성자를 요구하는 경우도 있습니다. 그 요구는 영속성 프레임워크의 객체 생성 계약이고, 애플리케이션이 어떤 생성 API를 제공할지는 별도의 설계 문제입니다. 프레임워크 요구 때문에 애플리케이션 코드까지 모든 필드를 Builder나 setter로 열 필요는 없습니다.

Builder를 선택할 때는 단순히 호출 코드가 읽기 좋아졌는지만 보지 말고 **완성 전 상태가 어디에 존재하고, 언제 유효성을 검사하며, `build()` 이후 결과 객체가 Builder의 추가 변경과 독립적인지**를 확인하면 됩니다.
