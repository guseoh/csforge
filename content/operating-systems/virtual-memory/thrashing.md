---
kind: concept
contentKey: operating-systems.core.virtual-memory.thrashing
topicContentKey: operating-systems.core.virtual-memory
slug: thrashing
title: "Thrashing"
summary: "working set을 resident로 유지하지 못해 page fault와 I/O가 실행 자체를 압도하는 상태를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys-policy.pdf"
    title: "Beyond Physical Memory: Policies"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "replacement policy와 locality가 hit/miss 및 working-set 유지에 미치는 영향을 확인한다."
    displayOrder: 1
---
# Thrashing

thrashing은 process들의 active working set을 physical memory에 안정적으로 유지할 수 없어 **page를 가져오고 내보내는 작업이 실제 application 실행보다 더 큰 비중을 차지하는 상태**다. 단순히 page fault가 존재한다고 thrashing인 것은 아니다. fault가 매우 자주 발생하고 그 처리 때문에 CPU가 useful work를 하지 못하며 storage I/O와 reclaim이 반복되는 상황을 함께 봐야 한다.

### 왜 메모리가 부족하면 CPU 사용률까지 떨어질 수 있는가

process A가 page를 요청하면서 B가 곧 사용할 page를 eviction하고, B가 다시 그 page를 요청하면서 A의 active page를 밀어낸다고 하자. 둘 다 fault 처리와 I/O를 기다리는 시간이 길어지면 runnable work가 줄어 CPU utilization이 낮아질 수 있다. 이때 `CPU가 한가하니 process를 더 늘리자`고 판단하면 working-set 총합을 더 키워 상황을 악화시킬 수 있다.

전형적인 신호는 다음처럼 함께 나타난다.

`resident pressure 증가 → eviction 증가 → page fault 증가 → page-in/write-back 증가 → useful CPU work 감소`

### replacement policy만 바꿔서는 해결되지 않는 경우

working set 자체가 available memory보다 훨씬 크면 LRU 근사나 CLOCK을 더 정교하게 만들어도 모든 active page를 유지할 수 없다. 이 경우 동시 process 수나 in-flight batch를 줄이는 admission control, application working set 축소, memory 증설처럼 **수요와 capacity의 관계**를 바꿔야 한다.

### JVM/container 환경에서의 해석

container memory limit 안에서는 JVM heap, native allocation, thread stack, direct buffer, file-backed page가 같은 physical-memory pressure에 영향을 줄 수 있다. heap을 크게 잡아 GC 여유를 얻은 대신 OS page cache가 계속 reclaim되면 file I/O latency가 악화될 수 있다. 반대로 page cache만 의심하면서 실제 heap leak을 놓쳐서도 안 된다.

따라서 thrashing을 진단할 때 CPU, RSS 한 지표만 보지 않고 major/minor fault, reclaim, swap/page-in, storage latency, working-set 크기와 concurrency 변화를 시간축으로 함께 본다.
