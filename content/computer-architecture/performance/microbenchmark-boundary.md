---
kind: concept
contentKey: computer-architecture.core.performance.microbenchmark-boundary
topicContentKey: computer-architecture.core.performance
slug: microbenchmark-boundary
title: "마이크로벤치마크의 측정 경계(Microbenchmark Boundary)"
summary: "작은 벤치마크가 무엇을 측정할 수 있고 JIT·dead-code elimination·캐시 상태·OS 잡음 때문에 어떤 오판을 만들 수 있는지 설명한다."
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
# 마이크로벤치마크의 측정 경계(Microbenchmark Boundary)

마이크로벤치마크는 작은 연산이나 코드 경로의 비용을 통제된 조건에서 비교하는 실험이다. 범위를 좁히면 다른 입출력과 외부 변수를 줄이고 명령어, 캐시, 할당 같은 국소 메커니즘을 자세히 볼 수 있다.

하지만 작은 벤치마크에서 빨라졌다는 결과가 전체 프로그램도 같은 비율로 빨라졌다는 뜻은 아니다. 마이크로벤치마크는 **측정한 작은 경로에 대한 증거**다.

### JVM에서는 단순한 반복 측정이 쉽게 왜곡된다

JIT 컴파일러는 실행 중 코드를 최적화한다. 충분히 사용되지 않는 계산은 dead-code elimination으로 제거될 수 있고, 상수로 계산 가능한 작업은 constant folding될 수 있다.

```java
for (int i = 0; i < 1_000_000; i++) {
    expensiveComputation();
}
```

결과가 프로그램에서 관찰되지 않는다면 컴파일러가 실제로 측정하려던 작업을 제거할 가능성을 검토해야 한다. 첫 실행에는 클래스 로딩과 JIT 컴파일이 섞이고, 이후에는 컴파일된 코드와 예열된 캐시가 사용될 수도 있다.

JMH 같은 벤치마크 하네스는 워밍업, 측정 반복, fork, 상태와 결과 소비를 구조화해 이런 함정을 줄이는 데 도움을 준다.

### 하드웨어 상태도 결과를 바꾼다

캐시가 예열되어 있는지, 분기 예측기의 이력이 어떤지, CPU 주파수와 온도 상태가 어떤지, 다른 프로세스가 CPU를 사용하고 있는지에 따라 작은 벤치마크 결과가 달라질 수 있다.

그래서 입력 크기와 분포, 스레드 수, 워밍업, 런타임 버전과 장비 조건을 기록해야 한다. 개선 전후 환경이 다르면 작은 차이는 코드가 아니라 환경 변화 때문일 수 있다.

### 마이크로벤치마크와 전체 성능 측정은 다른 질문이다

```text
microbenchmark
→ 작은 operation의 비용이 줄었는가?

end-to-end measurement
→ 그 operation의 개선이 전체 workload에서 의미 있는가?
```

암달의 법칙에서 보았듯 해당 연산이 전체 실행 시간에서 차지하는 비율이 작다면 국소적인 속도 향상이 커도 전체 효과는 제한된다.

따라서 마이크로벤치마크는 특정 하드웨어·런타임 메커니즘을 검증하는 데 사용하고, 전체 성능에 대한 결론은 대표 작업 부하의 별도 측정으로 확인해야 한다.
