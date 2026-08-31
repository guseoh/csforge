---
kind: concept
contentKey: java.core.coding-tests.comparator-for-coding-tests
topicContentKey: java.core.coding-tests
slug: comparator-for-coding-tests
title: "Comparator for coding tests"
summary: "오름차순·내림차순·다중 key 정렬용 Comparator를 overflow 없이 안전하게 작성한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html"
    title: "Java SE 25 API: Comparator"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 비교 결과와 comparator 조합 계약 확인
---
# 코딩테스트용 Comparator

## 쉬운 진입

두 값을 비교할 때 a - b를 쓰면 짧아 보이지만, 값의 범위가 크면 뺄셈이 overflow되어
순서가 뒤집힐 수 있다. comparingInt, Integer.compare, thenComparing으로 “어떤 key를
어떤 순서로 비교하는가”를 코드에 남기는 편이 안전하다.

## 정확한 메커니즘

~~~
record Node(int distance, int id) {}

Comparator<Node> order = Comparator
        .comparingInt(Node::distance)
        .thenComparingInt(Node::id);

List<Node> nodes = new ArrayList<>(input);
nodes.sort(order);
~~~

내림차순은 해당 comparator에 reversed()를 적용하거나 key별로 comparingInt(...).reversed()
를 조합한다. (a, b) -> a.distance() - b.distance()는 두 정수의 차가 표현 범위를
넘을 수 있으므로 Integer.compare(a.distance(), b.distance())가 적절하다. comparator는
음수·0·양수의 상대 관계를 반환하며 반드시 실제 차이값을 반환해야 하는 것은 아니다.

## 실전·면접 연결

동점 처리 기준을 추가하면 결과가 안정적으로 재현되고, 문제의 “거리 오름차순, 번호
오름차순” 같은 문장을 그대로 읽을 수 있다. comparator가 객체의 equals를 바꾸지는
않으며, sorted collection에서 동등하다고 보는 기준과 객체 equality가 다를 수 있다는
점은 별도 API 계약으로 판단한다.

## 흔한 오해

- comparator 결과로 a - b의 정확한 차이값이 필요하지 않다.
- reversed()는 전체 comparator의 순서를 뒤집으므로 일부 key만 내림차순일 때는 key 단위 조합을 사용한다.
- comparator가 정렬 대상 객체를 복사하거나 불변으로 만들지는 않는다.
