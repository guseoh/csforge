---
kind: concept
contentKey: java.core.concurrency.deadlock-starvation-livelock
topicContentKey: java.core.concurrency
slug: deadlock-starvation-livelock
title: "Deadlock, starvation, and livelock"
summary: "thread가 진행하지 못하는 원인을 deadlock·starvation·livelock으로 구분하고 대기 관계와 progress를 기준으로 진단한다"
level: 3
status: PUBLISHED
displayOrder: 190
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java SE 25 JLS Chapter 17: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: lock·wait와 thread execution 모델 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/Lock.html"
    title: "Java SE 25 API: Lock"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: timed/interruptible lock acquisition 선택지 확인
---
# 멈춘 것처럼 보이는 프로그램의 원인은 하나가 아니다

서버 요청이 끝나지 않고 thread들이 오랫동안 살아 있다고 해 보겠습니다. 흔히 "deadlock 아닌가?"부터 떠올리지만, 진행하지 못하는 형태는 여러 가지입니다.

- 서로가 가진 자원을 기다리며 완전히 막힘: **deadlock**
- 특정 작업만 계속 실행 기회를 얻지 못함: **starvation**
- thread들은 계속 반응하고 상태를 바꾸지만 유용한 결과가 나오지 않음: **livelock**

세 문제를 구분하려면 단순히 thread가 살아 있는지가 아니라 **누가 무엇을 기다리고 있으며 실제 progress가 있는지**를 봐야 합니다.

### deadlock은 대기 관계가 원을 만들 때 발생할 수 있다

두 lock을 서로 다른 순서로 잡는 코드를 생각해 보겠습니다.

```text
Thread A                    Thread B
lock X 획득                 lock Y 획득
    │                           │
lock Y 기다림                lock X 기다림
    │                           │
    └──────── 서로 대기 ────────┘
```

A는 Y가 필요하지만 B가 가지고 있고, B는 X가 필요하지만 A가 가지고 있습니다. 둘 다 상대가 lock을 놓기 전까지 다음 단계로 갈 수 없습니다.

```java
// Thread A
synchronized (left) {
    synchronized (right) {
        transfer();
    }
}

// Thread B
synchronized (right) {
    synchronized (left) {
        transfer();
    }
}
```

실행 순서에 따라 실제 deadlock이 발생할 수 있습니다.

### deadlock 조건을 외우는 것보다 어느 조건을 끊을지 본다

고전적으로 deadlock에는 다음 조건들이 함께 등장합니다.

- 한 번에 하나만 사용할 수 있는 자원
- 자원을 가진 채 다른 자원을 기다림
- 다른 thread의 자원을 강제로 빼앗지 못함
- 자원 대기가 원형으로 연결됨

이 이름을 암기하는 목적은 시험용 분류가 아니라 **어떤 조건을 설계로 깨뜨릴 수 있는지** 찾는 데 있습니다.

가장 흔한 방법 중 하나는 모든 코드가 lock을 같은 순서로 획득하게 하는 것입니다.

```text
규칙: 항상 lock X -> lock Y 순서

Thread A: X -> Y
Thread B: X -> Y
```

그러면 X와 Y를 반대 순서로 잡아 만드는 circular wait를 피할 수 있습니다.

### timeout을 둔다고 deadlock 원인이 사라지는 것은 아니다

`Lock` API에서는 `tryLock(timeout)`처럼 일정 시간까지만 기다리는 방법을 사용할 수 있습니다.

```java
if (!first.tryLock(500, TimeUnit.MILLISECONDS)) {
    return false;
}
try {
    if (!second.tryLock(500, TimeUnit.MILLISECONDS)) {
        return false;
    }
    try {
        work();
        return true;
    } finally {
        second.unlock();
    }
} finally {
    first.unlock();
}
```

이 방식은 무한 대기를 벗어나는 방법이 될 수 있지만, 실패 후 상태를 되돌리고 언제 retry할지 설계해야 합니다. timeout을 붙였다고 lock ordering 문제 자체가 사라진 것은 아닙니다.

### starvation은 시스템이 움직이지만 특정 작업이 계속 밀리는 문제다

전체 서버는 계속 요청을 처리하는데 한 종류의 작업만 계속 실행되지 못할 수 있습니다.

예를 들어:

