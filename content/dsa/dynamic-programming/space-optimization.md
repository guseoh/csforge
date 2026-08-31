---
kind: concept
contentKey: dsa.core.dynamic-programming.space-optimization
topicContentKey: dsa.core.dynamic-programming
slug: space-optimization
title: "Space Optimization"
summary: "필요한 이전 state만 남겨 메모리를 줄이는 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Space Optimization

DP recurrence가 바로 앞 row나 고정된 몇 개의 state만 참조하면 전체 table 대신 rolling array나 변수 몇 개만 보존할 수 있다. 공간을 `O(n²)`에서 `O(n)`으로 줄여도 계산 순서가 이전 값을 덮어쓰지 않는다는 조건이 필요하다.

경로와 선택을 복원해야 하면 값만 남기는 최적화가 정보를 잃을 수 있다. 먼저 full table로 correctness를 확인한 뒤 필요한 복원 metadata와 함께 줄인다.

### Backend 연결

대량 사용자 통계 계산에서 메모리를 줄일 때 재시작과 결과 검증을 위해 batch checkpoint를 둔다. 공간 절약이 audit trail 삭제를 의미하지 않게 canonical event와 계산 buffer를 분리한다.
