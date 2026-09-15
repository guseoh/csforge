---
kind: concept
contentKey: java.core.api-design.method-contract-parameter-validation
topicContentKey: java.core.api-design
slug: method-contract-parameter-validation
title: "메서드 계약과 매개변수 검증"
summary: "메서드의 사전조건·상태조건·실패 후 상태를 구분하고, 검증과 side effect 순서를 설계해 잘못된 호출이 객체 invariant를 깨뜨리지 않게 한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Objects.html"
    title: "Java SE 25 API: Objects"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: requireNonNull 등 기본 검증 API 확인
---
# 메서드 계약과 매개변수 검증

메서드 시그니처는 호출 계약의 일부만 표현합니다.

```java
void withdraw(long amount)
```

`long`이라는 타입만으로는 `amount > 0`이어야 하는지, 현재 잔액보다 작아야 하는지, 실패했을 때 잔액이 그대로 유지되는지 알 수 없습니다. 이런 **허용 입력, 필요한 객체 상태, 성공 결과와 실패 방식에 대한 약속**까지 메서드 계약으로 볼 수 있습니다.

```text
사전조건        : 전달된 값 자체가 허용되는가
객체 상태 조건  : 현재 상태에서 이 동작을 수행할 수 있는가
실패 후 상태    : 거부되었을 때 기존 상태가 어떻게 남는가
```

### 입력 조건과 객체 상태 조건을 구분한다

```java
void read(int length) {
    if (length < 0) {
        throw new IllegalArgumentException();
    }
    if (closed) {
        throw new IllegalStateException();
    }
    // read...
}
```

`length >= 0`은 전달된 인자의 조건이고 `closed == false`는 수신 객체의 현재 상태 조건입니다. 인자가 정상이어도 이미 닫힌 객체에서는 `read()`를 수행할 수 없습니다.

`IllegalArgumentException`, `IllegalStateException` 같은 표준 예외는 이런 차이를 표현할 수 있는 도구입니다. 중요한 것은 특정 예외 이름을 암기하는 것보다 **어떤 호출을 거부했고 실패 뒤 상태가 어떻게 되는지 일관되게 설명할 수 있는 계약**입니다.

### 상태를 바꾸기 전에 실패 조건을 확인한다

다음 `reserve()`는 재고가 부족할 때 실패하지만, 검증 전에 이미 상태를 변경합니다.

```java
void reserve(int n) {
    if (n <= 0) {
        throw new IllegalArgumentException();
    }

    available -= n;

    if (available < 0) {
        throw new IllegalStateException();
    }
}
```

`available`이 5일 때 `reserve(7)`을 호출하면 값은 `-2`가 된 뒤 예외가 발생합니다. **Java 예외는 앞에서 수행한 필드 대입을 자동으로 되돌리지 않습니다.**

실패하면 기존 재고를 보존해야 한다면 먼저 성공 가능성을 확인한 뒤 상태를 바꾸는 편이 자연스럽습니다.

```java
void reserve(int n) {
    if (n <= 0) {
        throw new IllegalArgumentException();
    }
    if (n > available) {
        throw new IllegalStateException("재고가 부족합니다.");
    }

    available -= n;
}
```

이처럼 실패 시 객체 상태를 얼마나 보존할 수 있는지는 메서드 계약의 중요한 부분입니다. 모든 메서드가 트랜잭션처럼 동작해야 한다는 뜻은 아니지만, **예외가 발생하기 전에 어떤 변경이 이미 일어났는지**는 반드시 추적해야 합니다.

### 여러 값의 관계가 불변 조건일 수도 있다

```java
Period(int start, int end) {
    if (start > end) {
        throw new IllegalArgumentException();
    }
    this.start = start;
    this.end = end;
}
```

`start`와 `end`가 각각 유효한 정수라는 사실만으로 기간이 올바른 것은 아닙니다. `start <= end`처럼 여러 값의 관계가 객체의 불변 조건일 수 있습니다.

따라서 필드별 null·범위 검사만 반복하는 것보다 **완성된 객체가 지켜야 할 조건이 무엇인지**를 먼저 정의하는 것이 중요합니다. 생성자, 정적 팩터리, Builder처럼 생성 경로가 여러 개라면 어느 경로에서도 그 조건을 우회하지 않는지도 확인해야 합니다.

### `Objects.requireNonNull`이 모든 검증을 해결하지 않는다

```java
this.name = Objects.requireNonNull(name);
```

이 코드는 `null`을 거부한다는 계약만 표현합니다. 빈 문자열, 길이 제한, 형식 검증 같은 규칙은 별개의 문제입니다.

```text
name != null
name.isBlank() == false
name.length() <= 50
```

필요한 경우 이런 규칙을 명시적으로 검사하거나 값 객체로 표현할 수 있습니다. 검증 API 하나를 사용했다고 타입의 모든 불변 조건이 자동으로 보장되는 것은 아닙니다.

### 예외와 트랜잭션 보장을 섞지 않는다

```java
balance -= amount;
if (balance < 0) {
    throw new IllegalStateException();
}
```

순수 Java 객체에서는 예외를 던져도 앞선 `balance -= amount`가 원상 복구되지 않습니다. 데이터베이스 트랜잭션 안에서 특정 예외가 rollback을 일으키는 것은 프레임워크나 트랜잭션 시스템의 별도 계약입니다.

따라서 Java 메서드를 읽을 때는 **검증 → 첫 상태 변경 → 이후 실패 가능 지점 → 실패 후 남는 상태** 순서로 추적하는 습관이 중요합니다. 좋은 메서드 계약은 성공했을 때 무엇을 하는지만 아니라, 잘못된 호출을 어떤 상태로 거부하는지도 설명할 수 있어야 합니다.
