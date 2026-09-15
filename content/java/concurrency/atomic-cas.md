---
kind: concept
contentKey: java.core.concurrency.atomic-cas
topicContentKey: java.core.concurrency
slug: atomic-cas
title: "Atomic 변수와 CAS"
summary: "CAS가 예상값이 그대로일 때만 갱신하는 원자적 연산이라는 점과 retry·contention·복합 invariant의 한계를 이해한다"
level: 3
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html"
    title: "Java SE 25 API: AtomicInteger"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: atomic update와 compareAndSet 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/package-summary.html"
    title: "Java SE 25 API: java.util.concurrent.atomic"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: single-variable atomic programming toolkit의 범위 확인
---
# Atomic 변수와 CAS

`volatile int count`는 writer와 reader 사이의 visibility/order를 다룰 수 있지만 `count++` 전체를 atomic increment로 만들지는 않습니다. 하나의 값에 대해 **현재 상태를 확인하고 조건이 맞을 때만 원자적으로 갱신**해야 한다면 `AtomicInteger` 같은 atomic API를 사용할 수 있습니다.

그 배경에 있는 대표적인 연산이 compare-and-set(CAS)입니다.

![CAS 성공과 retry 흐름](/learning/java/cas-retry.svg)

### CAS는 expected와 현재 값이 같을 때만 갱신한다

```java
AtomicInteger count = new AtomicInteger(0);
boolean changed = count.compareAndSet(0, 1);
```

`compareAndSet(expectedValue, newValue)`는 현재 값이 `expectedValue`와 같을 때만 값을 `newValue`로 원자적으로 바꾸고 성공 여부를 반환합니다.

```text
current == expected ?
    ├─ yes -> update 적용, true
    └─ no  -> 변경 없음, false
```

Java SE 25 `AtomicInteger`의 `compareAndSet`은 이 조건부 변경 자체가 atomic하다고 계약하고, memory effects는 `VarHandle.compareAndSet`에 정의된 semantics를 따릅니다.

### 경쟁에서 졌다면 실패 결과를 보고 다시 계산할 수 있다

두 thread가 모두 0을 읽었다고 해 보겠습니다.

```text
초기값 = 0

Thread A                    Thread B
read 0                      read 0
CAS(0, 1) -> 성공           CAS(0, 1) -> 실패
실제값 1                    실제값이 이미 1
```

B의 실패는 예외 상황이라기보다 **내가 읽은 이후 다른 thread가 값을 먼저 바꿨다**는 경쟁 결과입니다. 현재 값을 다시 읽고 새 결과를 계산해 재시도할 수 있습니다.

```java
int increment() {
    for (;;) {
        int current = count.get();
        int next = current + 1;

        if (count.compareAndSet(current, next)) {
            return next;
        }
    }
}
```

실제 단순 증가는 이미 `incrementAndGet()` 같은 API가 제공하므로 직접 CAS loop를 구현할 필요가 없습니다. 이 코드는 retry 구조를 이해하기 위한 예입니다.

### update 함수는 재실행될 수 있다

`updateAndGet`, `getAndUpdate` 같은 atomic API도 내부 경쟁 때문에 update function을 여러 번 적용할 수 있습니다. 공식 API가 update function을 side-effect-free하게 작성하라고 설명하는 이유가 여기에 있습니다.

```java
count.updateAndGet(current -> current + 1);
```

함수 안에서 이메일 발송이나 외부 상태 변경 같은 side effect를 수행하면 CAS 재시도 때문에 그 작업이 여러 번 실행될 수 있습니다.

### CAS primitive와 lock-free algorithm은 같은 말이 아니다

CAS를 사용하면 lock을 직접 획득하지 않는 갱신 알고리즘을 만들 수 있지만, **CAS를 한 번 썼다는 사실만으로 전체 알고리즘이 lock-free 또는 wait-free라고 증명되는 것은 아닙니다.** 이 용어들은 전체 알고리즘의 progress guarantee를 설명합니다.

경쟁이 낮을 때는 CAS 실패가 드물 수 있지만, 많은 thread가 같은 값에 몰리면 다음처럼 반복 재시도가 생길 수 있습니다.

```text
read -> CAS fail -> read -> CAS fail -> ...
```

따라서 "CAS는 lock보다 항상 빠르다"는 규칙도 없습니다. Contention과 작업 크기, 전체 알고리즘을 실제로 봐야 합니다.

### Atomic 변수 하나의 atomicity를 여러 상태의 transaction으로 확대하지 않는다

```java
AtomicInteger available;
AtomicInteger reserved;
```

각 변수의 개별 atomic operation이 안전하다고 해서 다음 invariant가 하나의 원자적 상태 전이로 보호되는 것은 아닙니다.

```text
reserved <= available
```

관련 값을 immutable state 하나에 묶고 `AtomicReference<State>` 전체를 조건부 교체하거나, 같은 lock 안에서 여러 값을 변경하는 방식처럼 **invariant 전체를 하나의 동기화 경계**에 넣어야 할 수 있습니다.

### ABA는 CAS가 상태의 history를 기억하지 않는다는 한계를 보여 준다

CAS는 비교 시점의 현재 값과 expected가 같은지를 봅니다. 값이 `A → B → A`로 바뀌었다면 마지막 값만 비교하는 CAS는 중간 변경이 있었다는 사실을 알지 못할 수 있습니다. 이를 ABA 문제라고 부릅니다.

모든 코드가 ABA 대응을 직접 구현해야 하는 것은 아닙니다. 다만 CAS가 "내가 본 뒤 아무 변화도 없었다"를 항상 의미하는 것은 아니라는 점을 보여 줍니다. 알고리즘에서 중간 변경 여부가 중요하다면 version이나 stamp 같은 추가 상태가 필요할 수 있습니다.

Atomic API를 선택할 때는 **보호하려는 것이 하나의 독립 값인지, update가 재시도되어도 안전한지, contention이 어느 정도인지, 여러 값 사이의 invariant가 따로 존재하는지**를 확인하세요. CAS는 강력한 조건부 atomic update primitive지만 동시성 설계 전체를 대신하는 것은 아닙니다.
