---
kind: concept
contentKey: operating-systems.core.virtual-memory.thrashing
topicContentKey: operating-systems.core.virtual-memory
slug: thrashing
title: "스래싱(Thrashing)"
summary: "작업 집합을 메모리에 유지하지 못해 페이지 폴트와 I/O가 실제 실행을 압도하는 상태를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys-policy.pdf"
    title: "Beyond Physical Memory: Policies"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "replacement policy와 locality가 hit/miss 및 working-set 유지에 미치는 영향을 확인한다."
    displayOrder: 1
---
# 스래싱(Thrashing)

스래싱은 현재 작업 집합을 물리 메모리에 안정적으로 유지하지 못해 **페이지를 가져오고 내보내는 작업이 실제 애플리케이션 실행보다 더 큰 비중을 차지하는 상태**다. 페이지 폴트가 존재한다는 사실만으로 스래싱이라고 부르지는 않는다.

![작업 집합을 담지 못해 페이지 내보내기와 페이지 폴트가 반복되고 유효한 작업이 줄어드는 스래싱 순환](/learning/operating-systems/thrashing-loop.svg)

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

### 메모리 압박이 심하면 유효한 작업이 줄어든다

여러 프로세스가 서로의 활발한 페이지를 계속 밀어내면 페이지 폴트 처리와 저장 장치 I/O를 기다리는 시간이 늘어난다. CPU가 실제 애플리케이션 명령을 실행하는 시간은 줄고 메모리 관리 작업이 실행의 큰 부분을 차지할 수 있다.

이때 CPU 활용률이 낮다는 사실만 보고 프로세스 수를 더 늘리면 전체 작업 집합의 합이 더 커져 오히려 상황을 악화시킬 수 있다.

### 페이지 교체 정책만으로 해결할 수 없는 이유

동시에 필요한 작업 집합의 총합이 사용 가능한 물리 메모리보다 훨씬 크다면 교체 대상을 조금 더 잘 고르는 것만으로는 필요한 페이지를 모두 유지할 수 없다. 이 경우에는 동시에 상주시켜야 하는 작업 집합을 줄이거나, 동시에 실행하는 작업 부하 수를 줄이거나, 메모리 용량 자체를 늘리는 식으로 수요와 용량의 관계를 바꿔야 한다.

스래싱의 핵심은 **페이지 폴트 수가 많다는 현상 자체가 아니라, 작업 집합을 유지하지 못해 페이지 내보내기와 폴트가 서로를 반복시키면서 유효한 실행이 크게 줄어드는 상태**라는 점이다.