- 우선순위가 높은 작업만 계속 들어옴
- 작은 thread pool이 긴 작업으로 계속 점유됨
- lock 경쟁에서 특정 thread가 반복해서 기회를 놓침
- queue 정책 때문에 오래된 작업이 계속 뒤로 밀림

이때 시스템 전체에 progress가 있다는 점에서 deadlock과 다릅니다. 문제는 **특정 작업이 필요한 실행 기회를 사실상 얻지 못한다는 것**입니다.

```text
Task A: 실행 실행 실행 ...
Task B: 대기 ─────────────── 계속 대기
```

공정성 옵션이 도움이 되는 경우도 있지만 모든 starvation을 해결하는 하나의 설정은 없습니다. pool 크기, queue 정책, 작업 시간, lock 범위 등을 함께 봐야 합니다.

### livelock은 움직이지만 앞으로 가지 못한다

두 사람이 좁은 복도에서 서로 길을 비켜 주려고 동시에 왼쪽, 다시 동시에 오른쪽으로 계속 움직이는 상황을 떠올릴 수 있습니다.

thread도 비슷하게 서로의 상태 변화에 반응하며 retry/rollback을 반복할 수 있습니다.

```text
A: 충돌 -> 양보 -> 재시도
B: 충돌 -> 양보 -> 재시도
A: 충돌 -> 양보 -> 재시도
B: 충돌 -> 양보 -> 재시도
...
```

CPU도 사용하고 상태도 변하지만 실제 업무가 완료되지 않습니다. 그래서 thread state가 `RUNNABLE`이라고 해서 시스템이 건강하게 progress하고 있다고 볼 수 없습니다.

randomized backoff나 retry 정책 변경이 livelock을 줄이는 데 도움이 될 수 있지만, 먼저 어떤 피드백 구조가 반복을 만드는지 찾아야 합니다.

### 단순한 느린 I/O와도 구분해야 한다

외부 API가 60초 동안 응답하지 않는 thread는 오래 기다릴 수 있습니다. 이것은 그 자체로 Java lock deadlock이 아닙니다.

```text
Thread A -> socket read 대기
Thread B -> 정상 처리
```

DB connection pool 고갈이나 외부 API timeout처럼 자원 부족과 긴 대기가 chain을 만들 수도 있습니다. 현상만 보고 deadlock이라고 이름 붙이지 말고 실제 대기 대상과 소유 관계를 확인합니다.

### thread dump는 대기 관계를 보는 중요한 증거다

JVM thread dump에서는 thread state와 stack을 확인하고 monitor deadlock이 탐지되는 경우 대기 관계를 볼 수 있습니다. 특히:

- 어떤 monitor/lock을 기다리는가
- 누가 그 lock을 가지고 있는가
- 어떤 코드 경로에서 lock을 획득했는가
- 같은 패턴이 여러 thread에 반복되는가

를 확인합니다.

다만 thread dump 한 장만으로 모든 starvation/livelock을 자동 판정할 수 있는 것은 아닙니다. 시간에 따른 상태 변화, CPU 사용량, queue 길이, 요청 latency 같은 관찰과 함께 봅니다.

### 문제를 풀 때 확인할 것

1. thread가 무엇을 기다리는지 적습니다.
2. lock/resource 소유 관계를 화살표로 그립니다.
3. 대기 관계가 원을 만드는지 확인합니다.
4. 시스템 전체는 움직이는데 특정 작업만 굶고 있는지 봅니다.
5. 상태 변화는 계속되지만 완료 건수가 늘지 않는지 봅니다.
6. lock 문제가 아니라 외부 I/O/resource exhaustion인지 구분합니다.
7. prevention과 timeout/recovery를 같은 것으로 착각하지 않습니다.

### 면접에서 설명한다면

Deadlock은 thread들이 서로 가진 자원을 기다리며 순환 대기에 빠져 아무도 진행하지 못하는 상태입니다. Starvation은 시스템은 진행하지만 특정 thread나 작업이 계속 실행 기회를 얻지 못하는 상태이고, livelock은 thread들이 계속 상태를 바꾸고 반응하지만 실제 작업이 완료되지 않는 상태입니다. 진단할 때는 thread의 겉보기 state보다 자원 소유·대기 관계와 실제 progress를 확인해야 합니다.