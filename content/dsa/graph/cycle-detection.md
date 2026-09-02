---
kind: concept
contentKey: dsa.core.graph.cycle-detection
topicContentKey: dsa.core.graph
slug: cycle-detection
title: "Cycle Detection"
summary: "undirected parent edge와 directed DFS state를 구분해 cycle을 판정한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/42digraph/"
    title: "Algorithms, 4th Edition: Directed Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "DAG, cycle과 topological ordering의 관계를 확인한다."
    displayOrder: 1
---
# Cycle Detection

### Cycle은 graph 종류에 따라 판정 방법이 다르다

Cycle은 어떤 vertex에서 edge를 따라 출발해 다시 같은 vertex로 돌아오는 경로다. 하지만 undirected graph와 directed graph에서는 이미 방문한 vertex를 다시 만났을 때의 의미가 다르다.

Undirected graph에서 DFS로 `u -> v`를 따라왔다면 `v`의 adjacency에는 다시 `u`가 보인다. 이것은 단순히 같은 undirected edge의 반대 방향 표현일 뿐 cycle이 아니다. 따라서 parent edge를 제외하고 **이미 방문한 다른 neighbor**를 만났을 때 cycle을 의심한다.

```text
A -- B
|    |
D -- C
```

A → B → C → D까지 내려간 뒤 D에서 이미 방문한 A를 만나고 A가 parent가 아니므로 cycle이 존재한다.

### Directed graph에서는 visited 하나로 부족하다

Directed graph에서는 이미 방문한 vertex를 다시 본다고 항상 cycle은 아니다.

```text
A -> B -> D
 \-> C -> D
```

C에서 D를 볼 때 D가 이미 다른 branch에서 처리되었더라도 `D -> ... -> C`로 돌아오는 path가 없다면 cycle이 아니다. 그래서 DFS 상태를 최소 세 단계로 구분한다.

```text
UNVISITED
IN_PROGRESS  현재 recursion path 안
FINISHED     descendant 처리 완료
```

현재 `IN_PROGRESS` 상태인 vertex로 향하는 edge를 만나면 **현재 DFS path의 ancestor로 돌아가는 back edge**이므로 directed cycle이다.

### 왜 current path가 중요한가

Cycle 판정의 핵심은 "전에 본 적이 있는가"가 아니라 **현재 탐색 경로로 다시 돌아왔는가**다. `FINISHED` vertex는 이미 해당 subtree 탐색이 끝났으므로 그 vertex를 가리키는 것만으로 현재 path가 닫힌 cycle이 되지는 않는다.

이 구분을 생략하면 DAG의 정상적인 cross edge를 cycle로 잘못 판정할 수 있다.

### Cycle path를 복원하면 오류를 수정하기 쉽다

단순 boolean 결과보다 실제 cycle 경로를 알려주는 편이 운영과 검증에 유용하다. DFS parent나 current stack을 보존하면 back edge `C -> A`를 발견했을 때 다음처럼 복원할 수 있다.

```text
A -> B -> C -> A
```

Prerequisite import validation에서 "cycle이 있습니다"만 반환하는 것보다 어떤 key들이 cycle을 만드는지 보여주는 것이 훨씬 수정하기 쉽다.

### Topological sort와의 관계

Directed graph에 cycle이 있으면 모든 edge `u -> v`에 대해 u가 v보다 앞에 오는 linear ordering을 만들 수 없다. 따라서 topological sort는 cycle detection과 직접 연결된다.

Kahn 알고리즘에서는 모든 vertex를 제거하지 못하고 indegree가 남는 것이 cycle의 증거가 되고, DFS 방식에서는 `IN_PROGRESS` vertex로 돌아가는 back edge가 cycle의 증거가 된다.

### Domain validation에서의 태도

Cycle이 허용되지 않는 canonical prerequisite graph라면 임의로 edge 하나를 삭제해 결과를 "수정"하면 안 된다. Validation은 cycle 경로를 정확히 보고하고 Apply를 차단해야 한다. 어떤 relation을 제거할지는 authoring decision이다.
