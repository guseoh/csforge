---
kind: concept
contentKey: operating-systems.core.threads.thread-count-workload
topicContentKey: operating-systems.core.threads
slug: thread-count-workload
title: "Thread Count·Workload"
summary: "CPU-bound·blocking workload과 downstream capacity로 적정 thread 수를 추론한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# Thread Count·Workload

적절한 thread 수는 하나의 공식으로 정할 수 없다. **CPU를 계속 사용하는 작업인지, 자주 blocking되는 작업인지**에 따라 runnable thread가 실제 CPU를 사용하는 방식이 달라지기 때문이다.

### CPU-bound workload에서는 core 수가 실제 parallelism을 제한한다

4-core CPU에서 대부분의 시간을 계산에 쓰는 workload라면 runnable thread를 4개에서 40개로 늘려도 같은 순간 계산할 수 있는 core는 여전히 제한적이다. 추가 thread는 CPU를 더 만들지 않고 ready queue와 context-switch 비용을 늘릴 수 있다.

```text
CPU-bound
active runnable threads ↑
       │
       ├─ core가 남아 있음 → parallelism 활용 가능
       └─ core가 이미 포화 → queue / switch 증가 가능
```

### Blocking workload에서는 더 많은 concurrency가 유리할 수 있다

한 thread가 CPU를 잠깐 사용한 뒤 I/O completion을 오래 기다린다면, 기다리는 동안 다른 runnable thread가 CPU를 사용할 수 있다. 그래서 blocking 비율이 높은 workload에서는 CPU core 수보다 많은 thread가 유용할 수 있다.

하지만 thread 수를 무한히 늘릴 수는 없다. 각 thread의 stack과 metadata가 memory를 사용하고, runnable thread가 많아지면 scheduling 비용도 커진다. 또한 실제 work가 file descriptor, connection, device queue 같은 다른 제한된 resource를 필요로 한다면 그 resource가 새로운 상한이 된다.

### 핵심은 동시에 필요한 실행 자원과 대기 비율을 함께 보는 것이다

CPU-bound인지 I/O-bound인지 한 단어로만 분류하기보다 다음을 본다.

- 실제 on-CPU 시간과 waiting 시간의 비율
- 동시에 runnable한 thread 수
- CPU core와 현재 utilization
- thread가 기다리는 OS/resource 경계

Thread Count and Workload의 핵심은 **CPU-bound에서는 과도한 runnable thread가 scheduling 비용을 키울 수 있고, blocking workload에서는 waiting 시간을 다른 work로 겹치기 위해 더 많은 concurrency가 필요할 수 있다는 trade-off**다.