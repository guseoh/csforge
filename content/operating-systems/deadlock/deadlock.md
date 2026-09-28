---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock
topicContentKey: operating-systems.core.deadlock
slug: deadlock
title: "교착 상태(Deadlock)"
summary: "여러 실행 흐름이 서로 보유한 자원을 기다리며 누구도 진행하지 못하는 순환 의존 관계를 설명한다."
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
# 교착 상태(Deadlock)

교착 상태는 둘 이상의 실행 흐름이 **서로가 보유한 자원을 기다리면서 참여자 누구도 스스로 다음 단계로 진행할 수 없는 상태**다.

단순히 락을 오래 기다린다고 교착 상태는 아니다. 현재 소유자가 언젠가 자원을 해제할 수 있다면 심한 경합일 수 있지만 진행 가능성은 남아 있다.

두 스레드가 락을 반대 순서로 잡는 상황을 보자.

```text
T1: holds L1 ───── waits for L2
                 ▲             │
                 │             ▼
T2: waits for L1 ───── holds L2
```

![두 thread와 두 lock이 서로를 기다리는 deadlock cycle](/learning/operating-systems/deadlock-cycle.svg)

T1이 진행하려면 T2가 L2를 놓아야 하고, T2가 진행하려면 T1이 L1을 놓아야 한다. 둘 다 상대가 보유한 자원을 기다리므로 스케줄러가 실행 순서를 바꾸는 것만으로는 이 순환을 풀 수 없다.

### 특정 실행 교차에서만 만들어질 수 있다

같은 코드라도 T1이 L1과 L2를 모두 획득하고 해제한 뒤 T2가 실행되면 교착 상태가 생기지 않을 수 있다. 문제는 **자원 획득 순서가 특정 실행 교차에서 순환 의존 관계를 만들 수 있다는 점**이다.

그래서 교착 가능성은 테스트 횟수보다 `누가 무엇을 보유하고 무엇을 기다리는가`라는 의존 관계로 판단해야 한다.

### 시간 초과와 교착 예방은 다르다

시간 초과(timeout)는 무한 대기를 끊고 실패 경로로 보낼 수 있지만 순환 의존 관계 자체를 없애지는 않는다. 교착을 구조적으로 막으려면 자원 획득 규칙에서 순환이 만들어지지 않도록 설계해야 한다.

교착 상태의 핵심은 **기다림 자체가 아니라, 참여 실행 흐름 사이의 자원 의존 관계가 순환을 이루어 스스로 진행할 경로가 사라지는 것**이다.
