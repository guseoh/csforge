---
kind: concept
contentKey: operating-systems.core.virtual-memory.locality-working-set
topicContentKey: operating-systems.core.virtual-memory
slug: locality-working-set
title: "지역성과 작업 집합(지역성 and 작업 집합(working set))"
summary: "최근 실제로 반복 사용하는 page 집합이 상주 프레임 요구량과 fault rate를 결정하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys-policy.pdf"
    title: "Beyond Physical 메모리: Policies"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "replacement policy와 locality가 hit/miss 및 working-set 유지에 미치는 영향을 확인한다."
    displayOrder: 1
---
# 지역성과 작업 집합(지역성 and 작업 집합(working set))

프로그램은 전체 address space를 항상 균등하게 사용하지 않는다. 반복문에서 같은 코드/data를 다시 사용하거나 인접한 메모리를 연속으로 접근하는 것처럼, 일정 시간 동안 특정 page 집합에 접근이 집중되는 경우가 많다.

Working set은 **현재 실행 구간에서 활발하게 사용되는 page 집합**으로 생각할 수 있다.

```text
최근 reference:
1, 2, 3, 2, 1, 3

active working set ≈ {1, 2, 3}
```

세 page를 모두 상주로 유지할 프레임이 있다면 warm-up 이후에는 같은 page를 반복 사용하면서 fault가 크게 줄 수 있다.

### 프로그램 phase가 바뀌면 working set도 바뀐다

초기화 단계와 실제 계산 단계가 서로 다른 data를 사용한다면 active page 집합도 달라진다. 따라서 working set은 프로세스 전체 수명에 고정된 하나의 숫자라기보다 **시간에 따라 변하는 현재의 메모리 demand**다.

### 상주 프레임이 부족하면 active page끼리 서로 밀어낸다

현재 working set이 5 page인데 실질적으로 사용할 수 있는 프레임이 3개뿐이라면 replacement가 일어날 때마다 아직 필요한 page를 내보낼 가능성이 높다.

```text
working set: {1, 2, 3, 4, 5}
frames:      [ ][ ][ ]

active page를 적재
→ 다른 active page eviction
→ 곧 다시 필요
→ page fault 반복
```

지역성·Working Set의 핵심은 **최근 반복해서 사용하는 page 집합을 상주로 유지할 수 있는지가 page-fault rate를 크게 좌우하며, 작업 집합(working set) 크기와 available 메모리의 관계가 replacement 정책보다 더 근본적인 제약이 될 수 있다는 점**이다.