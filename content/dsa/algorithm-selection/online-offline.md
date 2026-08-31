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
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Online and Offline

online 알고리즘은 입력을 한 번에 모두 볼 수 없고 도착 즉시 결정을 내린다. offline 알고리즘은 전체 입력을 미리 보고 정렬·전처리·전역 선택을 할 수 있어 더 좋은 최적화와 증명을 적용할 수 있다.

stream을 모두 저장해 offline으로 바꾸면 memory와 latency가 늘고, online 선택은 미래를 몰라 optimality가 약해질 수 있다. 결과를 언제 외부에 공개해야 하는지와 수정 가능성을 함께 정한다.

### Backend 연결

실시간 review event와 nightly recommendation batch는 서로 다른 알고리즘 경계를 가진다. online path에는 bounded state와 backpressure를, offline path에는 snapshot과 재현 가능한 input을 둔다.

