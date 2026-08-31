---
kind: concept
contentKey: computer-architecture.core.performance.cpu-time
topicContentKey: computer-architecture.core.performance
slug: cpu-time
title: "CPU Time"
summary: "CPU time과 elapsed time, clock rate의 차이를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "가속 가능한 비율과 전체 speedup의 경계를 확인한다."
    displayOrder: 1
---
# CPU Time

CPU time은 process가 실제로 processor를 사용한 시간이고 elapsed time에는 I/O 대기·다른 process의 실행·queue wait가 포함된다. 간단한 모델에서 CPU time은 실행 cycle 수와 cycle time의 곱이며, clock rate를 높이거나 필요한 cycle을 줄일 때 감소한다.

동일한 program도 cache miss, branch prediction, preemption 때문에 cycle 수가 달라진다. wall-clock이 짧아졌다는 사실만으로 CPU instruction이 줄었다고 결론내리면 안 된다.

### Backend 연결

endpoint latency를 CPU profile과 같은 지표로 취급하지 않는다. process CPU time, scheduler wait, I/O time, downstream time을 분리해야 올바른 최적화 지점을 찾는다.
