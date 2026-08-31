---
kind: concept
contentKey: dsa.core.algorithm-selection.data-shape
topicContentKey: dsa.core.algorithm-selection
slug: data-shape
title: "Data Shape"
summary: "정렬·중복·범위·분포가 알고리즘 선택을 바꾸는 이유를 설명한다."
level: 1
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
# Data Shape

같은 n이라도 이미 정렬됐는지, 중복이 많은지, key 범위가 작은지, 값이 skew됐는지에 따라 적합한 자료구조와 알고리즘이 달라진다. 비교 정렬과 counting/radix, hash와 ordered structure의 경계를 data shape가 만든다.

입력 분포를 가정하면 평균 성능이 좋아질 수 있지만 adversarial 입력과 빈 입력·중복 입력을 별도로 검증한다. shape를 runtime에서 알 수 있다면 adaptive strategy도 고려할 수 있다.

### Backend 연결

content key가 대부분 unique인지, query가 prefix인지, 입력이 시간순인지에 따라 index와 cache 전략을 고른다. 실제 production 분포와 worst-case fixture를 모두 benchmark에 넣는다.

