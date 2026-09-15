---
kind: concept
contentKey: dsa.core.algorithm-selection.online-offline
topicContentKey: dsa.core.algorithm-selection
slug: online-offline
title: "Online and Offline"
summary: "입력이 순차 도착할 때와 전체를 미리 볼 때의 선택 차이를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Online and Offline

알고리즘은 입력 전체를 미리 볼 수 있는지에 따라 사용할 수 있는 전략이 달라진다. **Offline** 문제에서는 모든 입력을 확보한 뒤 정렬, 전처리, 전역 비교를 수행할 수 있다. **Online** 문제에서는 다음 입력을 모르는 상태에서 현재까지의 정보만으로 상태를 갱신하거나 결정을 내려야 한다.

예를 들어 모든 interval을 미리 알고 있다면 finish time으로 정렬한 뒤 scheduling 알고리즘을 적용할 수 있다. 반대로 interval이 하나씩 도착하고 즉시 선택해야 한다면 미래 후보를 기준으로 현재 결정을 다시 최적화할 수 없다.

이 차이는 단순히 stream 형태인가의 문제가 아니다. Online에서는 미래 입력을 볼 수 없기 때문에 offline optimal solution과 같은 결정을 항상 할 수 없을 수 있다.

끝이 없는 입력을 처리한다면 과거 정보를 모두 저장할 수도 없다. Sliding window처럼 최근 k개만 필요한 문제에서는 오래된 state를 제거하면서도 미래 answer를 계산하는 데 필요한 invariant를 유지해야 한다.

따라서 online/offline 선택은 **입력을 언제 알 수 있는가, 결정을 언제 내려야 하는가, 과거 결정을 수정할 수 있는가, 얼마만큼의 state를 보관할 수 있는가**에 의해 결정된다.
