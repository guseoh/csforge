---
kind: concept
contentKey: computer-architecture.core.performance.microbenchmark-boundary
topicContentKey: computer-architecture.core.performance
slug: microbenchmark-boundary
title: "Microbenchmark의 측정 경계"
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
# Microbenchmark의 측정 경계

Microbenchmark는 작은 operation이나 code path의 비용을 통제된 조건에서 비교하는 실험이다. 범위를 좁히면 다른 I/O와 외부 변수를 줄이고 instruction, cache, allocation 같은 local mechanism을 자세히 볼 수 있다.

하지만 작은 benchmark에서 빨라졌다는 결과가 전체 program도 같은 비율로 빨라졌다는 뜻은 아니다. Microbenchmark는 **측정한 작은 경로에 대한 증거**다.

### JVM에서는 단순한 반복 측정이 쉽게 왜곡된다

JIT compiler는 실행 중 code를 optimize한다. 충분히 사용되지 않는 계산은 dead-code elimination으로 제거될 수 있고, 상수로 계산 가능한 작업은 constant folding될 수 있다.

```java
for (int i = 0; i < 1_000_000; i++) {
    expensiveComputation();
}
```

결과가 program에서 관찰되지 않는다면 compiler가 실제로 측정하려던 work를 제거할 가능성을 검토해야 한다. 첫 실행에는 class loading과 JIT compilation이 섞이고, 이후에는 compiled code와 warmed cache가 사용될 수도 있다.

JMH 같은 benchmark harness는 warm-up, measurement iteration, fork, state와 result consumption을 구조화해 이런 함정을 줄이는 데 도움을 준다.

### Hardware state도 결과를 바꾼다

Cache가 warm한지 cold한지, branch predictor history가 어떤지, CPU frequency와 thermal state가 어떤지, 다른 process가 CPU를 사용하고 있는지에 따라 작은 benchmark 결과가 달라질 수 있다.

그래서 input size와 distribution, thread count, warm-up, runtime version과 machine 조건을 기록해야 한다. 개선 전후 환경이 다르면 작은 차이는 code가 아니라 환경 변화 때문일 수 있다.

### Microbenchmark와 전체 성능 측정은 다른 질문이다

```text
microbenchmark
→ 작은 operation의 비용이 줄었는가?

end-to-end measurement
→ 그 operation의 개선이 전체 workload에서 의미 있는가?
```

Amdahl's Law에서 보았듯 해당 operation이 전체 실행 시간에서 차지하는 비율이 작다면 local speedup이 커도 전체 효과는 제한된다.

따라서 microbenchmark는 특정 hardware/runtime mechanism을 검증하는 데 사용하고, 전체 성능에 대한 결론은 representative workload의 별도 측정으로 확인해야 한다.
