---
kind: concept
contentKey: operating-systems.core.deadlock.livelock
topicContentKey: operating-systems.core.deadlock
slug: livelock
title: "라이브락(Livelock)"
summary: "실행은 계속 움직이지만 서로의 반응 때문에 유효한 work가 완료되지 않는 livelock을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
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
# 라이브락(Livelock)

Livelock에서는 실행 흐름이 blocked 상태로 멈춰 있지 않다. 계속 재시도하거나 양보하고 상태도 바뀌지만, **서로의 반응이 반복되면서 실제 목표 작업은 완료되지 않는다.**

두 워커가 충돌할 때마다 둘 다 즉시 물러났다가 같은 timing으로 다시 시도한다고 하자.

```text
time →
W1: conflict → retry → conflict → retry → ...
W2: conflict → retry → conflict → retry → ...

useful completion = 0
```

CPU activity와 상태 변화는 계속 보이지만 유효한 진행가 없다.

### 같은 반응을 반복하면 충돌도 반복될 수 있다

여러 실행 흐름이 실패할 때마다 같은 시점과 같은 방식으로 다시 시도하면 처음의 충돌 패턴이 그대로 재생될 수 있다. Backoff나 jitter처럼 재시도 시점을 다르게 만드는 방법은 이런 symmetry를 깨 한쪽이 먼저 진행할 가능성을 높일 수 있다.

### Deadlock과는 activity가 다르다

| 상태 | 실행 activity | useful 진행 |
| --- | --- | --- |
| Deadlock | 서로 기다리며 멈춤 | 없음 |
| Livelock | 재시도·상태 변경이 계속됨 | 없음 또는 매우 낮음 |
| 정상 재시도 | 일시적 재시도 | 결국 완료 또는 실패 |

Livelock의 핵심은 **실행이 계속 움직인다는 사실과 시스템이 실제 목표를 향해 진행한다는 사실은 다르다는 점**이다.