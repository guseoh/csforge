---
kind: concept
contentKey: dsa.core.complexity.invariant-correctness
topicContentKey: dsa.core.complexity
slug: invariant-correctness
title: "Invariant and Correctness"
summary: "loop invariant의 초기화·유지·종료 조건을 연결해 알고리즘이 왜 올바른 결과를 만드는지 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://courses.cis.cornell.edu/courses/cs2110/2026sp/lectures/lec04/"
    title: "Cornell CS 2110: Loop Invariants"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "loop invariant의 initialization, maintenance, progress와 termination reasoning을 확인한다."
    displayOrder: 1
---
# Invariant and Correctness

몇 개의 test case에서 원하는 결과가 나왔다는 사실만으로 알고리즘이 가능한 모든 입력에서 올바르다고 증명되지는 않는다. 알고리즘이 반복해서 state를 바꿀 때 **각 단계에서도 계속 참이어야 하는 성질**을 잡으면 왜 최종 결과가 맞는지 구조적으로 설명할 수 있다. 이런 성질을 invariant라고 한다.

Loop invariant를 이용한 correctness argument는 보통 세 단계로 본다.

1. **Initialization**: loop가 시작되기 전에 invariant가 참인가?
2. **Maintenance**: 한 번의 반복이 invariant를 깨뜨리지 않는가?
3. **Termination**: loop가 끝났을 때 invariant와 종료 조건으로 원하는 결과를 얻을 수 있는가?

Loop가 실제로 종료 조건에 가까워지는지도 함께 확인해야 한다. Invariant가 유지되어도 상태가 전혀 줄어들지 않으면 무한 반복이 될 수 있기 때문이다.

예를 들어 lower bound를 찾는 binary search에서 후보 구간을 `[left, right)`로 두고 다음 invariant를 유지할 수 있다.

```text
[0, left)  : target보다 작은 것이 확인된 영역
[left, right) : 아직 답 후보인 영역
[right, n) : target 이상인 것이 확인된 영역
```

`a[mid] < target`이면 `mid`까지 답이 될 수 없으므로 `left = mid + 1`로 제거한다. 반대로 `a[mid] >= target`이면 `mid`가 답일 가능성이 남으므로 `right = mid`로 둔다. 매 반복마다 후보 구간이 줄고 결국 `left == right`가 되면 그 위치가 lower bound가 된다.

Invariant는 loop에만 쓰이지 않는다. Heap의 parent-child priority 관계, doubly linked list의 양방향 link 관계처럼 자료구조 operation 전후에 항상 유지되어야 하는 조건도 invariant다. **알고리즘을 외우기보다 어떤 상태가 항상 참이어야 하는지를 찾는 것이 correctness reasoning의 핵심**이다.
