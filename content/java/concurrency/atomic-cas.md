---
kind: concept
contentKey: java.core.concurrency.atomic-cas
topicContentKey: java.core.concurrency
slug: atomic-cas
title: "Atomic variables and CAS"
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

여러 thread가 하나의 숫자를 증가시킬 때 `volatile int`만으로는 lost update를 막지 못했습니다. 그렇다고 모든 경우에 큰 `synchronized` block이 필요한 것도 아닙니다. **하나의 값에 대한 읽기-확인-갱신을 원자적으로 수행하는 API**가 필요할 때 Java의 atomic classes를 사용할 수 있습니다.

그 중심에 compare-and-set(CAS)라는 개념이 있습니다.

### CAS는 "내가 읽었던 값이 아직 그대로인가"를 확인하고 바꾼다

개념적으로 CAS는 세 값을 생각하면 됩니다.

```text
current  = 지금 실제 값
expected = 내가 이전에 읽고 예상한 값
update   = 바꾸려는 새 값
```

조건은 단순합니다.

```text
current == expected
    ├─ yes -> update로 변경, 성공
    └─ no  -> 변경하지 않음, 실패
```

`AtomicInteger`에서는 다음처럼 사용할 수 있습니다.

```java
AtomicInteger count = new AtomicInteger(0);

boolean changed = count.compareAndSet(0, 1);
```

현재 값이 정말 0이었던 순간에만 1로 바뀝니다.

### 다른 thread가 먼저 바꾸면 CAS는 실패한다

두 thread가 동시에 0을 읽었다고 해 보겠습니다.

```text
초기값 = 0

Thread A                    Thread B
read 0                      read 0
CAS expected=0, update=1
 -> 성공, 실제 값 1
                            CAS expected=0, update=1
                             -> 현재값 1이므로 실패
```

B는 실패했다는 사실을 알 수 있으므로 현재 값을 다시 읽고 새 결과를 계산해 다시 시도할 수 있습니다.

### retry loop는 이렇게 동작한다

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

CAS에 실패했다고 예외 상황은 아닙니다. "내가 계산하는 동안 다른 thread가 값을 먼저 바꿨다"는 정상적인 경쟁 결과입니다.

물론 실제 증가에는 `incrementAndGet()` 같은 이미 제공되는 atomic API를 쓰는 편이 낫습니다. 직접 loop를 만드는 예제는 CAS의 상태 변화를 이해하기 위한 것입니다.

### lock을 기다리는 것과 retry하는 것은 다른 비용 모델이다

Lock 기반 코드에서는 다른 thread가 critical section을 소유하면 대기합니다. CAS 기반 알고리즘에서는 값이 바뀌었으면 다시 계산하고 재시도할 수 있습니다.

경쟁이 적다면 retry가 거의 없을 수 있지만, 많은 thread가 같은 값에 몰리면 여러 thread가 계속 실패하고 재시도하면서 CPU를 사용할 수 있습니다.

```text
낮은 contention: 대부분 한두 번에 성공
높은 contention: CAS 실패 -> retry -> 실패 -> retry ...
```

그래서 "lock-free/CAS는 항상 lock보다 빠르다"는 결론을 미리 내리면 안 됩니다. workload와 contention을 봐야 합니다.

### AtomicInteger 하나는 하나의 상태를 잘 다룬다

```java
AtomicInteger count = new AtomicInteger();
count.incrementAndGet();
```

이런 단일 counter는 atomic API와 잘 맞습니다.

하지만 주문 상태처럼 여러 값이 함께 바뀌어야 한다면 문제가 달라집니다.

```text
available = 10
reserved  = 3

invariant: reserved <= available
```

`available`과 `reserved`를 각각 AtomicInteger로 만들었다고 두 값의 관계가 하나의 atomic transaction이 되지는 않습니다.

한 가지 방법은 관련 값을 immutable state 하나로 묶고 `AtomicReference<State>` 전체를 CAS로 교체하는 것입니다. 또는 lock으로 여러 field를 같은 critical section에 둘 수도 있습니다.

### ABA 같은 더 깊은 문제도 존재한다

CAS는 "현재 값이 expected와 같은가"를 봅니다. 값이 A에서 B로 바뀌었다가 다시 A가 되었다면 단순 값 비교만으로 중간 변경이 있었다는 사실을 알 수 없는 경우가 있습니다. 이를 ABA 문제라고 부릅니다.

모든 backend code가 ABA를 직접 해결해야 하는 것은 아니지만, CAS가 "중간 history까지 알아서 검증하는 마법"은 아니라는 점을 보여 줍니다. 필요한 경우 version/stamp를 함께 관리하는 방법을 검토할 수 있습니다.

### 문제를 풀 때 확인할 것

1. CAS의 expected/current/update를 각각 적습니다.
2. 다른 thread가 먼저 값을 바꿨을 때 성공/실패를 추적합니다.
3. 실패 후 새 값을 다시 읽고 계산하는지 봅니다.
4. 경쟁이 높을 때 retry 비용을 생각합니다.
5. 보호할 invariant가 단일 변수인지 여러 상태의 관계인지 확인합니다.

### 자주 헷갈리는 부분

- CAS 실패는 예외가 아니라 expected가 더 이상 현재값이 아니라는 결과입니다.
- AtomicInteger 하나가 여러 field의 업무 invariant를 자동 보호하지 않습니다.
- CAS retry 방식이 모든 workload에서 lock보다 빠른 것은 아닙니다.
- CAS는 값이 과거에 어떻게 변했는지 history를 자동으로 기록하지 않습니다.

### 면접에서 설명한다면

CAS는 현재 값이 내가 예상한 값과 같을 때만 새 값으로 바꾸는 원자적인 조건부 갱신입니다. 다른 thread가 먼저 값을 바꾸면 실패하고 caller는 새 값을 읽어 retry할 수 있습니다. `AtomicInteger` 같은 클래스가 이를 이용한 단일 값 atomic update를 제공하지만 contention이 높으면 retry 비용이 커질 수 있고, 여러 field 사이의 invariant는 별도의 상태 모델이나 lock이 필요할 수 있습니다.
