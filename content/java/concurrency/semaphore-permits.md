---
kind: concept
contentKey: java.core.concurrency.semaphore-permits
topicContentKey: java.core.concurrency
slug: semaphore-permits
title: "Semaphore permits"
summary: "동시에 사용할 수 있는 작업·자원의 수를 permit으로 제한하고 acquire/release·timeout·소유권 차이를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 140
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Semaphore.html"
    title: "Java SE 25 API: Semaphore"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: permit acquire/release·fairness·memory consistency 계약 확인
---
# Semaphore로 동시 사용량 제한하기

외부 API가 동시에 10개의 요청까지만 안정적으로 처리할 수 있거나, 한 프로세스에서 무거운 작업을 세 개까지만 실행하고 싶을 수 있습니다. 이 문제는 "한 번에 한 thread만 들어가게 하자"와는 조금 다릅니다. **동시에 N개까지는 허용하되 그 이상만 기다리게 하는 것**이 목표입니다.

`Semaphore`는 이 허용량을 permit이라는 개수로 표현합니다.

### permit은 동시에 들어갈 수 있는 자리 수다

```java
Semaphore slots = new Semaphore(3);
```

처음에는 permit이 3개 있습니다.

```text
permit = 3
Task A acquire -> 2
Task B acquire -> 1
Task C acquire -> 0
Task D acquire -> 기다림

Task B release -> 1
Task D 진행 가능
```

`acquire()`는 permit 하나를 얻고, 사용할 permit이 없으면 기다립니다. 작업이 끝나면 `release()`로 permit을 돌려줍니다.

```java
slots.acquire();
try {
    callLimitedService();
} finally {
    slots.release();
}
```

예외가 발생해도 permit을 돌려주도록 `finally`를 사용하는 것이 중요합니다.

### Semaphore와 `synchronized`는 목적이 다르다

`synchronized`나 일반적인 lock은 보통 한 critical section을 한 번에 한 thread가 소유하도록 만드는 mutual exclusion에 사용합니다. Semaphore는 permit이 여러 개일 수 있어서 **동시 접근 수를 제한하는 용도**에 잘 맞습니다.

또 중요한 차이가 하나 더 있습니다. Semaphore permit에는 monitor lock과 같은 thread ownership 규칙이 없습니다. 어떤 thread가 permit을 얻었는지 Semaphore가 lock ownership처럼 강제하지 않습니다.

이 때문에 잘못된 코드가 가능합니다.

```java
semaphore.release(); // 실제 acquire 없이 호출해도 permit 수를 늘릴 수 있음
```

따라서 permit 획득과 반환 책임을 코드 구조로 맞춰야 합니다. double release는 실제 자원이 늘어난 것이 아닌데 허용량만 부풀릴 수 있습니다.

### 기다리지 않는 방식도 선택할 수 있다

무조건 기다리는 `acquire()`가 모든 서버 코드에 맞는 것은 아닙니다.

```java
if (!slots.tryAcquire()) {
    return rejectRequest();
}

try {
    useResource();
} finally {
    slots.release();
}
```

또는 일정 시간까지만 기다릴 수 있습니다.

```java
boolean acquired = slots.tryAcquire(500, TimeUnit.MILLISECONDS);
```

사용자 요청 처리처럼 latency 한도가 있다면 무한히 기다리는 대신 빠르게 실패하거나 timeout을 주는 것이 더 올바를 수 있습니다.

### Semaphore가 실제 자원을 만들어 주지는 않는다

DB connection이 실제로 10개뿐인데 Semaphore permit을 100으로 설정한다고 connection이 100개 생기지 않습니다.

```text
Semaphore permits = 100
DB connections    = 10

실제 병목 = DB connection 10개
```

Semaphore는 애플리케이션이 동시에 시도하는 수를 제한할 뿐입니다. 실제 하위 자원 capacity와 맞지 않는 제한은 효과가 없거나 오히려 불필요한 대기를 만들 수 있습니다.

그래서 동시성 제한값은 외부 시스템 계약, connection pool, CPU/메모리, 실제 측정값과 함께 정합니다.

### fairness는 "항상 공평함"이 아니다

Semaphore는 공정성(fairness) 옵션을 제공할 수 있습니다. 공정 모드는 대기 중인 thread의 순서를 더 고려하지만, 이것이 전체 시스템의 요청이 완전히 공평하게 처리된다는 뜻은 아닙니다.

또 공정성을 높이면 throughput과 비용 사이에 trade-off가 생길 수 있습니다. 필요가 명확하지 않다면 단순히 "공정=true가 더 좋다"고 선택하지 않습니다.

### 동시 사용량 제한과 상태 보호를 구분한다

Semaphore가 permit을 3개로 제한한다고 공유 객체의 모든 변경이 thread-safe해지는 것은 아닙니다.

```java
Semaphore slots = new Semaphore(3);
int balance;
```

세 thread가 동시에 critical state인 `balance`를 수정한다면 여전히 race가 생길 수 있습니다. Semaphore의 목적을 "동시에 최대 3개 작업 허용"으로 잡았다면, 그 안의 공유 데이터 invariant는 별도 동기화가 필요할 수 있습니다.

### API가 제공하는 memory consistency

공식 `Semaphore` API는 한 thread에서 `release()` 전에 한 작업과 다른 thread의 성공적인 `acquire()` 이후 작업 사이에 memory consistency 효과를 정의합니다. 따라서 permit 전달은 단순 카운터 조작 이상의 동시성 의미를 가집니다.

하지만 이 보장이 외부 DB transaction이나 HTTP 요청 결과까지 원자적으로 묶어 주는 것은 아닙니다.

### 언제 사용하는가

잘 맞는 예시는 다음과 같습니다.

- 외부 API 동시 호출 수 제한
- 무거운 파일 변환 작업 동시 실행 수 제한
- 제한된 native/resource 사용량 제어
- 테스트에서 동시에 진입 가능한 worker 수 제어

단순히 하나의 공유 상태를 보호하려는 문제라면 `synchronized`/`Lock`, queue 기반 처리라면 `BlockingQueue`가 더 자연스러울 수 있습니다.

### 문제를 풀 때 확인할 것

1. permit 수가 실제로 무엇을 제한하는지 적습니다.
2. acquire에 성공한 모든 경로가 release하는지 확인합니다.
3. 실패/예외 경로에서 permit이 새지 않는지 봅니다.
4. 무한 대기와 즉시 실패/timeout 중 어느 정책인지 확인합니다.
5. 실제 하위 resource capacity와 permit 수가 맞는지 봅니다.
6. Semaphore가 공유 상태 invariant까지 자동 보호한다고 가정하지 않습니다.

### 면접에서 설명한다면

Semaphore는 permit 개수로 동시에 수행할 수 있는 작업이나 사용할 수 있는 자원 수를 제한하는 동시성 도구입니다. `acquire`로 permit을 얻고 `release`로 돌려주며, permit이 없으면 기다리거나 `tryAcquire`로 실패/timeout을 처리할 수 있습니다. monitor lock과 같은 thread 소유권이 없으므로 release 책임을 정확히 관리해야 하고, Semaphore가 실제 자원 수를 늘리거나 내부 공유 상태를 자동으로 thread-safe하게 만드는 것은 아닙니다.
