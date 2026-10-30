---
kind: concept
contentKey: dsa.core.algorithm-selection.data-shape
topicContentKey: dsa.core.algorithm-selection
slug: data-shape
title: "데이터 형태와 분포(Data Shape)"
summary: "정렬·중복·범위·분포가 알고리즘 선택을 바꾸는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/31elementary/"
    title: "Algorithms, 4th Edition: Elementary Symbol Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "순차 탐색과 정렬 배열의 이진 탐색 전제·비용 및 순서 기반 연산을 비교한다."
    displayOrder: 1
    relationNote: "정렬 여부가 이진 탐색 가능 여부를 바꾸는 사례다."
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "해시 함수, 분리 연결법·선형 탐사, 부하율과 검색 비용을 확인한다."
    displayOrder: 2
    relationNote: "해시 값의 분포와 충돌이 조회 비용을 바꾸는 사례다."
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "무방향 그래프 표현, BFS 최단 경로, DFS와 연결 요소 탐색을 확인한다."
    displayOrder: 3
    relationNote: "희소·조밀 그래프에 따라 인접 표현 선택이 달라지는 근거다."
  - url: "https://algs4.cs.princeton.edu/51radix/"
    title: "Algorithms, 4th Edition: String Sorts"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "키 인덱스 계수법과 LSD·MSD 기수 정렬, 안정적인 자리별 정렬을 확인한다."
    displayOrder: 4
    relationNote: "값 범위가 제한될 때 계수 기반 정렬과 기수 정렬을 선택하는 사례다."
---
# 데이터 형태와 분포(Data Shape)

입력 크기 `n`이 같아도 데이터의 구조적 성질이 다르면 좋은 알고리즘이 달라진다. 이미 정렬되어 있는지, 중복이 많은지, 값의 범위가 제한되어 있는지, 그래프가 희소한지 조밀한지 같은 조건이 알고리즘의 전제와 비용을 바꾼다.

이미 정렬된 배열에서는 이진 탐색을 사용할 수 있지만 정렬되지 않은 데이터라면 먼저 정렬 비용을 지불해야 한다. 값의 범위가 충분히 작다면 계수 정렬처럼 원소끼리 직접 비교하지 않는 정렬도 후보가 될 수 있다.

중복 분포도 중요하다. 같은 값이 많은 퀵 정렬에서는 같은 값 처리 방식이 분할 품질에 영향을 줄 수 있고, 해시 테이블에서는 특정 버킷으로 키가 몰리면 기대했던 조회 성능이 악화될 수 있다.

그래프에서는 정점과 간선 수의 관계가 표현 방식 선택에 영향을 준다. 희소 그래프에서는 실제 간선만 저장하는 인접 리스트가 자연스럽고, 정점 수가 작고 두 정점 사이의 간선 존재 여부를 매우 자주 확인하는 조밀 그래프에서는 인접 행렬이 후보가 될 수 있다.

따라서 `n` 하나만으로 알고리즘을 선택하지 않는다. **정렬 여부, 중복, 값의 범위, 분포, 그래프 밀도처럼 실제로 보장되는 데이터 특성**을 함께 확인해야 한다.
