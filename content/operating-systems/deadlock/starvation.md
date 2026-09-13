---
kind: concept
contentKey: operating-systems.core.deadlock.starvation
topicContentKey: operating-systems.core.deadlock
slug: starvation
title: "Starvation"
summary: "system은 progress하지만 특정 execution만 자원·CPU 기회를 계속 얻지 못하는 starvation을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf"
    title: "Operating Systems: Three Easy Pieces — Common Concurrency Problems"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "deadlock의 dependency cycle, Coffman conditions와 prevention 전략을 확인한다."
    displayOrder: 1
  - url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/starvelive.html"
    title: "Starvation and Livelock (The Java Tutorials)"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Java concurrency 예시를 통해 starvation과 livelock의 liveness 차이를 확인한다."
    displayOrder: 2
---
# Starvation

### System 전체가 움직여도 특정 execution은 계속 기회를 잃을 수 있다

Starvation은 다른 task들은 계속 완료되는데 특정 process, thread, 요청이 CPU, lock, queue service 같은 필요한 기회를 장기간 또는 무기한 얻지 못하는 liveness 문제다. Deadlock처럼 참여자 전체가 circular wait에 묶일 필요가 없다.

Priority scheduler에서 high-priority task가 계속 도착하는 상황을 단순화하면 다음처럼 볼 수 있다.

```text
ready queue:
L(low)  H1  H2  H3  H4  H5 ...

dispatch:
         H1 → H2 → H3 → H4 → H5 → ...
L waits: ─────────────────────────────→
```

CPU는 계속 일을 하고 처리량도 나올 수 있지만 L은 service를 받지 못한다.

### Read-write lock에서도 admission policy에 따라 starvation이 생길 수 있다

Reader를 우선하는 구현에서 writer가 기다리는 중에도 새 reader를 계속 받아 준다면 reader stream이 끊기지 않는 동안 writer가 exclusive ownership을 얻을 순간이 오지 않을 수 있다. 반대로 writer preference를 강하게 두면 새 reader 지연 시간이 늘어날 수 있다.

즉 starvation은 lock 종류 하나의 필연적 성질이라기보다 **누구를 다음에 admission할지 정하는 fairness policy**와 연결된다.

### 평균 처리량과 평균 지연 시간은 starvation을 숨길 수 있다

다른 task가 빠르게 끝나면 system 평균 지연 시간은 양호하게 보일 수 있다. 하지만 오래 기다리는 하나의 task는 평균값에서 거의 보이지 않는다.

그래서 fairness를 보려면 oldest task age, 최대 wait time, tail wait 지연 시간, class별 service share처럼 **특정 실행 흐름이 계속 배제되는지 드러나는 지표**가 필요하다.

### 공정성을 높이면 다른 목표와 trade-off가 생길 수 있다

Aging, FIFO/fair lock, weighted queue, quota, minimum service guarantee 등을 사용하면 특정 task나 class가 영원히 밀리는 위험을 줄일 수 있다. 그러나 strict fairness는 cache locality, high-priority 응답 시간, 전체 처리량 같은 다른 목표를 희생할 수 있다.

Starvation 완화는 priority inversion 해결과도 구분해야 한다. Priority inheritance는 low-priority resource owner 때문에 high-priority waiter가 막히는 inversion을 다루는 protocol이다. Low-priority runnable task가 scheduling policy 때문에 계속 선택되지 않는 일반 starvation에는 aging이나 service guarantee 같은 다른 정책이 필요하다.
