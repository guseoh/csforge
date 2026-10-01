---
kind: concept
contentKey: java.core.concurrency.concurrent-collections
topicContentKey: java.core.concurrency
slug: concurrent-collections
title: "동시성 컬렉션"
summary: "ConcurrentHashMap과 동시성 큐가 어떤 연산을 스레드 안전하게 제공하는지 이해하고 여러 단계의 업무 규칙까지 자동으로 원자화된다고 오해하지 않는다"
level: 2
status: PUBLISHED
displayOrder: 150
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html"
    title: "Java SE 25 API: ConcurrentHashMap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 동시성 Map 연산과 compute/merge 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentLinkedQueue.html"
    title: "Java SE 25 API: ConcurrentLinkedQueue"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 동시성 Queue의 offer/poll 계약 확인
---
# 동시성 컬렉션

여러 스레드가 같은 `HashMap`을 동시에 읽고 수정하면 컬렉션 내부 상태와 애플리케이션 결과를 안전하게 보장하기 어렵습니다. 모든 접근에 하나의 큰 외부 잠금을 두는 방법도 있지만, Java는 동시 접근을 고려해 설계된 컬렉션을 제공합니다.

대표적으로 `ConcurrentHashMap`과 `ConcurrentLinkedQueue`가 있습니다. 중요한 점은 **"동시성 컬렉션을 썼다"와 "내 업무 로직 전체가 원자적이다"가 같은 말이 아니라는 것**입니다.

### 개별 연산은 API가 정한 동시성 계약을 가진다

```java
ConcurrentHashMap<String, Integer> counts = new ConcurrentHashMap<>();
counts.put("java", 1);
int value = counts.get("java");
```

이런 개별 Map 연산은 동시 접근을 고려한 계약을 가집니다. 일반 `HashMap`을 여러 스레드가 수정하는 것과 다릅니다.

하지만 다음 코드는 문제가 남습니다.

```java
if (!counts.containsKey("java")) {
    counts.put("java", 1);
}
```

두 스레드가 동시에 `containsKey`에서 `false`를 보고 둘 다 `put`할 수 있습니다. 각 메서드는 안전해도 **두 호출 사이의 판단**은 하나의 연산이 아닙니다.

### 필요한 의미를 하나의 동시성 API로 표현한다

"없으면 만들기"가 필요하다면 그 의미를 제공하는 메서드를 사용합니다.

```java
ConcurrentHashMap<String, LongAdder> counts = new ConcurrentHashMap<>();

counts.computeIfAbsent("java", key -> new LongAdder())
      .increment();
```

`putIfAbsent`, `compute`, `computeIfAbsent`, `merge`처럼 API가 제공하는 복합 연산(compound operation)을 사용하면 `containsKey → put`을 별도로 조합하는 것보다 의도를 명확하게 표현할 수 있습니다.

다만 재매핑 함수(remapping function) 안에서 오래 걸리는 외부 I/O를 하거나 다른 복잡한 상태를 건드리는 것은 별개의 설계 문제입니다. 메서드가 동시성을 지원한다는 이유로 콜백 안에 임의의 업무 트랜잭션을 넣는 것이 자동으로 좋은 설계가 되지는 않습니다.

### 컬렉션이 안전해도 값 객체는 별개다

```java
ConcurrentHashMap<Long, Order> orders = new ConcurrentHashMap<>();
Order order = orders.get(1L);
order.changeStatus(...);
```

Map이 `Order` 참조를 안전하게 저장하고 조회한다고 해서 `Order`의 변경 가능한 필드를 여러 스레드가 동시에 수정해도 안전해지는 것은 아닙니다.

```text
ConcurrentHashMap
   └─ 항목 자체의 동시 접근 계약
        └─ Order 내부의 변경 가능한 상태는 별도 문제
```

컬렉션의 스레드 안전성과 원소 객체의 스레드 안전성을 분리해서 봅니다.

### 여러 컬렉션 사이의 규칙도 자동으로 묶이지 않는다

