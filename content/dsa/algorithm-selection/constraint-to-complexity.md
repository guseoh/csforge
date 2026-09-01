---
kind: concept
contentKey: dsa.core.algorithm-selection.constraint-to-complexity
topicContentKey: dsa.core.algorithm-selection
slug: constraint-to-complexity
title: "Constraint to Complexity"
summary: "입력 상한과 시간 예산을 허용 가능한 복잡도로 번역해 후보를 줄인다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Constraint to Complexity

알고리즘을 고를 때 첫 질문은 “가장 멋진 알고리즘이 무엇인가”가 아니라 **최대 입력에서 몇 번의 작업을 감당할 수 있는가**다. 입력 상한 `n`, 요청 한 건에 허용된 시간, 메모리 예산을 먼저 잡고 나면 가능한 복잡도 범위가 좁아진다.

예를 들어 `n = 100,000`이라면 `n²`은 약 `10¹⁰`개의 조합을 만든다. 단순 연산이라고 해도 일반적인 요청 경로에서 현실적인 후보가 되기 어렵다. 반면 `n log₂ n`은 대략 `1.7 × 10⁶` 수준이므로 비교 정렬이나 divide-and-conquer 계열을 검토할 여지가 생긴다. `n = 1,000`에서는 같은 `O(n²)`도 약 백만 번이므로 충분히 단순하고 안전한 선택일 수 있다. Big-O는 절대 시간을 주는 식이 아니지만, **입력 규모가 커질 때 어떤 후보가 구조적으로 탈락하는지** 빠르게 판단하게 해준다.

### 복잡도는 후보 제거 기준이다

복잡도 표기만으로 최종 선택을 끝내면 안 된다. 같은 `O(n log n)`이라도 allocation, cache locality, branch, I/O, 구현 상수는 다르고, hash table의 expected `O(1)`처럼 평균적 전제가 붙는 경우도 있다. 따라서 순서는 보통 다음과 같다.

```text
입력 상한과 호출 횟수 확인
        ↓
명백히 감당할 수 없는 복잡도 제거
        ↓
남은 후보의 메모리·data shape·operation 비교
        ↓
대표/최악 입력으로 실제 측정
```

예를 들어 데이터가 이미 정렬돼 있고 query가 한 번뿐이라면 추가 index를 만드는 것보다 선형 scan이 더 단순할 수 있다. 반대로 같은 데이터에 수십만 번 lookup이 반복된다면 preprocessing 비용을 먼저 지불하는 선택이 유리해질 수 있다.

### 최악 입력과 전체 workload를 본다

개발용 sample이 100건이라고 해서 production 상한도 100건인 것은 아니다. 페이지 크기, batch 최대 크기, graph의 vertex/edge 수, DP state 수처럼 **알고리즘이 실제로 보는 입력 크기**를 명시해야 한다. 하나의 요청이 싸더라도 동시에 여러 요청이 실행되면 CPU와 메모리 budget은 공유된다.

그래서 `O(n²)`을 무조건 나쁜 구현으로 보거나 `O(n log n)`을 무조건 정답으로 보지 않는다. 현재 제약 안에서 더 단순한 구현이 충분하면 그것이 좋은 선택일 수 있고, 제약이 커지면 그때 더 나은 복잡도를 요구한다. 핵심은 복잡도 표기를 알고리즘 이름의 등급표가 아니라 **입력 계약을 실행 비용으로 번역하는 도구**로 사용하는 것이다.
