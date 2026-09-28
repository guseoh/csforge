---
kind: concept
contentKey: dsa.core.algorithm-selection.online-offline
topicContentKey: dsa.core.algorithm-selection
slug: online-offline
title: "온라인·오프라인 알고리즘(Online/Offline)"
summary: "입력이 순차 도착할 때와 전체를 미리 볼 때의 선택 차이를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2012/b1e5ac3c8f7d60db9b8d5b66c40bc55e_MIT6_046JS12_Notes.pdf"
    title: "MIT 6.046J: Design and Analysis of Algorithms Lecture Notes"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "온라인·오프라인 알고리즘의 입력 시점, 미래 정보 사용 가능 여부와 경쟁 분석을 확인한다."
    displayOrder: 1
---
# 온라인·오프라인 알고리즘(Online/Offline)

알고리즘은 입력 전체를 미리 알 수 있는지에 따라 사용할 수 있는 전략이 달라진다. **오프라인(offline)** 문제에서는 모든 입력을 확보한 뒤 정렬, 전처리, 전역 비교를 수행할 수 있다. 반대로 **온라인(online)** 문제에서는 앞으로 들어올 입력을 모르는 상태에서 현재까지의 정보만으로 상태를 갱신하거나 결정을 내려야 한다.

예를 들어 모든 구간을 미리 알고 있다면 종료 시각을 기준으로 정렬한 뒤 스케줄링 알고리즘을 적용할 수 있다. 반대로 구간이 하나씩 도착하고 즉시 선택해야 한다면 미래 후보를 본 뒤 현재 결정을 다시 최적화할 수 없다.

이 차이는 단순히 입력이 스트림 형태인가의 문제가 아니다. 온라인 문제에서는 미래 입력을 볼 수 없기 때문에 전체 입력을 알고 계산한 오프라인 최적해와 같은 결정을 항상 내릴 수 있는 것은 아니다.

끝이 없는 입력을 처리한다면 과거 정보를 모두 저장할 수도 없다. 슬라이딩 윈도(sliding window)처럼 최근 `k`개만 필요한 문제에서는 오래된 상태를 제거하면서도 이후 결과를 계산하는 데 필요한 불변식을 유지해야 한다.

따라서 온라인·오프라인 알고리즘을 구분할 때는 **입력을 언제 알 수 있는가, 결정을 언제 내려야 하는가, 과거 결정을 수정할 수 있는가, 얼마만큼의 상태를 보관할 수 있는가**를 함께 본다.
