---
kind: concept
contentKey: java.core.modern-language.optional-return-boundary
topicContentKey: java.core.modern-language
slug: optional-return-boundary
title: "Optional at return boundaries"
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
# Optional at return boundaries

조회 메서드가 `User`를 반환한다고 적혀 있는데 실제로는 사용자가 없을 수도 있다면 호출자는 한 가지를 더 알아야 합니다. **결과가 없는 상황이 정상적으로 일어날 수 있는가**입니다. 이 사실을 `null`만으로 표현하면 타입만 보고는 알기 어렵고, 호출자가 null 검사를 빼먹기도 쉽습니다.

`Optional<T>`는 이런 반환 경계에서 **값이 있을 수도 있고 없을 수도 있다는 사실을 타입으로 드러내기 위한 도구**입니다. 중요한 점은 `Optional`을 null의 다른 이름으로 쓰는 것이 아니라, 부재가 정상적인 결과인 API의 의도를 더 분명하게 만드는 데 사용하는 것입니다.

### 값이 없는 결과를 타입으로 표현한다

```java
Optional<Member> findByEmail(String email) {
    // 찾으면 Optional.of(member), 없으면 Optional.empty()
}
```

호출자는 반환 타입만 보고도 결과가 없을 수 있음을 알 수 있습니다.

```java
String nickname = findByEmail(email)
        .map(Member::nickname)
        .orElse("unknown");
```

`map`은 값이 있을 때만 변환 함수를 적용하고, 비어 있으면 그대로 빈 `Optional`을 유지합니다. 그래서 `if (value != null)` 검사를 여러 단계에서 반복하는 대신 **값이 있을 때 무엇을 할지**를 이어서 표현할 수 있습니다.

값을 만들 때는 상황을 구분합니다.

```java
Optional.of(member);          // member가 null이면 NullPointerException
Optional.ofNullable(member);  // null이면 Optional.empty()
Optional.empty();             // 명시적으로 값 없음
```

이미 null이 절대 올 수 없다는 계약이라면 `of`가 더 강한 의도를 표현합니다. 반대로 외부 API처럼 null 가능성이 실제로 있다면 `ofNullable`이 맞습니다.

### 값이 없을 때 무엇을 할지 선택한다

`Optional`의 장점은 단순히 `isPresent()`로 확인하는 데 있지 않습니다. 부재를 만났을 때의 정책을 호출 지점에서 명확하게 표현할 수 있다는 데 있습니다.

```java
Member member = repository.findById(id)
        .orElseThrow(() -> new MemberNotFoundException(id));
```

조회 실패가 유스케이스의 오류라면 `orElseThrow`로 예외 경계로 바꿀 수 있습니다. 반대로 기본값을 사용할 수 있다면 `orElse` 또는 `orElseGet`을 선택합니다.

```java
String value1 = optional.orElse(loadDefault());
String value2 = optional.orElseGet(this::loadDefault);
```

두 코드는 비슷해 보이지만 평가 시점이 다릅니다. `orElse(loadDefault())`의 인자는 메서드를 호출할 때 먼저 계산되므로 `Optional`에 값이 있어도 `loadDefault()`가 실행됩니다. `orElseGet`은 실제로 비어 있을 때만 `Supplier`를 실행합니다.

DB 조회나 원격 호출처럼 대체값 계산 비용이 크다면 이 차이가 실무에서도 중요합니다.

### `map`과 `flatMap`은 중첩 여부가 다르다

변환 함수가 일반 값을 반환하면 `map`을 사용합니다.

```java
Optional<String> name = memberOptional.map(Member::nickname);
```

변환 함수 자체가 `Optional`을 반환한다면 `map`을 쓰면 `Optional<Optional<T>>`처럼 중첩될 수 있습니다. 이때는 `flatMap`이 자연스럽습니다.

```java
Optional<Address> address = memberOptional
        .flatMap(Member::primaryAddress);
```

문제를 풀 때 `map`과 `flatMap`을 API 이름으로만 외우기보다 **변환 함수가 무엇을 반환하는지**를 먼저 확인하면 쉽게 구분할 수 있습니다.

### Optional을 모든 곳에 붙이면 더 안전한 것은 아니다

`Optional`은 특히 **반환 타입**에서 의미가 분명합니다. 반면 모든 필드와 매개변수를 `Optional`로 감싸면 API가 오히려 복잡해질 수 있습니다.

예를 들어 다음 메서드는 호출자가 `Optional`을 직접 만들어 넘겨야 합니다.

```java
void updateNickname(Optional<String> nickname) { ... }
```

실제 의도가 "닉네임이 필수인가", "null을 허용하는가", "변경하지 않음을 표현하는가" 중 무엇인지 먼저 설계하는 편이 낫습니다. JPA 엔티티 필드도 persistence mapping과 도메인 null 정책을 먼저 결정해야 하며, `Optional`을 기계적으로 붙이는 것이 정답은 아닙니다.

또 `Optional` 자체를 `null`로 반환하면 의미가 무너집니다.

```java
Optional<Member> find(...) {
    return null; // Optional을 사용한 목적을 깨뜨린다
}
```

값이 없으면 `Optional.empty()`를 반환해야 합니다.

### 백엔드 코드에서는 경계를 나누어 생각한다

Spring Data JPA의 `findById`처럼 저장소 조회는 "없을 수 있음"을 `Optional`로 표현하기 좋습니다. Application Service에서는 이 부재가 비즈니스상 정상인지 오류인지 결정할 수 있습니다.

```java
Member member = memberRepository.findById(memberId)
        .orElseThrow(() -> new MemberNotFoundException(memberId));
```

여기서 중요한 것은 `Optional`이 예외를 없애는 기능이 아니라는 점입니다. 저장소에서는 정상적인 부재였던 것이 특정 유스케이스에서는 "반드시 존재해야 하는 회원이 없다"는 오류가 될 수 있습니다. **부재와 실패를 어느 경계에서 구분할지**가 설계의 핵심입니다.

### 문제를 풀 때 확인할 기준

`Optional` 문제가 나오면 다음 순서로 보면 좋습니다.

1. 값이 없는 상황이 정상적인 결과인가?
2. 현재 `Optional` 안에 값이 있는가 없는가?
3. `map`에 전달한 함수는 일반 값과 `Optional` 중 무엇을 반환하는가?
4. 기본값 계산은 즉시 해도 되는가, 비어 있을 때만 해야 하는가?
5. 부재를 기본값으로 바꿀지, 예외로 바꿀지 누가 결정해야 하는가?

### 자주 헷갈리는 부분

- `Optional.get()`을 무조건 호출하면 null 검사를 다른 형태로 옮긴 것에 가깝습니다.
- `Optional`은 내부 객체를 불변으로 만들지 않습니다.
- `orElse`와 `orElseGet`은 대체값을 계산하는 시점이 다릅니다.
- `Optional.empty()`는 "오류"가 아니라 단순한 "값 없음"일 수 있습니다.
- `Optional`을 쓴다고 API의 null·실패 정책이 자동으로 결정되지는 않습니다.

### 면접에서 설명한다면

`Optional`은 값이 없을 수 있는 반환 결과를 명시적으로 표현하는 데 유용하다고 설명하면 됩니다. 특히 호출자가 반환 타입만 보고 부재 가능성을 인식할 수 있고, `map`, `flatMap`, `orElseThrow` 같은 연산으로 부재 처리 정책을 이어서 표현할 수 있습니다. 다만 모든 필드와 매개변수에 사용하는 규칙은 아니며, null·예외·부재의 의미를 API 경계에 맞게 설계해야 합니다.
