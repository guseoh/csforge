---
kind: concept
contentKey: dsa.core.stack-queue-deque.stack
topicContentKey: dsa.core.stack-queue-deque
slug: stack
title: "Stack"
summary: "LIFO invariant가 최근 상태의 저장·복원과 backtracking을 가능하게 하는 원리를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "stack의 LIFO operation과 array/linked implementation trade-off를 확인한다."
    displayOrder: 1
---
# Stack

### 가장 최근에 들어온 상태를 먼저 되돌린다

stack은 `push`로 top에 원소를 추가하고 `pop`으로 top 원소를 제거하는 LIFO 구조다. 아래에서부터 먼저 들어온 원소는 그 위의 원소가 모두 제거되기 전에는 나오지 않는다.

```text
push A
push B
push C

bottom [A, B, C] top
pop → C
pop → B
```

이 순서는 최근 선택을 먼저 취소하거나, 아직 끝나지 않은 작업의 이전 상태로 돌아가는 문제와 잘 맞는다.

### top은 현재 접근 가능한 경계를 나타낸다

array stack이라면 top index 또는 size가 현재 live range를 나타낸다. push는 새 위치에 값을 쓰고 top을 증가시키며, pop은 현재 top 값을 읽고 감소시킨다. empty 상태에서 pop/peek하면 valid element가 없으므로 error 또는 sentinel contract가 필요하다.

중요한 invariant는 다음처럼 잡을 수 있다.

```text
[0, size) 는 현재 stack 원소
size == 0 이면 empty
다음 pop 대상은 index size-1
```

### 괄호 검사와 DFS에서 stack이 자연스러운 이유

`([{}])` 같은 괄호를 검사할 때 opening bracket을 push하고 closing bracket을 만나면 가장 최근 opening bracket과 짝을 맞춰야 한다. nested 구조에서는 마지막에 연 괄호가 먼저 닫혀야 하므로 LIFO가 문제 자체의 구조다.

DFS의 iterative 구현도 아직 탐색할 node를 stack에 두어 가장 최근에 발견한 경로를 먼저 깊게 따라간다. recursion을 쓰면 runtime call stack이 이 state를 대신 저장한다.

### array와 linked implementation의 비용이 다르다

array stack은 contiguous memory와 낮은 pointer overhead가 장점이지만 capacity growth가 필요할 수 있다. linked stack은 node 추가로 capacity를 자연스럽게 늘리지만 node allocation과 pointer chasing 비용이 생긴다.

둘 다 abstract operation은 push/pop O(1)을 기대할 수 있지만 실제 locality, allocation, resize tail latency는 다르다.

### application stack과 call stack은 같은 추상어지만 같은 resource가 아니다

parser가 직접 `Stack<Node>`를 사용하는 것과 recursive call이 OS/JVM thread stack frame을 소비하는 것은 다른 메모리 자원이다. 깊은 nested input에서 둘 다 depth 문제를 만들 수 있지만 limit과 failure mode는 다르다.

untrusted input을 처리한다면 최대 nesting depth를 먼저 제한하고, recursion과 explicit stack 중 어느 방식이 failure를 더 제어하기 쉬운지도 판단해야 한다.
