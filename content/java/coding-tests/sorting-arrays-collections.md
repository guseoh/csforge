---
kind: concept
contentKey: java.core.coding-tests.sorting-arrays-collections
topicContentKey: java.core.coding-tests
slug: sorting-arrays-collections
title: "Sorting arrays and collections"
summary: "primitive 배열, 객체 배열, List에 맞는 정렬 API를 고르고 원본 변경과 Comparator 사용 범위를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html"
    title: "Java SE 25 API: Arrays"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: primitive·reference 배열의 sort overload 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html"
    title: "Java SE 25 API: List"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: List.sort와 Comparator 사용 계약 확인
---
# 배열과 collection 정렬

코딩테스트에서 "정렬한다"는 알고리즘 요구가 같아도 Java 코드에서는 대상이 `int[]`, `Integer[]`, `List<Node>` 중 무엇인지에 따라 사용할 API가 달라집니다. 문제 풀이 전에 **현재 자료형과 원하는 정렬 기준을 먼저 확인**하면 컴파일 오류와 불필요한 변환을 줄일 수 있습니다.

### primitive 배열은 Arrays.sort를 직접 사용할 수 있다

```java
int[] numbers = {4, 1, 3, 2};
Arrays.sort(numbers);

System.out.println(Arrays.toString(numbers));
// [1, 2, 3, 4]
```

`Arrays.sort(int[])`는 배열 자체의 원소 순서를 바꿉니다. 새 정렬 배열을 반환하는 API가 아닙니다.

원본 배열이 이후에도 필요하다면 먼저 복사합니다.

```java
int[] sorted = Arrays.copyOf(numbers, numbers.length);
Arrays.sort(sorted);
```

### primitive 배열에는 객체 Comparator를 바로 줄 수 없다

```java
int[] numbers = {3, 1, 2};
// Arrays.sort(numbers, Comparator.reverseOrder()); // 불가
```

`Comparator<T>`는 reference type을 비교하는 API입니다. `int[]`용 sort overload와 `Integer[]`용 sort overload는 다릅니다.

내림차순이 필요하다면 문제 상황에 따라 다음 방법을 선택할 수 있습니다.

- 오름차순 정렬 후 뒤에서부터 사용
- `Integer[]` 또는 `List<Integer>` 사용
- 애초에 우선순위 큐 등 다른 구조가 더 자연스러운지 검토

단순히 comparator를 쓰기 위해 모든 primitive를 boxing하면 메모리와 코드가 불필요하게 늘 수 있으므로 요구에 맞게 선택합니다.

### 객체 배열과 List는 Comparator로 정렬 기준을 줄 수 있다

```java
Integer[] values = {3, 1, 2};
Arrays.sort(values, Comparator.reverseOrder());
```

```java
List<Integer> values = new ArrayList<>(List.of(3, 1, 2));
values.sort(Comparator.naturalOrder());
```

사용자 정의 타입도 Comparator를 이용해 문제의 정렬 조건을 그대로 표현할 수 있습니다.

```java
students.sort(
        Comparator.comparingInt(Student::score).reversed()
                .thenComparing(Student::name)
);
```

### `Arrays.asList(intArray)`는 int 목록으로 풀리지 않는다

이건 코딩테스트에서 자주 틀리는 부분입니다.

```java
int[] values = {1, 2, 3};
List<int[]> list = Arrays.asList(values);
```

`int[]` 자체가 하나의 reference object이기 때문에 `List<Integer>`가 자동으로 만들어지지 않습니다. Primitive array와 boxed collection의 경계를 구분해야 합니다.

### 전체 정렬이 필요한지 먼저 생각한다

문제에서 가장 작은 3개만 필요하거나 현재 최소값을 반복해서 꺼내야 한다면 전체 배열 정렬이 유일한 방법은 아닙니다. 이 판단은 DSA 영역의 문제 해결 전략에 해당합니다.

Java 구현 단계에서는 선택한 알고리즘에 맞춰 `Arrays.sort`, `List.sort`, `PriorityQueue` 중 올바른 API를 쓰는 것이 핵심입니다.

### 정렬 범위와 원본 변경도 확인한다

`Arrays.sort(array, fromIndex, toIndex)`처럼 일부 범위만 정렬하는 overload가 있습니다. 문제에서 이런 코드가 나오면 전체가 정렬됐다고 가정하면 안 됩니다.

또 `List.sort`도 일반적으로 해당 mutable List의 순서를 바꾸는 연산입니다. `List.of(...)`처럼 변경할 수 없는 List에 직접 정렬을 시도할 수 있는지도 확인해야 합니다.

### 문제를 풀 때 확인할 것

1. 정렬 대상이 primitive array, reference array, List 중 무엇인지 확인합니다.
2. 자연 순서인지 사용자 Comparator가 필요한지 봅니다.
3. 정렬 API가 원본을 변경하는지 확인합니다.
4. primitive를 comparator 때문에 불필요하게 boxing하고 있지 않은지 봅니다.
5. 전체 정렬인지 일부 범위 정렬인지 확인합니다.

### 자주 헷갈리는 부분

- `Arrays.sort`가 새 배열을 반환한다고 생각하면 안 됩니다.
- `int[]`에 `Comparator<Integer>`를 바로 전달할 수 없습니다.
- `Arrays.asList(int[])`는 `List<Integer>`가 아닙니다.
- 변경 불가능한 List는 직접 정렬할 수 없습니다.

### 면접이나 문제 풀이에서 설명한다면

Java 정렬 API는 자료형에 따라 다릅니다. Primitive array는 해당 `Arrays.sort` overload를 사용하고 Comparator는 reference array나 List에서 활용합니다. 정렬은 보통 대상 자체의 순서를 바꾸므로 원본 보존 여부를 확인하고, primitive array를 객체 collection으로 자동 변환해 준다고 가정하지 않는 것이 중요합니다.
