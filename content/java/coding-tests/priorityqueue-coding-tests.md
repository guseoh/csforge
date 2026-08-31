---
kind: concept
contentKey: java.core.coding-tests.priorityqueue-coding-tests
topicContentKey: java.core.coding-tests
slug: priorityqueue-coding-tests
title: "PriorityQueue in coding tests"
summary: "min/max/custom priority 문제에서 PriorityQueue와 Comparator를 사용하고 heap head와 전체 정렬을 혼동하지 않는다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html"
    title: "Java SE 25 API: PriorityQueue"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: heap head와 iterator 순회 계약 확인
---
# 코딩테스트용 PriorityQueue

## 쉬운 진입

매번 전체 원소를 정렬하지 않고 “현재 가장 작은 값”이나 “현재 가장 높은 우선순위”만
꺼내고 싶을 때 PriorityQueue를 사용한다. 기본 queue는 natural ordering의 최소 원소가
head이고, comparator를 주면 문제의 우선순위를 직접 표현한다.

## 정확한 메커니즘

~~~
PriorityQueue<Integer> min = new PriorityQueue<>();
PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());

PriorityQueue<Node> jobs = new PriorityQueue<>(
        Comparator.comparingInt(Node::priority)
                  .thenComparingInt(Node::id));
~~~

peek은 head를 확인하고 poll은 head를 제거한다. heap은 head를 빠르게 찾도록 부분
순서를 유지할 뿐 모든 배열 위치가 전체 오름차순이라는 뜻은 아니다. 따라서 iterator나
toArray() 순회가 정렬 결과라고 가정하지 말고, 전체 순서가 필요하면 반복해서 poll하거나
별도로 정렬한다. comparator가 동점 처리 기준까지 포함하는지 확인하면 실행 결과를
재현하기 쉽다.

## 실전·면접 연결

우선순위가 바뀐 객체를 내부에서 직접 수정하면 heap 순서가 자동으로 재배치되지 않는다.
그런 경우 제거 후 다시 넣거나 immutable priority 값으로 새 항목을 삽입한다. capacity와
시간 복잡도는 API 선택의 일부지만, 여기서 특정 문제 알고리즘을 암기하는 것이 목표는 아니다.

## 흔한 오해

- PriorityQueue의 iterator는 우선순위 순서로 모든 원소를 반환한다고 보장되지 않는다.
- 기본 comparator는 최대값 우선이 아니라 최소값 우선이다.
- peek은 head를 제거하지 않는다.
