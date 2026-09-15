---
kind: concept
contentKey: dsa.core.complexity.big-o-theta-omega
topicContentKey: dsa.core.complexity
slug: big-o-theta-omega
title: "Big-O, Theta and Omega"
summary: "점근적 상한·같은 차수·하한을 O·Θ·Ω 표기로 구분한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Big-O, Theta and Omega

점근 표기는 입력 크기 `n`이 충분히 커질 때 비용 함수가 어떤 성장률을 가지는지 표현한다. 상수 배수와 낮은 차수 항보다 **입력 증가에 따라 지배적으로 커지는 항**에 초점을 둔다.

`O(g(n))`는 비용이 충분히 큰 `n`에서 `g(n)`의 상수 배수보다 더 빠르게 커지지 않는다는 상한을 나타낸다. `Ω(g(n))`는 반대로 하한을 나타내고, `Θ(g(n))`는 상한과 하한이 같은 차수여서 성장률을 더 정확히 묶을 수 있을 때 사용한다.

```text
3n² + 5n + 10 = Θ(n²)
                 O(n²)
                 Ω(n²)
```

Big-O를 곧바로 `worst case`와 같은 뜻으로 생각하면 안 된다. Best·average·worst는 **어떤 입력 case의 비용 함수를 분석하는가**에 대한 구분이고, O·Θ·Ω는 그 비용 함수의 점근적 bound를 표현하는 표기다. 예를 들어 worst-case 비용에도 `O`, `Θ`, `Ω`를 각각 사용할 수 있다.

점근 표기는 작은 입력에서의 실제 실행 시간이나 메모리 접근 비용까지 알려 주지는 않는다. 같은 `Θ(n)` 알고리즘도 상수 비용과 data layout이 다르면 실제 성능이 달라질 수 있다. 따라서 점근 분석은 구현 측정값을 대체하는 것이 아니라 **입력이 커질 때 비용이 어떻게 확장되는지 비교하는 모델**이다.
