---
kind: concept
contentKey: operating-systems.core.virtual-memory.thrashing
topicContentKey: operating-systems.core.virtual-memory
slug: thrashing
title: "스래싱(Thrashing)"
summary: "working set을 상주로 유지하지 못해 page fault와 I/O가 실행 자체를 압도하는 상태를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys-policy.pdf"
    title: "Beyond Physical 메모리: Policies"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "replacement policy와 locality가 hit/miss 및 working-set 유지에 미치는 영향을 확인한다."
    displayOrder: 1
---
# 스래싱(Thrashing)

Thrashing은 active working set을 physical 메모리에 안정적으로 유지하지 못해 **page를 가져오고 내보내는 작업이 실제 애플리케이션 실행보다 더 큰 비중을 차지하는 상태**다. Page fault가 존재한다는 사실만으로 thrashing이라고 부르지는 않는다.

![Working set을 담지 못해 eviction과 page fault가 반복되고 useful work가 줄어드는 thrashing loop](/learning/operating-systems/thrashing-loop.svg)

```text
working set > available frames
        ↓
active page eviction
        ↓
곧 다시 같은 page 필요
        ↓
page fault / page-in
        ↓
다른 active page eviction
        └──────── 반복
```

### 메모리 pressure가 심하면 useful work가 줄어든다

여러 프로세스가 서로의 active page를 계속 밀어내면 fault 처리와 저장소 I/O를 기다리는 시간이 늘어난다. CPU가 실제 애플리케이션 명령어을 실행하는 시간은 줄고 메모리-management work가 실행의 대부분을 차지할 수 있다.

이때 CPU utilization이 낮다는 사실만 보고 프로세스 수를 더 늘리면 working-set 총합이 더 커져 오히려 상황을 악화시킬 수 있다.

### Replacement 정책만으로 해결할 수 없는 이유

작업 집합(working set) 총합이 available physical 메모리보다 크게 부족하다면 희생 작업을 조금 더 잘 고르는 것만으로는 active page를 모두 유지할 수 없다. 이 경우에는 동시에 상주해야 하는 working set을 줄이거나, 동시에 실행하는 워크로드 수를 줄이거나, 메모리 용량 자체를 늘리는 식으로 수요와 용량 관계를 바꿔야 한다.

Thrashing의 핵심은 **fault 수가 많다는 현상 자체가 아니라, working set을 유지하지 못해 eviction과 fault가 서로를 반복시키면서 useful 실행이 크게 줄어드는 상태**라는 점이다.