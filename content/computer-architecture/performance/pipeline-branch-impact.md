---
kind: concept
contentKey: computer-architecture.core.performance.pipeline-branch-impact
topicContentKey: computer-architecture.core.performance
slug: pipeline-branch-impact
title: "Pipeline and Branch Impact"
summary: "branch penalty와 pipeline depth가 실행 시간에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "가속 가능한 비율과 전체 speedup의 경계를 확인한다."
    displayOrder: 1
---
# Pipeline and Branch Impact

pipeline이 깊으면 stage당 logic은 줄어 clock을 빠르게 할 수 있지만, branch가 잘못 예측됐을 때 버려야 할 instruction이 늘어 penalty가 커질 수 있다. 실제 비용은 branch 빈도, prediction accuracy, target fetch와 pipeline 구조의 곱으로 관찰해야 한다.

branchless 변환은 prediction miss를 줄일 수 있지만 mask 연산·memory load를 추가해 항상 이득이 아니다. correctness를 보장하는 조건 검사나 권한 분기를 성능 때문에 제거하지 않는다.

### Backend 연결

hot loop 최적화는 실제 input distribution, cycles per instruction, branch miss counter와 tail latency로 검증한다. compiler output이 바뀌면 같은 source라도 비교 조건을 다시 고정한다.
