---
kind: concept
contentKey: java.core.modern-language.optional-return-boundary
topicContentKey: java.core.modern-language
slug: optional-return-boundary
title: "반환 경계에서 Optional 사용하기"
summary: "값이 없을 수 있는 반환 결과를 Optional로 드러내고 null·예외와의 경계를 판단한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Optional.html"
    title: "Java SE 25 API: Optional"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Optional 생성·변환·대체값 API와 value-based 의미 확인
---
# 반환 경계에서 Optional 사용하기

조회 결과처럼 **값이 없는 상황도 정상적으로 발생할 수 있는 API**에서는 그 가능성을 호출자에게 어떻게 표현할지가 중요합니다. `null`만 반환하면 메서드 시그니처만 보고는 부재 가능성을 알기 어렵고, 호출자가 검사를 빠뜨릴 수도 있습니다.

`Optional<T>`는 이런 반환 경계에서 "값이 있을 수도 있고 없을 수도 있다"는 사실을 타입으로 드러냅니다.

```java
Optional<Member> findByEmail(String email) {
    // 찾으면 Optional.of(member), 없으면 Optional.empty()
}
```

호출자는 반환 타입만 보고도 부재 가능성을 알 수 있습니다.

### 값이 있을 때의 처리와 없을 때의 처리를 이어서 표현한다

```java
String nickname = findByEmail(email)
        .map(Member::nickname)
        .orElse("unknown");
```

`map`은 값이 있을 때만 변환 함수를 적용하고, 비어 있으면 빈 상태를 그대로 유지합니다. 그래서 여러 단계에서 `if (value != null)`을 반복하기보다 **값이 존재할 때 무엇을 할지**를 이어서 표현할 수 있습니다.

Optional을 만들 때는 입력 계약을 구분합니다.

```java
Optional.of(member);          // null을 허용하지 않음
Optional.ofNullable(member);  // null이면 empty
Optional.empty();             // 명시적인 부재
```

`Optional`을 사용하면서 메서드 자체가 `null`을 반환하면 의미가 무너집니다. 값이 없으면 `Optional.empty()`를 반환해야 합니다.

### 부재가 오류가 되는지는 호출 경계가 결정한다

저장소 조회에서는 "없음"이 정상적인 결과일 수 있지만 특정 유스케이스에서는 반드시 존재해야 할 수도 있습니다.

```java
Member member = repository.findById(id)
        .orElseThrow(() -> new MemberNotFoundException(id));
```

Optional이 예외를 없애는 것이 아닙니다. **부재 가능성을 먼저 표현하고, 현재 호출 문맥에서 그 부재를 기본값·다른 처리·예외 중 무엇으로 바꿀지 선택**하게 합니다.

### `orElse`와 `orElseGet`은 대체값 계산 시점이 다르다

```java
String value1 = optional.orElse(loadDefault());
String value2 = optional.orElseGet(this::loadDefault);
```

`orElse(loadDefault())`의 인자는 메서드 호출 전에 평가되므로 Optional에 값이 있어도 `loadDefault()`가 실행됩니다. `orElseGet`의 `Supplier`는 실제로 비어 있을 때만 호출됩니다.

대체값 생성이 단순 상수라면 차이가 작지만 DB 조회나 무거운 계산처럼 비용이 있는 작업에서는 이 평가 시점이 중요합니다.

### 변환 함수가 Optional을 반환하면 `flatMap`을 사용한다

```java
Optional<Address> address = memberOptional
        .flatMap(Member::primaryAddress);
```

일반 값을 반환하는 함수에는 `map`이 자연스럽지만, 함수 자체가 `Optional<T>`를 반환한다면 `map`을 사용할 경우 중첩된 `Optional<Optional<T>>` 형태가 생길 수 있습니다. `flatMap`은 그 중첩을 한 단계 평평하게 연결합니다.

### Optional은 모든 nullable 값을 감싸는 범용 컨테이너가 아니다

`Optional`의 의미가 특히 분명한 곳은 **반환 결과의 부재 가능성을 표현하는 경계**입니다. 모든 필드나 매개변수에 기계적으로 붙이면 오히려 API 의미가 흐려질 수 있습니다.

```java
void updateNickname(Optional<String> nickname) { ... }
```

이 경우 실제 요구가 "값이 필수인가", "값을 지우는 요청인가", "변경하지 않음을 표현하는가" 중 무엇인지 먼저 모델링하는 편이 낫습니다.

Optional을 볼 때는 값이 없을 수 있다는 사실이 정상적인 반환 계약인지부터 확인하세요. 그다음 `map`과 `flatMap`으로 값이 있는 흐름을 연결하고, 부재를 기본값으로 바꿀지 예외로 바꿀지는 그 호출 경계의 책임으로 결정하면 됩니다.
