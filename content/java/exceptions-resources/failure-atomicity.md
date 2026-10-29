---
kind: concept
contentKey: java.core.exceptions-resources.failure-atomicity
topicContentKey: java.core.exceptions-resources
slug: failure-atomicity
title: "실패 후 객체 상태와 실패 원자성(failure atomicity)"
summary: "작업이 예외로 실패했을 때 객체가 예상하기 어려운 일부 변경 상태에 남지 않도록 검사와 변경 순서를 설계한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html"
    title: "JLS 11 Exceptions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 예외가 연산의 정상 완료를 중단시키는 기본 규칙 확인
---
# 실패 후 객체 상태와 실패 원자성(failure atomicity)

메서드가 예외를 던졌다고 해서 그전에 수행한 필드 변경이 자동으로 되돌아가는 것은 아닙니다. 여러 상태를 차례로 바꾸다가 중간에 실패하면 **일부만 변경된 상태가 남을 수 있습니다.**

```java
void transfer(Account target, long amount) {
    this.balance -= amount;
    target.deposit(amount); // 여기서 실패하면?
}
```

두 번째 작업이 실패하면 현재 계좌의 잔액은 이미 줄어들었을 수 있습니다.

```csforge-viz
{
  "version": 1,
  "type": "java-api-contract",
  "title": "부분 변경과 임시 불변값 대안",
  "description": "이체의 부분 실패는 잔액을 자동 복구하지 않습니다. 별도 대안에서는 임시 불변값을 검증한 뒤에만 반영합니다.",
  "example": "failure-atomicity"
}
```

Java 예외는 제어 흐름을 중단하지만 앞에서 수행된 일반 객체 변경을 자동으로 되감지 않습니다. 실패한 메서드가 호출자를 어떤 상태에 남기는지도 API 계약의 일부로 봐야 합니다.

### 가능한 검증을 변경보다 먼저 수행한다

```java
void decrease(long amount) {
    if (amount <= 0) {
        throw new IllegalArgumentException();
    }
    if (balance < amount) {
        throw new IllegalStateException();
    }

    balance -= amount;
}
```

성공 가능 여부를 상태 변경 전에 판단하면 실패 경로에서 기존 상태를 유지하기 쉽습니다. 이런 성질을 **실패 atomicity**라고 부릅니다.

모든 검증을 무조건 처음에 몰아넣으라는 뜻은 아닙니다. 중요한 것은 첫 변경 이후 어떤 작업이 실패할 수 있는지 추적하고, 실패했을 때 남는 상태가 의도한 계약인지 확인하는 것입니다.

### 임시 결과에서 계산한 뒤 성공한 상태만 반영할 수 있다

복잡한 변경은 기존 상태를 즉시 수정하기보다 임시 결과를 만든 뒤 유효성이 확인되면 반영하는 방식이 도움이 될 수 있습니다. 다음은 `Item`이 불변 값이고 목록에 `null`이 없으며, `validateAndModify`가 목록의 원소 추가·제거·교체만 수행한다는 전제입니다.

```java
List<Item> updated = new ArrayList<>(items);
validateAndModify(updated);
items = List.copyOf(updated);
```

`new ArrayList<>(items)`는 목록 구조만 복사하며 `Item` 참조는 공유합니다. 가변 `Item`의 필드를 수정한 뒤 검증이 실패하면 `items` 재대입 전이라도 원본에서 그 변경이 보입니다. 그런 작업까지 실패 원자성을 보장하려면 수정할 원소의 독립 복사나 불변 값으로의 교체가 필요하며, 얕은 복사를 rollback으로 취급하면 안 됩니다.

불변 값으로 다음 상태를 계산하는 방식도 같은 방향입니다.

```java
Money next = current.add(price);
validateLimit(next);
current = next;
```

검증이나 계산이 실패하는 동안 `current`는 기존 값을 유지합니다.

### DB transaction과는 같은 메커니즘이 아니다

일반 Java 객체의 실패 atomicity와 DB transaction의 atomicity는 문제의식은 비슷하지만 보장 주체가 다릅니다. Java의 `throw`는 일반 필드 변경을 rollback하지 않습니다.

DB 변경은 DBMS와 transaction manager의 별도 계약을 따라야 하고, 외부 HTTP 호출이나 메시지 발행처럼 이미 프로세스 밖으로 나간 부수 효과도 객체 메서드의 예외만으로 되돌릴 수 없습니다.

이 Concept에서 가져갈 핵심은 기술을 미리 추가하는 것이 아니라 **첫 상태 변경 이후 실패 지점을 순서대로 읽는 습관**입니다. 가능한 조건을 변경 전에 확인할 수 있는지, 임시 결과에서 작업할 수 있는지, 실패 후 객체가 계속 유효한 상태인지 설명할 수 있어야 합니다.
