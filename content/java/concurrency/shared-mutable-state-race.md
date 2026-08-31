---
kind: concept
contentKey: java.core.concurrency.shared-mutable-state-race
topicContentKey: java.core.concurrency
slug: shared-mutable-state-race
title: "Shared mutable state and race"
summary: "여러 thread가 같은 변경 가능한 상태를 읽고 쓸 때 실행 순서에 따라 값이 깨지는 이유와 보호할 상태 경계를 찾는다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java SE 25 JLS Chapter 17: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: shared variable, inter-thread action과 data race의 Java Memory Model 확인
---
# Shared mutable state와 race

동시성 문제는 "thread가 여러 개라서"만 생기는 것이 아닙니다. **여러 thread가 같은 상태를 공유하고, 그 상태를 변경하며, 변경 과정이 서로 겹칠 수 있을 때** 본격적으로 문제가 됩니다.

가장 단순한 예가 `count++`입니다.

```java
class Counter {
    private int count;

    void increment() {
        count++;
    }
}
```

코드는 한 줄이지만 증가라는 동작을 논리적으로 풀어 보면 현재 값을 읽고, 1을 더하고, 새 값을 저장하는 과정입니다.

### 두 thread가 같은 값을 읽으면 증가 하나가 사라질 수 있다

초기값이 0이라고 해 보겠습니다.

```text
Thread A                  Thread B
   │                         │
   ├─ count 읽음: 0          │
   │                         ├─ count 읽음: 0
   ├─ 0 + 1 = 1             │
   │                         ├─ 0 + 1 = 1
   ├─ count = 1             │
   │                         └─ count = 1
   ▼
최종 count = 1
```

증가 메서드는 두 번 호출됐지만 결과는 2가 아니라 1입니다. 이런 현상을 **lost update**라고 합니다.

문제의 핵심은 source code가 한 줄인지가 아닙니다. 여러 thread의 read-modify-write가 하나의 indivisible operation으로 보호되지 않았다는 점입니다.

### race condition은 실행 순서에 따라 올바름이 달라지는 문제다

Thread scheduling 순서는 매번 같지 않을 수 있습니다. 어떤 실행에서는 결과가 2가 나오고 어떤 실행에서는 1이 나올 수 있습니다.

이처럼 **여러 실행 흐름의 상대적인 timing/interleaving에 따라 프로그램의 올바른 결과가 달라지는 상황**을 race condition으로 이해할 수 있습니다.

그래서 동시성 버그는 개발 PC에서 100번 정상 동작했다고 사라지지 않습니다. 특정 실행 순서가 드물게 발생하면 운영 부하에서만 보일 수도 있습니다.

### 보호해야 하는 것은 변수 하나가 아니라 invariant일 수 있다

재고 예제를 보겠습니다.

```java
if (stock > 0) {
    stock--;
}
```

업무 규칙이 "재고는 0 아래로 내려가면 안 된다"라면 `stock` 변수의 read/write 각각만 보는 것으로 부족합니다. **확인과 차감이 하나의 규칙**입니다.

```text
invariant: stock >= 0

check stock > 0
       │
       └─ decrement stock
```

두 thread가 모두 `stock == 1`을 확인한 뒤 각각 차감하면 invariant가 깨질 수 있습니다. 따라서 critical section을 정할 때는 "어떤 필드에 lock을 붙일까"보다 **어떤 상태 규칙이 한 덩어리로 보호되어야 하는가**를 먼저 봐야 합니다.

### 공유를 없애는 것도 강력한 해결책이다

모든 동시성 문제를 lock으로 해결할 필요는 없습니다.

- immutable object를 전달한다.
- task마다 독립 상태를 사용한다.
- 하나의 owner thread만 상태를 수정하게 한다.
- message/queue를 통해 변경을 전달한다.

공유 mutable state가 줄어들면 race를 만들 수 있는 표면도 줄어듭니다.

### visibility와 atomicity는 서로 다른 문제다

한 thread가 쓴 최신 값이 다른 thread에게 **보이는가**와 여러 단계의 변경이 **하나의 원자적 동작인가**는 다른 질문입니다.

`volatile int count`로 만들면 visibility/order 관련 보장은 생기지만 `count++` 전체를 하나의 atomic update로 바꾸지는 않습니다.

```text
visibility: 다른 thread가 write 결과를 볼 수 있는가?
atomicity: 여러 단계가 중간에 끼어들 수 없는 하나의 단위인가?
```

이 둘을 구분해야 `volatile`, `synchronized`, `AtomicInteger`를 적절히 선택할 수 있습니다.

### 문제를 풀 때 확인할 것

1. 여러 thread가 같은 상태를 공유하는지 찾습니다.
2. 그 상태가 변경 가능한지 확인합니다.
3. 한 줄 코드를 read/compute/write 같은 실제 논리 단계로 풀어 봅니다.
4. 어떤 interleaving에서 결과가 깨지는지 표로 적습니다.
5. 보호해야 할 business invariant의 범위를 정합니다.

### 자주 헷갈리는 부분

- source code 한 줄이 자동으로 atomic한 것은 아닙니다.
- 최신 값이 보인다고 복합 갱신까지 안전한 것은 아닙니다.
- thread-safe collection을 사용해도 여러 operation으로 만든 업무 규칙이 자동으로 atomic해지지 않습니다.
- race는 반드시 예외를 던지는 형태로 나타나는 것이 아닙니다. 조용히 잘못된 값이 남을 수 있습니다.

### 면접에서 설명한다면

공유 가변 상태를 여러 thread가 동시에 읽고 수정하면 실행 순서에 따라 lost update 같은 race condition이 발생할 수 있습니다. `count++`도 read-modify-write의 복합 동작이어서 자동으로 atomic하지 않습니다. 해결할 때는 변수 하나가 아니라 재고 확인과 차감처럼 실제 invariant의 경계를 찾고, 공유 제거·lock·atomic operation 등 그 경계에 맞는 방법을 선택해야 합니다.
