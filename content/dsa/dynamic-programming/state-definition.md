---
kind: concept
contentKey: dsa.core.dynamic-programming.state-definition
topicContentKey: dsa.core.dynamic-programming
slug: state-definition
title: "DP State Definition"
summary: "부분 문제를 유일하게 나타내는 상태 변수를 정의한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# DP State Definition

DP state는 “이 상태에서 앞으로 얻을 수 있는 최적 결과”처럼 동일한 답을 재사용할 수 있는 최소 정보다. index 하나인지, 남은 capacity와 마지막 선택까지 필요한지 문제의 future decision을 보고 정한다.

상태가 너무 작으면 서로 다른 상황을 합쳐 오답이 되고, 너무 크면 중복이 줄지 않아 DP 이점이 사라진다. 각 변수의 의미와 허용 범위를 문장으로 정의한 뒤 전이를 작성한다.

### Backend 연결

review 우선순위 계산에서 사용자의 현재 단계와 오늘의 budget이 모두 결과에 영향을 주면 둘 다 상태에 들어가야 한다. 상태 schema를 바꾸면 기존 파생 cache를 무효화한다.