예를 들어 두 Map을 동시에 맞춰야 한다고 해 보겠습니다.

```text
usersById
usersByEmail
```

각각 `ConcurrentHashMap`이라고 해도 "두 Map에 항상 같은 사용자가 존재해야 한다"는 불변 조건은 자동으로 하나의 원자적 변경이 되지 않습니다. 이런 경우 상태 모델을 하나로 합치거나 외부 잠금 등 다른 조정 방법을 검토해야 합니다.

### 동시성 큐도 전체 순서를 마음대로 가정하면 안 된다

```java
ConcurrentLinkedQueue<Task> queue = new ConcurrentLinkedQueue<>();
queue.offer(task);
Task next = queue.poll();
```

`offer`와 `poll`은 여러 스레드가 동시에 사용할 수 있는 Queue API입니다. 하지만 `poll()`은 Queue가 비어 있으면 `null`을 반환할 수 있고, 소비자가 여러 개라면 어떤 소비자가 어느 작업을 가져갈지 애플리케이션이 특정 스레드 기준으로 예측하면 안 됩니다.

또 동시성 컬렉션의 반복자는 일반 컬렉션처럼 "순회 시작 시점의 완전한 스냅샷"을 뜻하지 않을 수 있습니다. `ConcurrentHashMap` 반복자는 약한 일관성(weakly consistent)을 제공하므로, 순회 중 변경이 있어도 `ConcurrentModificationException` 발생 여부만으로 안전성을 판단하는 방식과 다릅니다.

### null 제한도 일반 컬렉션과 다를 수 있다

`ConcurrentHashMap`은 `null` 키와 `null` 값을 허용하지 않습니다. 동시 환경에서 `get(key) == null`을 "값이 없었다"는 의미로 명확히 사용할 수 있게 하는 API 설계와 관련이 있습니다.

일반 `HashMap`의 사용 경험을 그대로 옮기지 말고 실제 동시성 컬렉션의 계약을 확인합니다.

### 메모리 일관성은 API 문서 기준으로 본다

`java.util.concurrent` 패키지는 여러 동시성 도구에 메모리 일관성 효과를 명시합니다. 동시성 컬렉션을 통한 객체 전달도 이런 공식 계약을 기준으로 이해해야 합니다. 특정 CPU 캐시 구현을 컬렉션의 언어 보장처럼 설명하지 않습니다.

### 언제 외부 잠금이 더 자연스러운가

동시성 컬렉션의 한두 연산만 필요하다면 제공 API가 적합합니다. 반면 아래처럼 여러 상태가 함께 바뀌어야 한다면 외부 동기화가 더 명확할 수 있습니다.

```text
재고 감소
+ 예약 레코드 추가
+ 별도 집계 Map 변경
```

무조건 `ConcurrentHashMap` 여러 개로 쪼개기보다 보호해야 할 불변 조건의 범위를 먼저 찾습니다.

### 문제를 풀 때 확인할 것

1. 하나의 컬렉션 연산인지 여러 연산의 조합인지 구분합니다.
2. `containsKey → put`처럼 확인 후 실행(check-then-act)이 분리되어 있는지 봅니다.
3. API가 `compute`, `merge`, `putIfAbsent` 같은 원자적 의미를 제공하는지 확인합니다.
4. 저장된 변경 가능한 값 객체도 공유되는지 봅니다.
5. 여러 컬렉션 사이의 불변 조건이 있는지 확인합니다.
6. 반복자를 스냅샷으로 가정하고 있지 않은지 봅니다.

### 학습 후 스스로 설명해 보기

동시성 컬렉션은 여러 스레드의 동시 접근을 고려해 개별 연산과 일부 복합 연산에 스레드 안전성 계약을 제공합니다. 하지만 `containsKey` 후 `put`처럼 여러 호출을 조합한 업무 로직 전체나 저장된 변경 가능 객체의 상태까지 자동으로 원자화하지는 않습니다. 보호해야 할 불변 조건을 보고 동시성 API 하나로 표현할지 외부 동기화를 사용할지 결정해야 합니다.
