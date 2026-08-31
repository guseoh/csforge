---
kind: concept
contentKey: java.core.concurrency.concurrent-collections
topicContentKey: java.core.concurrency
slug: concurrent-collections
title: "Concurrent collections"
summary: "ConcurrentHashMap과 concurrent queue가 어떤 연산을 thread-safe하게 제공하는지 이해하고 여러 단계의 업무 규칙까지 자동으로 원자화된다고 오해하지 않는다"
level: 2
status: PUBLISHED
displayOrder: 150
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html"
    title: "Java SE 25 API: ConcurrentHashMap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: concurrent map 연산과 compute/merge 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentLinkedQueue.html"
    title: "Java SE 25 API: ConcurrentLinkedQueue"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: concurrent queue의 offer/poll 계약 확인
---
# Concurrent collection은 어디까지 안전하게 해 줄까

여러 thread가 같은 `HashMap`을 동시에 읽고 수정하면 collection 내부 상태와 애플리케이션의 결과를 안전하게 보장하기 어렵습니다. 단순히 모든 접근에 큰 외부 lock을 두는 방법도 있지만, Java는 동시 접근을 고려해 설계된 collection을 제공합니다.

대표적으로 `ConcurrentHashMap`과 `ConcurrentLinkedQueue`가 있습니다. 중요한 점은 **"concurrent collection을 썼다"와 "내 업무 로직 전체가 원자적이다"가 같은 말이 아니라는 것**입니다.

### 개별 연산은 API가 정한 동시성 계약을 가진다

```java
ConcurrentHashMap<String, Integer> counts = new ConcurrentHashMap<>();
counts.put("java", 1);
int value = counts.get("java");
```

이런 개별 map 연산은 concurrent 환경을 고려한 계약을 가집니다. 일반 `HashMap`을 여러 thread가 수정하는 것과 다릅니다.

하지만 다음 코드는 문제가 남습니다.

```java
if (!counts.containsKey("java")) {
    counts.put("java", 1);
}
```

두 thread가 동시에 `containsKey`에서 false를 보고 둘 다 `put`할 수 있습니다. 각 메서드는 안전해도 **두 호출 사이의 판단**은 하나의 연산이 아닙니다.

### 필요한 의미를 하나의 concurrent API로 표현한다

"없으면 만들기"가 필요하다면 그 의미를 제공하는 메서드를 사용합니다.

```java
ConcurrentHashMap<String, LongAdder> counts = new ConcurrentHashMap<>();

counts.computeIfAbsent("java", key -> new LongAdder())
      .increment();
```

`putIfAbsent`, `compute`, `computeIfAbsent`, `merge`처럼 API가 제공하는 compound operation을 사용하면 별도로 `containsKey → put`을 조합하는 것보다 의도를 명확하게 표현할 수 있습니다.

다만 remapping function 안에서 오래 걸리는 외부 I/O를 하거나 다른 복잡한 상태를 건드리는 것은 별개의 설계 문제입니다. 메서드가 concurrent하다는 이유로 callback 안에 임의의 업무 transaction을 넣는 것이 자동으로 좋은 설계가 되지는 않습니다.

### collection이 안전해도 value 객체는 별개다

```java
ConcurrentHashMap<Long, Order> orders = new ConcurrentHashMap<>();
Order order = orders.get(1L);
order.changeStatus(...);
```

map이 `Order` 참조를 안전하게 저장하고 조회한다고 해서 `Order`의 mutable field를 여러 thread가 동시에 변경해도 안전해지는 것은 아닙니다.

```text
ConcurrentHashMap
   └─ entry 자체의 concurrent 접근 계약
        └─ Order 내부 mutable state는 별도 문제
```

collection의 thread-safety와 원소 객체의 thread-safety를 분리해서 봅니다.

### 여러 collection 사이의 규칙도 자동으로 묶이지 않는다

예를 들어 두 map을 동시에 맞춰야 한다고 해 보겠습니다.

```text
usersById
usersByEmail
```

각각 `ConcurrentHashMap`이라고 해도 "두 map에 항상 같은 사용자가 존재해야 한다"는 invariant는 자동으로 하나의 원자적 변경이 되지 않습니다. 이런 경우 상태 모델을 하나로 합치거나 외부 lock/다른 조정 방법을 검토해야 합니다.

### concurrent queue도 전체 순서를 마음대로 가정하면 안 된다

```java
ConcurrentLinkedQueue<Task> queue = new ConcurrentLinkedQueue<>();
queue.offer(task);
Task next = queue.poll();
```

`offer`와 `poll`은 여러 thread가 동시에 사용할 수 있는 queue API입니다. 하지만 `poll()`은 queue가 비어 있으면 `null`을 반환할 수 있고, consumer가 여러 개라면 어떤 consumer가 어느 task를 가져갈지 애플리케이션이 특정 thread 기준으로 예측하면 안 됩니다.

또 concurrent collection의 iterator는 일반 collection처럼 "순회 시작 시점의 완전한 snapshot"을 뜻하지 않을 수 있습니다. `ConcurrentHashMap` iterator는 weakly consistent한 관찰을 제공하므로, 순회 도중 변경이 있어도 `ConcurrentModificationException`을 기준으로 안전성을 판단하는 방식과 다릅니다.

### null 제한도 일반 collection과 다를 수 있다

`ConcurrentHashMap`은 null key와 null value를 허용하지 않습니다. concurrent 환경에서 `get(key) == null`을 "값이 없었다"는 의미로 명확히 사용할 수 있게 하는 API 설계와 관련이 있습니다.

일반 `HashMap`의 사용 경험을 그대로 옮기지 말고 실제 concurrent collection의 계약을 확인합니다.

### memory consistency는 API 문서 기준으로 본다

`java.util.concurrent` package는 여러 동시성 도구에 memory consistency 효과를 명시합니다. Concurrent collection을 통한 객체 전달도 이런 공식 계약을 기준으로 이해해야 합니다. 특정 CPU cache 구현을 collection의 언어 보장처럼 설명하지 않습니다.

### 언제 외부 lock이 더 자연스러운가

concurrent collection의 한두 연산만 필요하다면 제공 API가 적합합니다. 반면 아래처럼 여러 상태가 함께 바뀌어야 한다면 외부 동기화가 더 명확할 수 있습니다.

```text
재고 감소
+ 예약 레코드 추가
+ 별도 집계 map 변경
```

무조건 `ConcurrentHashMap` 여러 개로 쪼개기보다 보호해야 할 invariant의 범위를 먼저 찾습니다.

### 문제를 풀 때 확인할 것

1. 하나의 collection 연산인지 여러 연산의 조합인지 구분합니다.
2. `containsKey → put`처럼 check-then-act가 분리되어 있는지 봅니다.
3. API가 `compute/merge/putIfAbsent` 같은 원자적 의미를 제공하는지 확인합니다.
4. 저장된 mutable value도 공유되는지 봅니다.
5. 여러 collection 사이의 invariant가 있는지 확인합니다.
6. iterator를 snapshot으로 가정하고 있지 않은지 봅니다.

### 면접에서 설명한다면

Concurrent collection은 여러 thread의 동시 접근을 고려해 개별 연산과 일부 compound operation에 thread-safety 계약을 제공합니다. 하지만 `containsKey` 후 `put`처럼 여러 호출을 조합한 업무 로직 전체나 저장된 mutable 객체의 상태까지 자동으로 원자화하지는 않습니다. 보호해야 할 invariant를 보고 concurrent API 하나로 표현할지 외부 동기화를 사용할지 결정해야 합니다.
