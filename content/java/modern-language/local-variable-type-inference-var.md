---
kind: concept
contentKey: java.core.modern-language.local-variable-type-inference-var
topicContentKey: java.core.modern-language
slug: local-variable-type-inference-var
title: "var와 지역 변수 타입 추론"
summary: "var가 실행 중 타입이 바뀌는 기능이 아니라 지역 변수의 정적 타입을 컴파일러가 추론하는 문법임을 이해한다"
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html"
    title: "Java Language Specification 14장: Blocks, Statements, and Patterns"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: local variable type inference 규칙 확인
---
# var와 지역 변수 타입 추론

`var`는 Java를 동적 타입 언어처럼 만드는 기능이 아닙니다. **컴파일러가 초기화 식을 보고 지역 변수의 정적 타입을 추론**할 뿐이며, 이후 대입과 메서드 호출도 그 타입을 기준으로 컴파일 시점에 검사합니다.

```java
var names = new ArrayList<String>();
```

이 선언에서 `names`의 타입이 사라진 것이 아닙니다. 컴파일러가 초기화 식으로부터 타입을 결정했기 때문에 이후에는 그 타입과 맞지 않는 값을 마음대로 대입할 수 없습니다.

```java
var names = new ArrayList<String>();
names.add("java");

// names = List.of("spring"); // 추론된 변수 타입과 맞지 않으면 컴파일 오류
```

### 초기화 식이 타입 추론의 근거가 된다

```java
// var value;        // 초기값이 없어 타입을 결정할 수 없음
// var value = null; // null만으로 필요한 타입을 결정할 수 없음
```

`var`는 지역 변수 타입 추론 기능이므로 필드나 메서드 반환 타입, 일반 메서드 매개변수의 타입을 대신하지 않습니다.

lambda도 자체적으로 target type을 제공하지 않기 때문에 다음처럼 쓸 수 없습니다.

```java
// var mapper = value -> value.toString();
```

lambda는 `Function<String, String>` 같은 함수형 인터페이스 문맥이 있어야 타입을 결정할 수 있습니다.

### 추론되는 타입은 개발자가 머릿속으로 기대한 추상 타입과 다를 수 있다

```java
var items = new ArrayList<String>();
```

이 경우 변수는 초기화 식의 구체 타입을 기준으로 추론됩니다. 반면 다음 선언은 호출자가 `List` 계약으로 사용한다는 의도를 명시합니다.

```java
List<String> items = new ArrayList<>();
```

따라서 `var`와 명시적 타입은 단순히 글자 수 차이만 만드는 것이 아닙니다. 왼쪽의 명시적 타입이 제네릭 추론에 필요한 문맥을 제공하거나, 코드가 어떤 추상화에 의존하는지를 독자에게 보여 주는 경우가 있습니다.

### `var`는 타입이 이미 분명할 때 유용하다

```java
var member = new Member("guseo");
var entries = new HashMap<String, Integer>();
```

초기화 식만 봐도 타입과 역할이 명확하다면 반복을 줄일 수 있습니다. 반대로 다음처럼 반환 타입이 코드의 중요한 계약인데 호출부만 봐서는 알기 어려운 경우에는 명시적 타입이 더 읽기 좋을 수 있습니다.

```java
Optional<Member> member = memberRepository.findById(id);
```

여기서는 `Optional`이라는 타입 자체가 "값이 없을 수 있다"는 정보를 전달합니다. `var`를 쓸 수 있다는 사실과 그 선택이 더 읽기 좋은지는 별개의 문제입니다.

`var`를 이해할 때 기억할 핵심은 하나입니다. **타입을 없애는 것이 아니라 컴파일러가 지역 변수의 정적 타입을 대신 적어 주는 것**입니다. 사용할지는 초기화 식과 변수 이름만으로 타입의 의미가 충분히 드러나는지를 기준으로 판단하면 됩니다.
