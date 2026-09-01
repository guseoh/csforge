---
kind: concept
contentKey: dsa.core.graph.graph-model
topicContentKey: dsa.core.graph
slug: graph-model
title: "Graph Model"
summary: "vertex와 edge의 방향·가중치·중복 허용 여부로 관계 문제를 정확히 모델링한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "vertex, edge, path, connectivity 같은 graph 기본 모델을 확인한다."
    displayOrder: 1
---
# Graph Model

### 관계를 어떤 방향으로 표현하느냐가 알고리즘을 바꾼다

Graph는 독립적으로 식별할 대상을 vertex로, 대상 사이의 관계를 edge로 표현한다. 중요한 점은 실제 세계의 관계를 graph로 옮기는 순간 **방향, 가중치, 중복 edge, self-loop 허용 여부**를 명시해야 한다는 것이다. 같은 데이터를 두고도 모델링이 달라지면 사용할 수 있는 알고리즘과 결과 의미가 달라진다.

예를 들어 `A 과목을 배우기 전에 B를 알아야 한다`는 관계를 표현할 때 `B -> A`를 "B가 A의 prerequisite"로 정의할 수 있다. 반대로 `A -> B`를 "A가 B에 의존"으로 정의할 수도 있다. 둘 다 표현은 가능하지만 topological sort 결과를 해석하는 방향은 정반대다. edge 의미를 문서화하지 않으면 알고리즘은 맞아도 업무 결과가 틀릴 수 있다.

### Directed, Undirected, Weighted

Undirected graph의 edge `u-v`는 양방향 관계다. 친구 관계나 물리적으로 연결된 네트워크처럼 두 방향의 연결성이 같은 의미일 때 적합하다.

Directed graph의 `u -> v`는 방향이 있다. prerequisite, build dependency, hyperlink처럼 방향에 따라 의미가 달라질 때 사용한다.

Weighted graph에서는 edge에 거리·시간·비용 같은 값을 둔다. 이때 weight가 음수가 가능한지 여부까지 알고리즘 계약에 포함된다. Dijkstra가 모든 weighted graph에 적용되는 것이 아니라 non-negative edge weight를 전제로 하는 이유도 이 모델 단계에서 결정된다.

### Path와 Reachability

Path는 edge를 따라 이어지는 vertex sequence다. Directed graph에서는 edge 방향을 따라가야 하므로 `A`에서 `B`로 갈 수 있다고 `B`에서 `A`로도 갈 수 있는 것은 아니다.

따라서 "연결되어 있다"는 표현도 graph 종류에 따라 다르다. Undirected graph에서는 connected component를 말할 수 있지만 directed graph에서는 weak connectivity와 strong connectivity를 구분해야 한다.

### 중복 edge와 self-loop도 계약이다

두 vertex 사이에 edge가 여러 개 존재할 수 있는 multigraph인지, 하나만 허용하는 simple graph인지 정해야 한다. Weighted transport graph라면 같은 두 도시 사이의 여러 노선을 별도 edge로 보존할 수 있지만 prerequisite relation이라면 동일 관계를 중복 저장할 필요가 없을 수 있다.

Self-loop도 마찬가지다. `A -> A`가 유효한 도메인도 있지만 prerequisite graph에서는 즉시 cycle을 의미할 수 있다.

### 모델링 오류는 알고리즘 오류와 다르다

BFS나 DFS 구현이 완벽해도 vertex와 edge 정의가 잘못되면 결과는 틀린다. 예를 들어 "서비스가 의존하는 대상"과 "서비스를 의존하는 대상"을 같은 edge 방향으로 혼용하면 배포 순서와 영향 분석 결과가 서로 모순된다.

그래서 graph 문제를 풀 때는 알고리즘부터 고르기 전에 다음을 먼저 적는 편이 안전하다.

```text
vertex는 무엇인가?
edge u -> v는 정확히 무엇을 뜻하는가?
weight는 무엇이며 음수가 가능한가?
중복 edge와 self-loop를 허용하는가?
찾고 싶은 것은 reachability, shortest path, ordering 중 무엇인가?
```

이 정의가 잡힌 뒤에야 BFS, DFS, topological sort, shortest path 같은 알고리즘 선택이 의미를 가진다.
