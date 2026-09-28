---
kind: concept
contentKey: operating-systems.core.deadlock.resource-allocation-graph
topicContentKey: operating-systems.core.deadlock
slug: resource-allocation-graph
title: "자원 할당 그래프(Resource Allocation Graph)"
summary: "프로세스와 자원의 요청·할당 관계를 그래프로 나타내 순환 의존과 교착 가능성을 추적한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/7_Deadlocks.html"
    title: "Operating Systems: Deadlocks — UIC Course Notes"
    referenceType: COURSE
    language: en
    depth: section
    recommendation: "resource-allocation graph, safe state, Banker avoidance와 deadlock detection/recovery를 확인한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/10963"
    title: "스레드 덤프 분석하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "JVM thread dump에서 lock owner와 waiter를 연결해 deadlock cycle을 해석하는 실제 사례를 확인한다."
    displayOrder: 2
---
# 자원 할당 그래프(Resource Allocation Graph)

자원 할당 그래프는 **누가 어떤 자원을 요청하고, 어떤 자원이 누구에게 할당되어 있는지**를 방향 간선으로 표현해 교착 상태의 의존 관계를 추적하는 모델이다.

기본 간선은 다음처럼 읽는다.

```text
P ──request──> R
R ──allocated──> P
```

![요청 edge와 allocation edge로 만든 resource-allocation graph](/learning/operating-systems/resource-allocation-graph.svg)

예를 들어 다음 순환을 보자.

```text
R1 → P1 → R2 → P2 → R1
```

P1은 R1을 보유한 채 R2를 기다리고, P2는 R2를 보유한 채 R1을 기다린다.

### 자원 인스턴스 수에 따라 순환의 의미가 달라진다

R1과 R2가 각각 하나의 인스턴스뿐이라면 위 순환 안의 요청을 대신 만족시킬 다른 자원이 없으므로 교착 상태를 의미한다.

하지만 같은 자원 종류에 여러 인스턴스가 있다면 그래프에 순환이 있다고 해서 항상 교착 상태는 아니다. 다른 사용 가능한 인스턴스로 요청을 만족하거나 어떤 프로세스가 먼저 완료해 자원을 반환할 수 있기 때문이다.

따라서 다중 인스턴스 자원에서는 현재 할당 수량, 사용 가능한 자원, 각 프로세스의 남은 요청까지 함께 봐야 한다.

### 대기 그래프(Wait-for Graph)로 실행 주체 사이 의존만 남길 수도 있다

단일 인스턴스 모델에서는 자원 노드를 접어 `P1이 P2가 가진 자원을 기다린다`를 `P1 → P2`처럼 표현할 수 있다. 이 대기 그래프에서 순환을 찾으면 서로 기다리는 실행 주체 집합을 직접 볼 수 있다.

자원 할당 그래프의 핵심은 **소유자와 대기자의 관계를 그래프로 바꾸어 순환 의존을 눈에 보이게 만들고, 자원 인스턴스 수에 따라 순환의 의미를 정확히 해석하는 것**이다.
