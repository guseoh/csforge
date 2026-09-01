---
kind: concept
contentKey: computer-architecture.core.performance.microbenchmark-boundary
topicContentKey: computer-architecture.core.performance
slug: microbenchmark-boundary
title: "Microbenchmark Boundary"
summary: "작은 benchmark가 무엇을 측정할 수 있고 JIT·dead-code elimination·cache state·OS noise 때문에 어떤 오판을 만들 수 있는지 설명한다."
level: 3
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://openjdk.org/projects/code-tools/jmh/"
    title: "OpenJDK JMH"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "JVM microbenchmark를 설계할 때 전용 harness를 사용하는 이유와 측정 경계를 확인한다."
    displayOrder: 1
---
# Microbenchmark Boundary

### Microbenchmark는 작은 질문에 답하기 위한 실험이다

Microbenchmark는 자료구조 operation 하나, serialization 함수 하나, 특정 instruction sequence처럼 작은 code path의 상대 비용을 통제된 조건에서 비교하는 데 유용하다. 범위를 작게 잡으면 다른 I/O나 downstream variance를 제거하고 CPU·memory behavior를 자세히 볼 수 있다.

하지만 범위를 작게 만들수록 production workload와 다른 조건도 많아진다. 그래서 microbenchmark 결과는 **측정한 작은 경로에 대한 증거**이지 전체 service 성능을 자동으로 대표하는 숫자가 아니다.

### JVM에서는 단순 반복문 benchmark가 특히 위험하다

JIT compiler는 warm-up 이후 code를 optimize하고, 결과가 사용되지 않는 계산을 dead-code elimination으로 제거하거나 constant folding할 수 있다. 다음과 같은 naive benchmark는 실제로 측정하려던 work가 사라질 수 있다.

```java
for (int i = 0; i < 1_000_000; i++) {
    expensiveComputation(); // 결과가 관찰되지 않으면 제거될 가능성을 검토해야 한다.
}
```

또한 첫 실행에는 class loading, JIT compilation과 cold cache가 섞이고 이후 실행에는 compiled code와 warmed cache가 사용될 수 있다. 한 번의 `System.nanoTime()` 차이만으로 결론 내리기 어려운 이유다.

JMH 같은 benchmark harness는 warm-up, measurement iteration, state와 result consumption을 구조화해 이런 함정을 줄이는 데 도움을 준다. Harness가 모든 문제를 자동 해결하는 것은 아니지만 직접 타이밍 loop를 만드는 것보다 측정 계약을 명시하기 쉽다.

### Hardware state도 결과를 바꾼다

Cache warmth, branch predictor history, CPU frequency scaling, thermal throttling, core migration과 다른 process의 interference가 결과를 바꿀 수 있다. Memory benchmark에서는 working set이 cache에 들어가는지, access pattern이 production과 같은지가 중요하다.

따라서 benchmark마다 input size, distribution, thread count, warm-up, fork/iteration, machine/CPU와 runtime version을 기록한다. 특히 개선 전후에 환경이 바뀌면 작은 수치 차이는 code change가 아니라 환경 차이일 수 있다.

### 더 빠른 microbenchmark가 더 빠른 service를 보장하지 않는다

JSON parser가 microbenchmark에서 30% 빨라졌더라도 전체 endpoint 시간 중 parsing이 5%였다면 Amdahl 관점의 end-to-end 개선은 작다. 새 parser가 allocation을 늘려 GC를 악화시키거나 contention이 있는 production concurrency에서 다른 결과가 나올 수도 있다.

그래서 microbenchmark와 macro/end-to-end benchmark는 서로 다른 질문에 답한다.

- microbenchmark: 이 작은 operation의 비용이 실제로 줄었는가?
- end-to-end measurement: 이 변화가 real request의 bottleneck과 latency/throughput을 개선했는가?

성능 PR에는 둘을 가능하면 연결한다. Micro 결과와 CPU counter로 local mechanism을 확인하고, representative workload와 production trace에서 전체 효과를 다시 검증한다. 숫자가 좋아졌다는 사실보다 **어떤 병목을 어떤 증거로 개선했는지**가 중요하다.
