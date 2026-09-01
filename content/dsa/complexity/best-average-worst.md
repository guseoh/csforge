---
kind: concept
contentKey: dsa.core.complexity.best-average-worst
topicContentKey: dsa.core.complexity
slug: best-average-worst
title: "Best, Average and Worst Case"
summary: "입력 분포와 보장 수준에 따른 세 비용 관점을 비교한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Best, Average and Worst Case

best case는 가장 유리한 입력, worst case는 보장해야 하는 가장 불리한 입력, average case는 확률 분포를 가정한 기대 비용이다. 같은 binary search도 target이 첫 중간에 있는 경우와 없어서 끝까지 줄이는 경우가 다르며 average를 말하려면 input distribution을 밝혀야 한다.

평균이 빠르다는 사실이 특정 공격 입력에 대한 안전한 상한을 제공하지 않는다. 반대로 worst bound가 커도 실제 분포에서 거의 나타나지 않을 수 있으므로 timeout·capacity 계획과 사용자 체감에는 관점을 맞춰 사용한다.

### Backend 연결

endpoint의 p99와 평균을 알고리즘 average case와 혼동하지 않는다. adversarial key, 빈 결과, 최대 page 같은 경계 입력을 별도 부하 시나리오로 둔다.
