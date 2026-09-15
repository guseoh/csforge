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

Deadlock은 둘 이상의 실행 흐름이 **서로가 보유한 resource를 기다리면서 참여자 누구도 스스로 다음 단계로 진행할 수 없는 상태**다.

단순히 lock을 오래 기다린다고 deadlock은 아니다. 현재 owner가 언젠가 resource를 release할 수 있다면 심한 contention일 수 있지만 progress 가능성은 남아 있다.

두 thread가 lock을 반대 순서로 잡는 상황을 보자.

```text
T1: holds L1 ───── waits for L2
                 ▲             │
                 │             ▼
T2: waits for L1 ───── holds L2
```

![두 thread와 두 lock이 서로를 기다리는 deadlock cycle](/learning/operating-systems/deadlock-cycle.svg)

T1이 진행하려면 T2가 L2를 놓아야 하고, T2가 진행하려면 T1이 L1을 놓아야 한다. 둘 다 기다리는 상태에 들어갔기 때문에 scheduler가 실행 순서를 바꾸는 것만으로는 cycle이 풀리지 않는다.

### 특정 interleaving에서만 만들어질 수 있다

같은 코드라도 T1이 L1과 L2를 모두 획득하고 release한 뒤 T2가 실행되면 deadlock이 생기지 않을 수 있다. 문제는 resource acquisition 순서가 특정 interleaving에서 circular dependency를 만들 수 있다는 점이다.

그래서 deadlock 가능성은 테스트 횟수보다 **누가 무엇을 보유하고 무엇을 기다리는지**를 추적하는 dependency 구조로 판단한다.

### Timeout과 deadlock prevention은 다르다

Timeout은 무한 대기를 끊고 실패 경로로 보낼 수 있지만 circular dependency 자체를 없애지는 않는다. Deadlock을 구조적으로 막으려면 resource protocol에서 cycle이 만들어지지 않도록 설계해야 한다.

Deadlock의 핵심은 **기다림 자체가 아니라, 참여 execution 사이의 resource dependency가 cycle을 이루어 스스로 progress할 경로가 사라지는 것**이다.