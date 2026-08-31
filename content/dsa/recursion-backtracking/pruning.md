---
kind: concept
contentKey: dsa.core.recursion-backtracking.pruning
topicContentKey: dsa.core.recursion-backtracking
slug: pruning
title: "Pruning"
summary: "불가능한 branch를 조기에 제거해 search space를 줄인다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Pruning

pruning은 현재 partial state가 제약을 만족할 수 없다는 근거가 있을 때 그 branch 전체를 버리는 방법이다. 유효한 답을 잘라내지 않으려면 pruning predicate가 필요조건임을 증명해야 한다.

상한·하한, 이미 사용한 자원, 남은 capacity 같은 cheap bound를 먼저 검사하면 탐색량을 줄일 수 있다. heuristic이 단지 “그럴듯하다”는 이유만으로 branch를 제거하면 completeness가 깨질 수 있다.

### Backend 연결

대량 후보 조합을 생성하는 작업에는 hard limit와 시간 제한을 두고, pruning 근거와 중단 상태를 관측 가능하게 남긴다. 결과가 부분 집합임을 호출자에게 명시하면 완전 탐색과 혼동하지 않는다.
