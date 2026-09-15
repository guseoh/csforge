---
kind: concept
contentKey: computer-architecture.core.multicore-memory.false-sharing
topicContentKey: computer-architecture.core.multicore-memory
slug: false-sharing
title: "False Sharing"
summary: "논리적으로 독립적인 변수도 같은 cache line에서 write되면 coherence ownership이 이동해 성능 간섭이 생기는 이유를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
  - url: "https://www.kernel.org/doc/html/latest/kernel-hacking/false-sharing.html"
    title: "False Sharing — The Linux Kernel documentation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "서로 다른 field가 같은 cache line을 공유할 때 coherence contention이 생기는 사례와 탐지 방법을 확인한다."
    displayOrder: 2
---
# False Sharing

Thread A는 변수 A만, Thread B는 변수 B만 수정한다고 하자. 두 변수는 논리적으로 서로 독립적이므로 같은 값을 두 thread가 경쟁해서 수정하는 true sharing은 아니다.

하지만 두 변수가 **같은 cache line**에 놓여 있고 서로 다른 core가 반복해서 write한다면 hardware coherence는 field가 아니라 line 전체의 ownership을 조정한다.

```text
one cache line
[ counter A ][ counter B ]
     ↑             ↑
   core A        core B
```

Core A가 A를 쓰기 위해 line의 write ownership을 얻으면 Core B의 같은 line copy가 invalid될 수 있다. 곧이어 B가 B를 쓰려면 다시 ownership을 가져와야 한다. 값 사이에 data dependency는 없지만 line이 core 사이를 오가며 coherence traffic이 늘어난다. 이것이 false sharing이다.

### True sharing과 원인이 다르다

두 thread가 실제로 같은 counter 하나를 갱신한다면 그 값 자체를 공유하므로 synchronization과 serialization이 필요하다. 이것은 true sharing이다.

False sharing은 서로 다른 값을 수정하면서 physical layout 때문에 같은 coherence 단위를 경쟁하는 문제다. Correctness가 깨지는 것이 핵심이 아니라 **불필요한 ownership transfer로 처리량과 latency가 악화되는 것**이 핵심이다.

### Layout을 바꾸면 줄일 수 있지만 비용이 있다

자주 write되는 독립 data를 서로 다른 cache line에 배치하도록 padding하거나 per-thread/per-core state로 나누면 false sharing을 줄일 수 있다.

하지만 padding은 memory footprint를 늘리고, sharding한 state는 나중에 합치는 비용이 생긴다. 또한 실제 line size와 object layout에 따라 의도한 분리가 이루어지는지 확인해야 한다.

따라서 false sharing은 이름만 보고 padding부터 적용하는 문제가 아니다. 여러 core가 같은 line을 반복해서 write하고 있다는 evidence를 확인한 뒤 layout 변경 전후를 비교해야 한다.
