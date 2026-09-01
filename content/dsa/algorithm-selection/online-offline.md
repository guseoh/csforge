---
kind: concept
contentKey: dsa.core.algorithm-selection.online-offline
topicContentKey: dsa.core.algorithm-selection
slug: online-offline
title: "Online and Offline"
summary: "미래 입력을 볼 수 있는지 여부가 가능한 정렬·전처리·최적화 전략을 어떻게 제한하는지 설명한다."
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
# Online and Offline

알고리즘은 입력 전체를 미리 볼 수 있는지에 따라 선택지가 크게 달라진다. **offline** 문제는 전체 입력을 확보한 뒤 정렬, 전처리, 전역 비교를 수행할 수 있다. **online** 문제는 다음 입력을 모르는 상태에서 현재까지의 정보만으로 결정을 내리거나 상태를 갱신해야 한다.

예를 들어 모든 interval을 미리 알고 있다면 종료 시각으로 정렬한 뒤 greedy scheduling을 적용할 수 있다. 반면 이벤트가 실시간으로 도착하고 즉시 결과를 내야 한다면 미래 interval을 기다릴 수 없으므로 같은 방식의 전역 최적화를 그대로 사용할 수 없다.

### 정보가 부족하면 보장도 달라진다

Online 알고리즘의 어려움은 단순히 입력이 stream이라는 데 있지 않다. **현재 선택이 미래 입력 때문에 후회할 선택이 될 수 있는데도 되돌릴 수 없을 수 있다는 것**이 핵심이다. 따라서 offline optimal solution과 같은 품질을 항상 보장하지 못하고, 문제에 따라 competitive ratio나 별도의 approximation 보장을 사용하기도 한다.

반대로 모든 입력을 모을 때까지 기다려 offline으로 바꾸면 더 좋은 전역 최적화를 할 수 있지만 latency와 memory가 늘어난다. 1초 안에 사용자에게 결과를 보여줘야 하는 요청에서 하루치 데이터를 모두 기다리는 방식은 정답이 아니다.

### bounded state가 필요한 이유

끝이 없는 stream을 online으로 처리한다면 과거 입력을 전부 보관할 수 없다. 최근 `k`개만 필요한 sliding window라면 오래된 원소를 만료시키고, 누적 통계라면 필요한 aggregate만 유지하는 식으로 state를 제한해야 한다.

```text
incoming event
    ↓
현재 bounded state와 결합
    ↓
결과 갱신
    ↓
더 이상 필요한 정보가 아닌 state 제거
```

여기서 어떤 과거 정보를 버려도 future answer를 계산할 수 있는지가 algorithm invariant가 된다.

### 실시간 경로와 batch 경로를 구분한다

같은 데이터라도 요구사항에 따라 두 전략을 함께 사용할 수 있다. 실시간 화면은 online approximation이나 incremental state로 빠르게 갱신하고, nightly batch는 전체 snapshot을 사용해 offline으로 정확한 통계나 추천을 다시 계산할 수 있다.

중요한 것은 online/offline을 구현 방식의 취향으로 고르지 않는 것이다. **입력을 언제 알 수 있는가, 결정을 언제 공개해야 하는가, 얼마나 많은 state를 보관할 수 있는가, 과거 결정을 수정할 수 있는가**가 선택을 결정한다.
