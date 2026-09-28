---
kind: concept
contentKey: operating-systems.core.synchronization.contention
topicContentKey: operating-systems.core.synchronization
slug: contention
title: "잠금 경합(Lock Contention)"
summary: "여러 실행 흐름이 같은 동기화 지점을 경쟁할 때 대기열과 처리량이 악화되는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf"
    title: "Operating Systems: Three Easy Pieces — Locks"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "mutex/lock이 atomic primitive를 이용해 critical section의 mutual exclusion을 구현하는 방식을 확인한다."
    displayOrder: 1
  - url: "https://toss.tech/article/engineering-note-3"
    title: "Feign 코드 분석과 서버 성능 개선"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "실제 서버에서 lock contention을 추적하고 임계 구간을 줄여 성능을 개선한 사례를 확인한다."
    displayOrder: 2
---
# 잠금 경합(Lock Contention)

동기화 도구가 존재한다고 해서 항상 성능 문제가 생기는 것은 아니다. **경합(contention)은 여러 실행 흐름이 같은 제한된 동기화 자원을 동시에 원해 실제 대기·바쁜 대기·재시도가 발생하는 상태**다.

![동일 lock을 두고 waiter가 쌓이는 contention 흐름](/learning/operating-systems/contention-queue.svg)

### 락 보유 시간과 경쟁자가 늘면 기다림도 커진다

한 번에 하나만 통과할 수 있는 락에서 소유자가 오래 머물수록 다음 대기자의 대기 시간이 길어진다. 그 사이 경쟁자가 계속 도착하면 대기열이 쌓인다.

```text
waiters ──▶ [W3] [W2] [W1] ──▶ [LOCK OWNER]
                                      │
                                  hold time
```

임계 구역이 짧고 경쟁이 드물다면 락 자체의 비용은 작을 수 있다. 반대로 같은 락을 원하는 스레드가 많거나 락 보유 시간이 길면 직렬 구간이 전체 처리량을 제한하는 병목이 될 수 있다.

### 기다리는 방식도 비용에 영향을 준다

바쁜 대기를 하는 스레드는 락이 풀릴 때까지 CPU를 사용하고, 블로킹된 대기자는 CPU를 양보하는 대신 수면·깨우기와 스케줄링 비용을 지불한다. 따라서 경합 비용은 단순히 대기자 수 하나로 결정되지 않고 대기 시간과 대기 방식에 따라 달라진다.

명시적인 뮤텍스가 없어도 여러 CPU가 같은 원자적 상태를 계속 갱신하면 재시도와 캐시 라인 소유권 경쟁이 생길 수 있다. 즉 **lock-free와 contention-free는 같은 말이 아니다.**

### 줄여야 하는 것은 실제 직렬화 지점이다

경합을 줄이려면 임계 구역을 줄이거나, 독립 가능한 상태를 여러 락 영역으로 나누거나, 공유 갱신 자체를 줄이는 방법을 생각할 수 있다. 하지만 락을 무작정 더 잘게 나누면 정확성 추론과 교착 상태 복잡도가 증가할 수 있다.

잠금 경합의 핵심은 **여러 실행 흐름이 같은 동기화 지점을 경쟁하면서 대기와 직렬화 비용이 생기는 과정을 이해하고, 실제 병목이 되는 직렬화 지점을 기준으로 잠금 세분성과 동기화 규칙을 조정하는 것**이다.
