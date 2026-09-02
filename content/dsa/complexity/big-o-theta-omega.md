---
kind: concept
contentKey: dsa.core.complexity.big-o-theta-omega
topicContentKey: dsa.core.complexity
slug: big-o-theta-omega
title: "Big-O, Theta and Omega"
summary: "상한·정확한 차수·하한을 점근 표기로 구분한다."
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

Big-O는 충분히 큰 입력에서 비용이 어떤 함수의 상한 안에 있음을 말하고, Ω는 하한, Θ는 상·하한이 같은 차수임을 말한다. 따라서 Big-O가 곧 최악의 경우라는 뜻은 아니다. 입력 case를 고정한 뒤 그 case의 비용 함수와 점근 표기를 함께 써야 한다.

상수와 낮은 차수 항을 버리는 표기는 서로 다른 구현의 작은 입력 성능을 설명하지 않는다. `O(n)` 알고리즘도 큰 상수와 cache miss가 있으면 `O(n log n)` 구현보다 느릴 수 있고, 표기만으로 memory와 latency를 모두 설명할 수 없다.

### Backend 연결

page API의 limit, search index의 후보 수, batch query의 반복 횟수를 각각 n으로 모델링한다. SLA 판단에는 점근식과 함께 실제 상한·분포·storage latency를 기록한다.
