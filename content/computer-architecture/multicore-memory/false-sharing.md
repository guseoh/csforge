---
kind: concept
contentKey: computer-architecture.core.multicore-memory.false-sharing
topicContentKey: computer-architecture.core.multicore-memory
slug: false-sharing
title: "거짓 공유(False Sharing)"
summary: "논리적으로 독립적인 변수도 같은 캐시 라인에서 쓰기가 반복되면 소유권 이동 때문에 성능 간섭이 생기는 이유를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "multicore cache sharing, coherence protocol, false sharing과 shared-memory ordering 경계를 확인한다."
    displayOrder: 1
  - url: "https://www.kernel.org/doc/html/latest/kernel-hacking/false-sharing.html"
    title: "False Sharing — The Linux Kernel documentation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "서로 다른 field가 같은 cache line을 공유할 때 coherence contention이 생기는 사례와 탐지 방법을 확인한다."
    displayOrder: 2
---
# 거짓 공유(False Sharing)

스레드 A는 변수 A만, 스레드 B는 변수 B만 수정한다고 하자. 두 변수는 논리적으로 서로 독립적이므로 같은 값을 두 스레드가 경쟁해서 수정하는 진짜 공유(true sharing)는 아니다.

하지만 두 변수가 **같은 캐시 라인**에 놓여 있고 서로 다른 코어가 반복해서 쓰기를 수행한다면 하드웨어 캐시 일관성은 필드가 아니라 라인 전체의 소유권을 조정한다.

```text
one cache line
[ counter A ][ counter B ]
     ↑             ↑
   core A        core B
```

Core A가 A를 쓰기 위해 라인의 쓰기 소유권을 얻으면 Core B의 같은 라인 복사본이 무효화될 수 있다. 곧이어 B가 B를 쓰려면 다시 소유권을 가져와야 한다. 값 사이에 데이터 의존성은 없지만 라인이 코어 사이를 오가며 캐시 일관성 트래픽이 늘어난다. 이것이 거짓 공유다.

### 진짜 공유와 원인이 다르다

두 스레드가 실제로 같은 카운터 하나를 갱신한다면 그 값 자체를 공유하므로 동기화와 직렬화가 필요하다. 이것은 진짜 공유다.

거짓 공유는 서로 다른 값을 수정하면서 물리적 배치 때문에 같은 캐시 일관성 단위를 경쟁하는 문제다. 정확성이 깨지는 것이 핵심이 아니라 **불필요한 소유권 이동으로 처리량과 지연 시간이 악화되는 것**이 핵심이다.

### 배치를 바꾸면 줄일 수 있지만 비용이 있다

자주 쓰기가 발생하는 독립 데이터를 서로 다른 캐시 라인에 배치하도록 padding하거나 스레드별·코어별 상태로 나누면 거짓 공유를 줄일 수 있다.

하지만 padding은 메모리 사용량을 늘리고, 분할한 상태는 나중에 합치는 비용이 생긴다. 또한 실제 라인 크기와 객체 배치에 따라 의도한 분리가 이루어지는지 확인해야 한다.

따라서 거짓 공유는 이름만 보고 padding부터 적용하는 문제가 아니다. 여러 코어가 같은 라인을 반복해서 쓰고 있다는 근거를 확인한 뒤 배치 변경 전후를 비교해야 한다.
