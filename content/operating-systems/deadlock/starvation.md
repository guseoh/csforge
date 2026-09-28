---
kind: concept
contentKey: operating-systems.core.deadlock.starvation
topicContentKey: operating-systems.core.deadlock
slug: starvation
title: "기아(Starvation)"
summary: "시스템은 진행하지만 특정 실행만 자원·CPU 기회를 계속 얻지 못하는 starvation을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf"
    title: "Operating Systems: Three Easy Pieces — Common 동시성 Problems"
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
# 기아(Starvation)

Starvation은 **시스템 전체는 계속 진행하지만 특정 실행만 필요한 CPU나 자원 기회를 계속 얻지 못하는 liveness 문제**다.

우선순위 스케줄러에서 높은 우선순위 작업가 계속 선택되는 동안 낮은 우선순위 작업가 실행 가능 상태로 남아 있다고 하자.

```text
dispatch: H1 → H2 → H3 → H4 → ...
L waits:  ───────────────────────→
```

CPU는 계속 일을 하고 다른 작업도 완료되지만 L은 서비스를 받지 못한다.

### Deadlock과 Livelock과 비교한다

세 문제는 모두 진행와 관련되지만 실패 모양이 다르다.

| 문제 | 전체/참여 실행의 상태 |
| --- | --- |
| Deadlock | 서로 기다리는 순환 때문에 참여자들이 진행하지 못함 |
| Livelock | 계속 행동하지만 서로 방해해 유효한 진행가 없음 |
| Starvation | 다른 실행은 진행하지만 특정 실행만 계속 배제됨 |

Starvation의 구체적인 원인은 스케줄러 우선순위뿐 아니라 lock이나 큐의 admission 정책일 수도 있다. Reader를 계속 우선하는 read-write lock에서 writer가 장기간 선택되지 않는 경우가 한 예다.

### 해결 방향은 공정성를 회복하는 것이다

Aging, fair admission, 최소 서비스 보장처럼 특정 실행이 무기한 배제되지 않게 만드는 정책을 사용할 수 있다. 다만 공정성를 강화하면 높은 우선순위 응답 시간이나 처리량 같은 다른 목표와 trade-off가 생길 수 있다.

Scheduling Topic에서 aging을 이미 다뤘으므로 여기서의 핵심은 해결 알고리즘보다 **starvation이 다른 실행의 진행는 유지된 채 특정 실행만 서비스에서 배제되는 liveness 실패라는 점**을 deadlock과 livelock에서 구분하는 것이다.