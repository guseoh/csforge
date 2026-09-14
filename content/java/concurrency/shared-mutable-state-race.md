---
kind: concept
contentKey: java.core.concurrency.shared-mutable-state-race
topicContentKey: java.core.concurrency
slug: shared-mutable-state-race
title: "공유 가변 상태와 Race Condition"
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
    relationNote: shared variable, conflicting access, data race와 Java Memory Model 확인
---
# 공유 가변 상태와 Race Condition

Thread가 여러 개 존재하는 것만으로 상태가 깨지는 것은 아닙니다. 문제가 되는 지점은 **둘 이상의 thread가 같은 변경 가능한 상태에 접근하고, 적어도 하나가 그 상태를 쓰며, 필요한 동기화 없이 접근이 겹칠 수 있을 때**입니다.

가장 단순한 예가 `count++`입니다.

```java
class Counter {
    private int count;

    void increment() {
        count++;
    }
}
```

소스에서는 한 줄이지만 의미상으로는 현재 값을 읽고, 1을 더하고, 다시 저장하는 read-modify-write입니다.

![두 thread가 counter 증가를 잃어버리는 interleaving](/learning/java/race-condition.svg)

### 같은 이전 값을 읽으면 갱신 하나가 사라질 수 있다

초기값이 0인 상태에서 두 thread가 다음처럼 겹칠 수 있습니다.

```text
Thread A                  Thread B
read count = 0            read count = 0
compute 1                 compute 1
write count = 1           write count = 1

최종 count = 1
```

메서드는 두 번 호출됐지만 증가 하나가 사라졌습니다. 이런 결과를 **lost update**라고 부를 수 있습니다. 중요한 것은 `++`라는 문법 자체가 아니라, 여러 단계로 이루어진 갱신 전체가 하나의 원자적 경계로 보호되지 않았다는 점입니다.

### race condition과 JMM의 data race는 같은 말로 뭉개지 않는다

일반적으로 race condition은 실행 흐름의 상대적인 순서에 따라 프로그램의 올바름이 달라지는 문제를 가리킵니다.

Java Memory Model은 더 구체적으로 같은 shared variable에 대한 두 **conflicting access**가 있고, 서로 다른 thread에서 수행되며, 두 접근이 happens-before로 정렬되지 않았을 때 **data race**가 있다고 정의합니다. Conflicting access는 둘 중 적어도 하나가 write인 같은 변수의 접근입니다.

```text
race condition
└─ 실행 순서가 결과의 올바름을 좌우하는 넓은 문제

JMM data race
└─ conflicting shared-memory access가 happens-before로 정렬되지 않은 경우
```

이 구분은 이후 happens-before를 배울 때 중요합니다. 모든 동시성 논리 오류가 반드시 data race 형태인 것은 아니며, data-race-free라고 해서 여러 operation의 업무 invariant가 자동으로 atomic해지는 것도 아닙니다.

### 보호해야 하는 단위는 필드 하나보다 invariant일 수 있다

재고가 1개 남았다고 해 보겠습니다.

```java
if (stock > 0) {
    stock--;
}
```

두 thread가 모두 `stock == 1`을 확인한 뒤 차감하면 "재고는 음수가 되지 않는다"는 규칙이 깨질 수 있습니다. 여기서 보호해야 하는 것은 단순한 `stock` 읽기 한 번이나 쓰기 한 번이 아니라 **확인과 차감을 함께 묶은 상태 전이**입니다.

```text
invariant: stock >= 0

check stock > 0
       │
       └─ decrement stock
          ↑ 하나의 논리적 경계로 보호 필요
```

따라서 동기화 도구를 고르기 전에 어떤 값들이 함께 맞아야 하는지, 어떤 read와 write가 하나의 작업으로 보여야 하는지를 먼저 정해야 합니다.

### 공유 자체를 줄이면 경쟁해야 할 상태도 줄어든다

Lock은 중요한 해결책이지만 유일한 해결책은 아닙니다. Immutable object를 전달하거나, 작업마다 독립된 상태를 사용하거나, 상태를 한 실행 흐름이 소유하고 다른 thread는 메시지를 통해 요청하는 구조라면 같은 mutable state에 대한 경쟁 자체를 줄일 수 있습니다.

동시성 설계에서는 "어떤 lock을 붙일까"보다 **이 상태를 정말 여러 thread가 함께 수정해야 하는가**를 먼저 묻는 편이 좋습니다.

### 가시성과 원자성은 다른 문제다

한 thread의 write가 다른 thread에 올바르게 관찰되는지와, 여러 단계의 갱신 사이에 다른 thread가 끼어들 수 없는지는 별개의 질문입니다.

```text
visibility / ordering
→ 한 thread의 write를 다른 thread가 어떤 규칙으로 관찰하는가

atomicity
→ 여러 단계를 하나의 분할 불가능한 상태 전이로 다뤄야 하는가
```

그래서 `volatile int count`는 `count++` 전체를 atomic increment로 만들지 않습니다. 이후의 `volatile`, `synchronized`, atomic class는 각각 이 두 문제를 어떤 범위에서 해결하는지 구분해서 배워야 합니다.

동시성 버그를 분석할 때는 공유되는 mutable state를 찾고, 한 줄 연산을 실제 read/compute/write 단계로 풀어 본 뒤, 어떤 interleaving에서 invariant가 깨지는지 그려 보세요. 해결책은 그 다음에 선택해야 합니다.
