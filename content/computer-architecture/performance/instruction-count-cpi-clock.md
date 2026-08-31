---
kind: concept
contentKey: computer-architecture.core.performance.instruction-count-cpi-clock
topicContentKey: computer-architecture.core.performance
slug: instruction-count-cpi-clock
title: "Instruction Count, CPI and Clock"
summary: "CPU time을 instruction count·CPI·clock cycle로 분해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "가속 가능한 비율과 전체 speedup의 경계를 확인한다."
    displayOrder: 1
---
# Instruction Count, CPI and Clock

CPU time은 `instruction count × average CPI × clock cycle time`으로 분해할 수 있다. compiler 변경은 instruction count를, cache·branch·pipeline은 CPI를, hardware frequency는 cycle time을 주로 바꾼다. 세 항을 분리하면 “instruction이 적으니 빠르다” 같은 단일 원인 추론을 피할 수 있다.

평균 CPI는 instruction 종류와 memory stall이 섞인 값이며 모든 instruction이 같은 CPI라는 뜻이 아니다. 한 workload의 CPI 개선이 다른 branch pattern이나 I/O 중심 요청에도 유지된다는 보장은 없다.

### Backend 연결

native hotspot을 최적화할 때 retired instruction, cycles, cache miss, branch miss를 함께 수집한다. HTTP p99는 이 식에 queue와 network가 더해진 결과이므로 CPU 식만으로 SLA를 예측하지 않는다.
