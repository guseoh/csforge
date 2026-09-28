---
kind: concept
contentKey: operating-systems.core.deadlock.starvation
topicContentKey: operating-systems.core.deadlock
slug: starvation
title: "기아(Starvation)"
summary: "시스템 전체는 진행하지만 특정 실행 흐름만 CPU·자원 기회를 계속 얻지 못하는 기아를 설명한다."
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
# 기아(Starvation)

기아는 **시스템 전체는 계속 진행하지만 특정 실행 흐름만 필요한 CPU나 자원 기회를 계속 얻지 못하는 진행성(liveness) 문제**다.

우선순위 스케줄러에서 높은 우선순위 작업이 계속 선택되는 동안 낮은 우선순위 작업 L이 실행 가능한 상태로 남아 있다고 하자.

```text
dispatch: H1 → H2 → H3 → H4 → ...
L waits:  ───────────────────────→
```

CPU는 계속 일을 하고 다른 작업도 완료되지만 L은 실행 기회를 받지 못한다.

### 교착 상태와 라이브락과 비교한다

세 문제는 모두 진행성과 관련되지만 실패 모양이 다르다.

| 문제 | 전체/참여 실행 흐름의 상태 |
| --- | --- |
| 교착 상태 | 서로 기다리는 순환 때문에 참여자들이 진행하지 못함 |
| 라이브락 | 계속 행동하지만 서로 방해해 유효한 진행이 없음 |
| 기아 | 다른 실행은 진행하지만 특정 실행만 계속 배제됨 |

기아의 원인은 스케줄러 우선순위뿐 아니라 락이나 큐의 진입 정책일 수도 있다. 예를 들어 읽기 작업을 계속 우선하는 읽기-쓰기 잠금에서는 쓰기 작업이 장기간 선택되지 않을 수 있다.

### 해결 방향은 공정성을 회복하는 것이다

에이징, 공정한 진입 정책, 최소 실행 기회 보장처럼 특정 실행 흐름이 무기한 배제되지 않게 만드는 방법을 사용할 수 있다. 다만 공정성을 강화하면 높은 우선순위 작업의 응답 시간이나 처리량 같은 다른 목표와 절충이 생길 수 있다.

스케줄링 Topic에서 에이징을 이미 다뤘으므로 여기서의 핵심은 해결 알고리즘보다 **기아가 다른 실행 흐름의 진행은 유지된 채 특정 실행만 실행 기회에서 배제되는 진행성 실패라는 점**을 교착 상태와 라이브락에서 구분하는 것이다.
