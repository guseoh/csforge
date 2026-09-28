---
kind: concept
contentKey: operating-systems.core.scheduling.priority-scheduling
topicContentKey: operating-systems.core.scheduling
slug: priority-scheduling
title: "우선순위 스케줄링(Priority Scheduling)"
summary: "우선순위가 실행 가능한 작업 선택에 미치는 영향과 기아·우선순위 역전의 경계를 구분한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/08-cpu-sched-mlfq.pdf"
    title: "OSTEP Korean: Multi-Level Feedback Queue"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "priority boost가 long-running job starvation을 방지하는 scheduler 설계 이유를 확인한다."
    displayOrder: 1
---
# 우선순위 스케줄링(Priority Scheduling)

우선순위 스케줄링은 여러 실행 가능한 작업 중 **더 높은 스케줄링 우선순위를 가진 작업에 CPU 실행 기회를 먼저 제공**하는 정책이다. 모든 작업을 같은 중요도로 다루지 않고 긴급도나 작업 부하의 성격을 스케줄링 결정에 반영할 수 있다.

같은 우선순위 안에서는 FIFO나 라운드 로빈 같은 다른 규칙을 함께 사용할 수 있다. 또한 우선순위가 항상 고정될 필요도 없다. 스케줄러가 대기 시간이나 최근 CPU 사용량 같은 정보를 반영해 실효 우선순위(effective priority)를 바꾸는 설계도 가능하다.

```text
실행 가능한 작업
A: 높음
B: 중간
C: 낮음

→ A가 먼저 선택될 가능성이 높음
```

### 높은 우선순위를 먼저 선택하면 낮은 우선순위의 대기가 늘 수 있다

높은 우선순위 작업이 계속 들어오면 낮은 우선순위 작업은 실행 가능한 상태인데도 CPU 실행 기회를 거의 받지 못할 수 있다. 즉 우선순위는 중요도를 표현하는 대신 **공정성과 최대 대기 시간 문제**를 만들 수 있다.

그래서 우선순위 정책은 단순히 "중요한 것을 먼저 실행한다"에서 끝나지 않는다. 우선순위를 누가 부여하는지, 낮은 우선순위 작업에도 최소한의 실행 기회를 어떻게 보장할지 함께 설계해야 한다.

### 기아와 우선순위 역전은 다른 문제다

우선순위 스케줄링 자체에서 낮은 우선순위 작업이 계속 밀리는 현상은 **기아(starvation)**다. 다음 Concept에서 에이징(aging)과 우선순위 부스트(priority boost) 같은 완화 방법을 다룬다.

반면 **우선순위 역전(priority inversion)**은 높은 우선순위 작업이 필요한 락이나 자원을 낮은 우선순위 작업이 보유해 간접적으로 기다리는 문제다. 이는 동기화와 자원 의존 관계가 핵심이므로 일반적인 스케줄링 기아와 같은 해결책으로 다루지 않는다.

우선순위 스케줄링의 핵심은 **우선순위가 CPU 실행 순서를 바꾸는 유용한 정책 정보인 동시에, 낮은 우선순위 작업의 진행 가능성과 공정성을 별도로 보완해야 하는 기준**이라는 점이다.
