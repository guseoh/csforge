---
kind: concept
contentKey: java.core.exceptions-resources.failure-atomicity
topicContentKey: java.core.exceptions-resources
slug: failure-atomicity
title: "실패 후 객체 상태와 failure atomicity"
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
# 실패 후 객체 상태와 failure atomicity

메서드가 예외를 던졌다고 해서 그 전에 수행한 필드 변경이 자동으로 되돌아가는 것은 아닙니다. Java 객체의 메서드에서 여러 상태를 차례로 바꾸다가 중간에 실패하면 **일부만 변경된 상태가 남을 수 있습니다.**

```java
void transfer(Account target, long amount) {
    this.balance -= amount;
    target.deposit(amount); // 여기서 실패하면?
}
```

두 번째 작업이 실패하면 현재 계좌의 잔액은 이미 줄어들었을 수 있습니다.

```text
호출 전
source = 100
 target = 50
    │
    ▼
source -= 30        source = 70
    │
    ▼
target.deposit(30)  여기서 실패
    │
    ▼
예외 발생           source = 70, target = 50
                    일부 변경이 남음
```

예외는 제어 흐름을 중단시키지만 앞에서 실행된 일반 필드 변경을 자동으로 되감지 않습니다.

### 가능한 검사를 변경 전에 수행한다

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

검사 가능한 조건을 상태 변경 전에 모두 확인하면 실패할 때 기존 상태를 유지하기 쉬워집니다.

이처럼 작업이 실패했을 때 가능한 한 호출 전 상태를 유지하거나 최소한 명확하게 정의된 상태를 남기는 성질을 **failure atomicity**라고 부릅니다.

### 임시 결과를 만든 뒤 한 번에 반영할 수도 있다

복잡한 계산이라면 기존 객체를 바로 수정하지 않고 새 결과를 계산한 뒤 성공했을 때 교체하는 방식이 유용할 수 있습니다.

```java
List<Item> updated = new ArrayList<>(items);
validateAndModify(updated);
items = List.copyOf(updated);
```

불변 객체를 새로 만들어 반환하는 방식도 일부 변경 상태를 피하기 쉽습니다.

```java
Money next = current.add(price);       // 아직 객체 상태를 바꾸지 않음
validateLimit(next);
current = next;                        // 성공한 결과만 공개
```

다만 이 패턴도 `validateLimit` 이후 `current = next` 사이에 다른 외부 side effect가 섞여 있다면 그 효과까지 자동으로 원자화하지는 않습니다. **어느 상태 경계까지 한 번에 보호하려는지**가 분명해야 합니다.

### DB transaction과 같은 개념은 아니다

Java 객체 메서드의 failure atomicity와 DB transaction의 atomicity는 관련된 문제의식이 있지만 같은 메커니즘이 아닙니다. DB transaction은 DBMS가 제공하는 별도 보장입니다. 일반 객체의 필드 변경을 예외가 자동 rollback해 주지는 않습니다.

Spring의 `@Transactional`이 어떤 예외에서 rollback하는지도 Spring transaction contract입니다. Java의 `throw` 자체가 메모리 객체나 외부 시스템의 변경을 되돌린다고 설명하면 안 됩니다.

### 항상 완벽하게 원상 복구할 수 있는 것은 아니다

이미 외부 서버에 요청을 보냈거나 파일에 일부 데이터를 썼다면 메모리 객체처럼 간단히 되돌릴 수 없습니다. 이런 경우에는 보상 작업, idempotency, 명시적인 상태 모델 등이 필요할 수 있습니다. 그 내용은 Backend/Distributed 영역에서 더 깊게 다룹니다.

```text
메모리 객체 내부 변경
→ 검증 선행 / 임시 결과 / 불변 값 같은 방식으로 제어 가능

DB 변경
→ DB transaction 계약 검토

외부 HTTP / message / file side effect
→ 이미 밖으로 나간 효과를 별도 실패 모델로 다뤄야 함
```

### 실무에서 확인할 것

- 실패 가능한 호출 전에 이미 상태를 바꾸고 있지 않은가?
- 모든 선행 조건을 먼저 검사할 수 있는가?
- 중간 결과를 외부에 노출하지 않고 완성 후 반영할 수 있는가?
- 실패 후 객체를 계속 사용할 수 있는 상태인지 계약이 분명한가?
- 메모리 객체의 failure atomicity와 DB transaction 또는 외부 side effect를 혼동하고 있지 않은가?

예외 처리에서 `catch`만 보는 것이 아니라 **실패 이후 데이터 상태**까지 보는 습관이 중요합니다.

### 면접에서 이렇게 나옵니다

#### Q. Java에서 예외가 발생하면 그전에 변경한 객체 상태도 rollback되나요?

아닙니다. 예외는 정상 제어 흐름을 중단하고 handler를 찾도록 만들지만 이미 수행한 일반적인 필드 변경을 자동으로 되돌리지 않습니다. 그래서 실패 가능한 작업이라면 가능한 검사를 mutation 전에 끝내거나 임시 상태에서 계산한 뒤 성공한 결과만 반영하는 방식으로 failure atomicity를 설계해야 합니다.

#### Q. failure atomicity와 DB transaction atomicity는 같은 개념인가요?

둘 다 실패 시 부분 결과를 노출하지 않으려는 문제의식은 비슷하지만 보장 주체와 메커니즘은 다릅니다. 일반 Java 객체의 failure atomicity는 코드의 mutation 순서와 상태 설계 문제이고, DB transaction atomicity는 DBMS의 transaction 계약입니다. 외부 HTTP 호출 같은 side effect까지 Java 객체의 예외만으로 자동 rollback되지는 않습니다.
