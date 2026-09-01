---
kind: concept
contentKey: dsa.core.complexity.invariant-correctness
topicContentKey: dsa.core.complexity
slug: invariant-correctness
title: "Invariant and Correctness"
summary: "precondition·invariant·progress·termination을 연결해 loop가 왜 정답을 만드는지 증명한다."
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

### 테스트가 많다고 알고리즘이 모든 입력에서 맞다는 증명이 되지는 않는다

알고리즘이 몇 개의 예제에서 원하는 결과를 냈다는 사실과 **정해진 입력 조건을 만족하는 모든 경우에 올바르다**는 주장은 다르다. 특히 loop는 같은 code가 여러 번 실행되고 각 반복에서 state가 바뀌기 때문에, 현재까지 무엇이 확실히 참인지 정하지 않으면 경계 조건을 놓치기 쉽다.

Invariant는 알고리즘이 진행되는 특정 지점마다 계속 참이어야 하는 성질이다. Loop invariant는 보통 loop guard를 확인하는 시점처럼 반복의 경계에서 참인 명제로 잡는다.

Correctness argument는 크게 다음 질문으로 나눌 수 있다.

1. **초기화(Initialization)**: loop 시작 전에 invariant가 참인가?
2. **유지(Maintenance)**: invariant가 참인 상태에서 loop body를 한 번 실행하면 다시 참이 되는가?
3. **진행(Progress)**: 매 반복이 종료 조건 쪽으로 실제로 나아가는가?
4. **종료와 결과(Termination/Postcondition)**: loop가 끝났을 때 invariant와 종료 조건을 합치면 원하는 결과가 따라오는가?

앞의 세 단계만 대충 확인하고 progress를 빼먹으면 결과는 맞더라도 무한 loop에 빠질 수 있다. 그래서 '결과가 맞다'와 '결국 종료한다'를 함께 보는 것이 중요하다.

### Binary search의 구간 invariant를 따라가 보자

정렬된 배열에서 target의 lower bound, 즉 `target 이상인 첫 위치`를 찾는 다음 형태를 생각해 보자.

```text
left = 0
right = n          // [left, right)

while left < right:
    mid = left + (right - left) / 2
    if a[mid] < target:
        left = mid + 1
    else:
        right = mid
```

여기서는 다음처럼 invariant를 잡을 수 있다.

```text
[0, left)     : target보다 작다는 것이 이미 확인된 영역
[right, n)    : target 이상이라는 것이 이미 확인된 영역
[left, right) : 아직 답 후보가 남아 있는 영역
```

처음에는 `left=0`, `right=n`이므로 확정된 양쪽 영역이 비어 있고 모든 index가 후보라 invariant가 성립한다.

`a[mid] < target`이면 `mid`와 그 왼쪽은 lower bound가 될 수 없다. 따라서 `left = mid + 1`로 버려도 invariant가 유지된다. 반대로 `a[mid] >= target`이면 `mid`는 여전히 답일 수 있으므로 `right = mid`로 남겨야 한다. 여기서 실수로 `right = mid - 1`을 쓰면 후보인 `mid` 자체를 버릴 수 있다.

### 종료 조건이 답을 만드는 이유

매 반복에서 `[left, right)` 길이는 줄어든다. 결국 `left == right`가 되면 아직 미확정인 후보 구간이 비게 된다.

그 시점의 invariant는 다음을 말한다.

- `left`보다 작은 index는 모두 target보다 작다.
- `right(=left)` 이후는 target 이상 영역이다.

따라서 `left`가 target 이상인 첫 위치가 된다. 코드 한 줄 한 줄을 외우는 대신 invariant를 잡으면 왜 `mid+1`과 `mid`를 쓰는지 설명할 수 있다.

### 자료구조 invariant도 같은 방식으로 operation을 검증한다

Invariant는 loop에만 쓰이지 않는다. Heap에서는 부모 priority가 자식보다 앞선다는 조건, doubly linked list에서는 `node.next.prev == node` 같은 link consistency, Union-Find에서는 parent pointer가 root로 이어진다는 구조적 조건이 operation 전후에 유지되어야 한다.

예를 들어 linked list 삭제가 target node를 list에서 제거했더라도 `prev.next`만 수정하고 `next.prev`를 갱신하지 않았다면 자료구조 invariant가 깨진다. 당장 한 번의 조회가 성공해도 다음 reverse traversal이나 삭제에서 실패할 수 있다.

### 좋은 테스트는 invariant가 깨질 법한 경계를 찌른다

Proof와 test는 경쟁 관계가 아니다. Invariant로 왜 맞는지 reasoning하고, test에서는 그 invariant가 깨지기 쉬운 상태를 구체적으로 만든다.

Binary search라면 빈 배열, 길이 1, target이 최소/최대보다 작은 경우, 중복값의 lower/upper bound가 중요하다. 자료구조라면 empty→one element→many elements→empty 전이를 확인한다.

Backend에서도 pagination cursor, dedup set, import upsert처럼 상태가 반복적으로 변하는 로직은 '어떤 상태가 항상 참이어야 하는가'를 먼저 적으면 test case와 장애 원인을 훨씬 구체적으로 만들 수 있다.
