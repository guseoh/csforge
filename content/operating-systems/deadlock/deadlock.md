---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock
topicContentKey: operating-systems.core.deadlock
slug: deadlock
title: "Deadlock"
summary: "여러 execution이 서로 보유한 resource를 기다려 누구도 progress하지 못하는 dependency cycle을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf"
    title: "Operating Systems: Three Easy Pieces — Common Concurrency Problems"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "deadlock의 dependency cycle, Coffman conditions와 prevention 전략을 확인한다."
    displayOrder: 1
  - url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/deadlock.html"
    title: "Deadlock (The Java Tutorials)"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "두 Java thread가 서로의 intrinsic lock을 기다리며 멈추는 구체적인 deadlock 예제를 확인한다."
    displayOrder: 2
  - url: "https://d2.naver.com/helloworld/10963"
    title: "스레드 덤프 분석하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "JVM thread dump에서 lock owner와 waiter를 연결해 deadlock cycle을 해석하는 실제 사례를 확인한다."
    displayOrder: 3
---
# Deadlock

### 오래 기다리는 것과 서로를 영원히 기다리는 것은 다르다

한 thread가 lock을 오래 잡고 있어서 다른 thread가 5초, 10초 기다린다고 해서 그 상태를 바로 deadlock이라고 부르지는 않는다. Owner가 결국 작업을 끝내고 resource를 release할 수 있다면 기다림은 심한 contention일 수 있지만 progress 가능성은 남아 있다.

Deadlock은 여러 execution이 서로가 보유한 resource를 기다리는 dependency cycle에 들어가 **참여자 누구도 스스로 다음 단계로 진행할 수 없는 상태**다.

![두 thread와 두 lock이 서로를 기다리는 deadlock cycle](/learning/operating-systems/deadlock-cycle.svg)

두 thread가 lock을 반대 순서로 획득하면 다음 상태가 만들어질 수 있다.

```text
T1: holds L1 ─────────────── waits for L2
                          ▲             │
                          │             ▼
T2: waits for L1 ───────── holds L2
```

T1이 진행하려면 T2가 L2를 release해야 하고, T2가 진행하려면 T1이 L1을 release해야 한다. 그런데 둘 다 기다리는 상태에 들어갔으므로 scheduling 순서를 바꾸는 것만으로는 cycle을 풀 수 없다.

### 같은 코드도 interleaving에 따라 deadlock이 생길 수도 있다

T1이 L1과 L2를 먼저 모두 획득하고 release한 뒤 T2가 실행되면 같은 source code라도 deadlock은 발생하지 않을 수 있다. 문제는 **특정 interleaving이 circular dependency를 만들 수 있다는 것**이다.

그래서 동시성 테스트를 여러 번 통과했다는 사실만으로 lock acquisition order가 안전하다고 증명할 수 없다. Deadlock 가능성은 실행 횟수보다 resource dependency 구조를 봐야 한다.

### timeout은 멈춤을 끊을 수 있지만 cycle 설계를 없애지는 않는다

Lock acquisition에 timeout을 두면 waiting execution을 실패 경로로 보내 영원한 block을 피할 수 있다. 하지만 timeout 숫자를 추가했다고 `L1 → L2`와 `L2 → L1`의 circular acquisition structure가 사라지는 것은 아니다.

Timeout 뒤에는 현재 execution이 보유한 resource를 release하고, 중간 상태를 rollback하거나 operation을 abort해야 한다. 두 execution이 같은 timing과 같은 순서로 즉시 retry하면 deadlock 대신 반복 충돌이나 livelock을 만들 수도 있다.

### Backend에서는 서로 다른 resource 층도 하나의 cycle을 만들 수 있다

Application mutex, DB row lock, connection-pool permit처럼 서로 다른 종류의 resource가 한 요청 lifecycle에 섞일 수 있다. 예를 들어 T1이 JVM lock A를 보유한 채 DB row R을 기다리고, T2는 R을 보유한 transaction 안에서 A가 필요한 callback을 기다리면 다음 dependency가 생긴다.

```text
T1 ──waits──> R ──held by──> T2
▲                              │
│                              waits
│                              │
└────held by──── A <───────────┘
```

이런 문제는 application lock만 보거나 DB lock view만 보면 놓칠 수 있다. 장애 분석에서는 **누가 무엇을 보유하고 무엇을 기다리는가**를 같은 dependency graph로 연결해야 한다.

### 면접에서 이렇게 나옵니다

#### Q. Deadlock과 단순한 lock contention은 무엇이 다른가요?

Contention은 기다림이 있어도 owner가 결국 resource를 release하면 progress할 수 있다. Deadlock은 참여 execution의 dependency가 cycle을 이루어 외부 개입이나 recovery 없이는 스스로 progress할 수 없다.

#### Q. Lock timeout을 넣으면 deadlock prevention인가요?

아니다. Timeout은 기다림을 중단하고 recovery 경로로 보낼 수 있지만 circular wait가 생기는 acquisition structure 자체를 제거하지 않는다.
