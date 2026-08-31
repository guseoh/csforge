---
kind: concept
contentKey: java.core.modern-language.local-variable-type-inference-var
topicContentKey: java.core.modern-language
slug: local-variable-type-inference-var
title: "Local variable type inference with var"
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
# Local variable type inference with var

`var`를 처음 보면 Java가 JavaScript처럼 실행 중에 변수 타입을 바꾸는 기능을 추가한 것처럼 느낄 수 있습니다. 하지만 실제로는 정반대입니다. **컴파일러가 오른쪽 초기값을 보고 지역 변수의 정적 타입을 결정해 줄 뿐**, 타입 검사는 기존 Java와 똑같이 컴파일 시점에 이루어집니다.

따라서 `var`의 핵심은 "타입을 없앤다"가 아니라 **코드에 타입 이름을 직접 반복해서 쓰지 않아도 되는 경우가 생긴다**는 것입니다.

### 컴파일러가 초기값으로 타입을 정한다

```java
var names = new ArrayList<String>();
```

이 코드를 컴파일하면 `names`에는 구체적인 정적 타입이 정해집니다. 이후에는 마음대로 다른 타입을 넣을 수 없습니다.

```java
var names = new ArrayList<String>();

names.add("java");
// names = List.of("spring"); // ArrayList<String> 변수에 맞지 않아 컴파일 오류
```

즉 `var`는 dynamic typing이 아닙니다.

```text
source code
var names = new ArrayList<String>();
             │
             ▼
compiler가 initializer 분석
             │
             ▼
지역 변수의 정적 타입 결정
             │
             ▼
이후 호출·대입도 그 타입으로 검사
```

### 왜 초기값이 반드시 필요할까

컴파일러가 타입을 알아내려면 근거가 필요합니다.

```java
// var value;        // 타입을 결정할 초기값이 없음
// var value = null; // null만으로는 필요한 타입을 결정할 수 없음
```

`var`는 지역 변수에서 사용하는 기능이며 필드, 메서드 반환 타입, 일반 메서드 매개변수의 타입을 대신하는 문법이 아닙니다.

또 lambda expression도 그 자체만으로는 사용할 functional interface 타입이 결정되지 않기 때문에 다음과 같이 쓸 수 없습니다.

```java
// var mapper = value -> value.toString();
```

lambda에는 `Function<String, String>` 같은 **목표 타입(target type)** 이 필요합니다.

### 오른쪽 코드가 무엇이냐에 따라 추론 결과가 달라질 수 있다

`var`를 사용할 때 특히 중요한 부분은 "내가 머릿속으로 생각한 추상 타입"이 아니라 **초기화 식으로부터 실제로 추론된 타입**이 변수 타입이 된다는 점입니다.

```java
var items = new ArrayList<>();
```

문맥에서 원소 타입을 알 수 있는 정보가 없다면 기대와 다른 제네릭 타입이 추론될 수 있습니다. 반대로 명시적인 선언은 API가 원하는 추상 타입을 보여 줄 수 있습니다.

```java
List<String> items = new ArrayList<>();
```

두 코드는 단순히 글자 수만 다른 것이 아닐 수 있습니다. 왼쪽 타입이 제네릭 추론의 문맥을 제공하고, 독자에게 "이 변수는 List 계약으로 다룬다"는 설계 의도를 보여 주기도 합니다.

### `var`를 써도 좋은 경우와 피하는 편이 나은 경우

오른쪽만 봐도 타입이 즉시 드러나는 경우에는 반복을 줄일 수 있습니다.

```java
var member = new Member("guseo");
var entries = new HashMap<String, Integer>();
```

반면 메서드 이름만으로 결과 타입을 알기 어려우면 읽는 사람이 선언부를 찾아가야 할 수 있습니다.

```java
var result = service.process(request);
```

`result`라는 이름까지 모호하다면 타입 정보가 사라져 코드 읽기가 더 어려워집니다. 이럴 때는 명시적 타입 또는 더 좋은 변수 이름이 도움이 됩니다.

중요한 기준은 "무조건 `var`를 쓰자/쓰지 말자"가 아니라 **타입 이름을 생략했을 때 코드의 의도가 더 선명한가**입니다.

### 백엔드 코드에서 판단할 때

Spring/JPA 코드에서는 타입 이름이 길어지는 경우가 많아 `var`가 유용할 수 있습니다. 하지만 repository 결과나 외부 API 응답처럼 타입 자체가 경계의 의미를 알려 주는 경우에는 명시적 타입이 문서 역할을 하기도 합니다.

예를 들어:

```java
Optional<Member> member = memberRepository.findById(id);
```

여기서는 `Optional`이라는 사실 자체가 "없을 수 있다"는 중요한 계약을 보여 줍니다. `var`로 바꾸면 문법적으로 문제는 없어도 그 정보를 한눈에 보기 어려워질 수 있습니다.

### 문제를 풀 때 확인할 것

1. `var`의 초기값이 무엇인지 본다.
2. 그 초기값으로 컴파일러가 어떤 정적 타입을 정하는지 추적한다.
3. 제네릭의 목표 타입 정보가 사라져 추론 결과가 달라지지 않는지 본다.
4. 이후 대입과 메서드 호출은 추론된 정적 타입을 기준으로 판단한다.

### 자주 헷갈리는 부분

- `var`는 동적 타입 변수가 아닙니다.
- 런타임에 값의 타입이 바뀌도록 만드는 기능이 아닙니다.
- 제네릭 타입 정보를 없애거나 raw type으로 바꾸는 문법도 아닙니다.
- `var x = null`처럼 타입을 결정할 근거가 없는 선언은 사용할 수 없습니다.
- 코드가 짧아진다는 이유만으로 항상 가독성이 좋아지는 것은 아닙니다.

### 면접에서 설명한다면

`var`는 지역 변수 타입 추론 기능으로, 컴파일러가 초기화 식에서 정적 타입을 결정한다고 설명하면 됩니다. Java의 정적 타입 시스템은 그대로 유지되며 실행 중 타입이 자유롭게 바뀌는 것이 아닙니다. 사용할 때는 타입 이름을 생략해도 초기값과 변수 이름만으로 의도가 분명한지 판단하는 것이 중요합니다.
