---
kind: concept
contentKey: java.core.coding-tests.sorting-arrays-collections
topicContentKey: java.core.coding-tests
slug: sorting-arrays-collections
title: "Sorting arrays and collections"
summary: "Arrays.sort와 collection sorting API를 올바르게 사용하고 primitive/object array의 차이를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html"
    title: "Java SE 25 API: Arrays"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: primitive·object 배열 sort overload 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html"
    title: "Java SE 25 API: List"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: List sort contract 확인
---
# 배열과 collection 정렬

## 쉬운 진입

코딩테스트에서 정렬 대상이 int[]인지 Integer[]인지 List<Integer>인지에 따라 호출 API와
comparator 사용 가능 여부가 달라진다. 자료구조를 먼저 확인하면 컴파일 오류와 불필요한
boxing을 함께 줄일 수 있다.

## 정확한 메커니즘

~~~
int[] numbers = {3, 1, 2};
Arrays.sort(numbers);                  // primitive 오름차순

Integer[] boxed = {3, 1, 2};
Arrays.sort(boxed, Comparator.reverseOrder()); // object 배열 + Comparator

List<Integer> values = new ArrayList<>(List.of(3, 1, 2));
values.sort(Comparator.naturalOrder());
~~~

Arrays.sort(int[]) 같은 primitive overload에는 Comparator를 전달할 수 없다. 반대로
reference array와 List는 comparator로 사용자 순서를 표현할 수 있다. 따라서 내림차순
primitive 배열은 정렬 후 뒤집거나 boxed/reference 자료구조를 선택해야 한다. 정렬
메서드는 대상 자체의 순서를 바꾸므로 원본 보존이 필요하면 복사본을 정렬한다.

## 실전·면접 연결

정렬 기준이 하나면 자연 순서 API로 의도를 드러내고, 다중 기준이면 comparator를 명시한다.
범위 overload를 쓰면 전체가 아닌 구간만 정렬된다는 점도 확인한다. “배열 정렬”이라는
문제를 Java API로 구현하는 것이 목적이며, 정렬 알고리즘 이론이나 복잡도 증명을 이
Concept의 주제로 확장하지 않는다.

## 흔한 오해

- int[]에 Comparator<Integer>를 바로 전달할 수 없다.
- Arrays.asList(intArray)는 primitive 원소 목록으로 변환하지 않는다.
- 정렬 호출이 새 배열을 반환한다고 가정하면 원본 변경과 결과 사용을 혼동하게 된다.
