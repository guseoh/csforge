---
kind: concept
contentKey: operating-systems.core.deadlock.resource-allocation-graph
topicContentKey: operating-systems.core.deadlock
slug: resource-allocation-graph
title: "자원 할당 그래프(자원 할당 그래프)"
summary: "프로세스-자원 요청·할당 edge를 이용해 의존 관계 순환과 deadlock 가능성을 추적한다."
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
# 자원 할당 그래프(자원 할당 그래프)

자원-할당 graph는 **누가 어떤 자원를 요청하고, 어떤 자원가 누구에게 할당되어 있는지**를 방향 있는 edge로 표현해 deadlock 의존 관계를 추적하는 모델이다.

기본 edge는 다음처럼 읽는다.

```text
P ──request──> R
R ──allocated──> P
```

![요청 edge와 할당 edge로 만든 자원 할당 그래프](/learning/operating-systems/자원-할당-graph.svg)

예를 들어 다음 순환을 보자.

```text
R1 → P1 → R2 → P2 → R1
```

P1은 R1을 가지고 R2를 기다리고, P2는 R2를 가지고 R1을 기다린다.

### 자원 instance 수에 따라 순환의 의미가 달라진다

R1과 R2가 각각 하나의 instance뿐이라면 위 순환 안의 요청을 대신 만족시킬 다른 자원가 없으므로 deadlock을 의미한다.

하지만 같은 자원 type에 여러 instance가 있다면 graph에 순환이 있다고 해서 항상 deadlock은 아니다. 다른 available instance로 요청을 만족하거나, 어떤 프로세스가 먼저 완료해 자원를 반환할 수 있기 때문이다.

따라서 multi-instance 자원에서는 현재 할당 수량과 available 자원, 남은 요청까지 함께 봐야 한다.

### Wait-for graph로 실행 의존 관계만 남길 수도 있다

Single-instance 모델에서는 자원 node를 접어 `P1이 P2가 가진 resource를 기다린다`를 `P1 → P2`처럼 표현할 수 있다. 이 wait-for graph에서 순환을 찾으면 서로 기다리는 실행 집합을 직접 볼 수 있다.

자원-할당 Graph의 핵심은 **소유자와 대기자 관계를 graph로 바꾸어 circular 의존 관계를 눈에 보이게 만드는 것**, 그리고 자원 instance 수에 따라 순환의 의미를 정확히 해석하는 것이다.