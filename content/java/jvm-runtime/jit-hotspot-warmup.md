---
kind: concept
contentKey: java.core.jvm-runtime.jit-hotspot-warmup
topicContentKey: java.core.jvm-runtime
slug: jit-hotspot-warmup
title: "JIT, HotSpot, and warm-up"
summary: "HotSpot이 실행 중 profiling과 JIT compilation으로 code를 최적화할 수 있다는 점과 warm-up·deoptimization이 benchmark 해석에 미치는 영향을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 110
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html"
    title: "Java SE 25 JVMS Chapter 2: The Structure of the JVM"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JVM execution model과 implementation 선택의 경계 확인
  - url: "https://docs.oracle.com/en/java/javase/25/vm/index.html"
    title: "Java SE 25 Java Virtual Machine Guide"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: HotSpot JIT·tiered compilation implementation 범위 확인
---
# 같은 Java 코드가 실행 중 더 빨라질 수 있는 이유

Java 프로그램을 아주 짧게 한 번 실행해 시간을 재면 첫 실행과 반복 실행의 성능이 다르게 나올 수 있습니다. 이유 중 하나는 HotSpot JVM이 프로그램을 실행하면서 어떤 code가 자주 쓰이는지 관찰하고, 그 정보를 바탕으로 **더 최적화된 native code를 JIT(Just-In-Time) compile**할 수 있기 때문입니다.

이 동작은 Java language가 보장하는 문법 규칙이 아니라 JVM implementation, 특히 HotSpot의 실행 전략으로 이해해야 합니다.

### `javac` compile과 JIT compile은 다른 단계다

먼저 전체 흐름을 나눕니다.

```text
개발/빌드 시점
Java source
   │ javac
   ▼
class file / bytecode

실행 시점
class bytecode
   │
   ├─ interpreter로 실행 가능
   │
   └─ HotSpot JIT가 native code로 compile 가능
          │
          ▼
        CPU 실행
```

`javac`가 `.class`를 만드는 compile과 실행 중 JIT가 native machine code를 만드는 compile을 같은 단계로 부르면 안 됩니다.

### 처음에는 profiling 정보가 충분하지 않다

프로그램을 실행하기 전에는 runtime이 어떤 method와 branch가 실제로 자주 실행되는지 완전히 알 수 없습니다.

예를 들어:

```java
if (user.isPremium()) {
    premiumPath();
} else {
    normalPath();
}
```

실제 운영에서는 99%가 `normalPath()`일 수도 있습니다. HotSpot은 실행 중 얻은 profiling information을 바탕으로 자주 실행되는 path와 call site를 최적화할 수 있습니다.

```text
초기 실행
 └─ runtime profile 수집
      ├─ method 호출 빈도
      ├─ branch 경향
      └─ 실제 type 관찰 등
              │
              ▼
        optimization 판단
```

정확히 어떤 profile을 어떻게 사용하고 어느 threshold에서 compile하는지는 HotSpot version과 설정의 구현 영역입니다.

### tiered compilation은 빠른 시작과 높은 최적화를 함께 노린다

HotSpot은 여러 compilation level을 조합하는 tiered compilation 전략을 사용할 수 있습니다. 처음부터 가장 비싼 최적화를 모든 method에 수행하면 startup 비용이 커질 수 있기 때문에, 실행 정보가 쌓이는 동안 더 빠른 compilation 단계와 더 공격적인 최적화 단계를 조합합니다.

학습할 때 중요한 것은 compiler 이름과 threshold 숫자를 외우는 것이 아닙니다.

```text
처음
 interpreter / 낮은 비용 실행
       │
       │ profiling / hot code 발견
       ▼
더 최적화된 compiled code
```

이것이 "warm-up 후 빨라질 수 있다"는 현상의 한 배경입니다.

### JIT는 실제 type을 보고 virtual call을 최적화할 수 있다

Java source에서 polymorphic method call이라고 해서 runtime이 매번 같은 비용으로 복잡한 lookup을 해야 하는 것은 아닙니다.

특정 call site에서 실제로 한 type만 반복 관찰된다면 HotSpot은 그 가정 아래 inline 같은 최적화를 할 수 있습니다.

```text
source
service.execute()

runtime profile
99.9% -> FastService

JIT
가정을 이용해 call 최적화 가능
```

하지만 이 최적화는 Java semantics를 바꾸는 것이 아닙니다. 다른 subtype이 등장해 기존 가정이 더 이상 맞지 않으면 JVM은 최적화를 취소하거나 다시 compile할 수 있습니다.

### deoptimization은 "JIT가 틀렸다"가 아니라 가정이 바뀐 상황을 처리한다

JIT compiler는 runtime profile을 이용해 speculative optimization을 할 수 있습니다. 기존 관찰에 기반한 가정이 깨지면 JVM이 최적화된 code에서 더 일반적인 실행 형태로 되돌아갈 수 있습니다. 이를 deoptimization 관점으로 이해할 수 있습니다.

```text
가정: call site에는 Type A만 온다
          │
       optimized
          │
Type B 등장
          │
          ▼
deoptimization / 새 최적화 가능
```

이 기능 덕분에 Java의 dynamic behavior를 유지하면서 runtime 정보 기반 최적화를 적용할 수 있습니다.

### warm-up은 단순히 "N번 돌리면 끝"이 아니다

Benchmark에서 warm-up은 class loading, JIT compilation, cache state 등 초기 실행 효과를 어느 정도 안정화하기 위한 과정입니다.

하지만:

> Java는 10,000번 실행하면 무조건 warm-up이 끝난다.

같은 고정 규칙은 없습니다.

Method의 실행 빈도, JVM version, code shape, workload에 따라 compilation timing이 달라질 수 있습니다. GC와 OS scheduling도 측정값에 영향을 줍니다.

그래서 직접 만든 다음 코드는 신뢰하기 어렵습니다.

```java
long start = System.nanoTime();
for (int i = 0; i < 1000; i++) {
    work();
}
System.out.println(System.nanoTime() - start);
```

Loop 자체가 최적화 대상이 될 수 있고, 결과를 사용하지 않으면 dead-code elimination 같은 영향을 받을 수도 있습니다.

### Microbenchmark에서는 JMH 같은 도구가 필요한 이유가 있다

JMH(Java Microbenchmark Harness)는 JVM warm-up, fork, measurement iteration과 compiler optimization 문제를 고려해 microbenchmark를 작성하도록 돕습니다.

그렇다고 JMH 결과가 곧 production API latency라는 뜻은 아닙니다.

```text
JMH
- 작은 Java operation의 상대 비용 측정에 유용

Production load test
- network, DB, thread pool, GC, real traffic까지 포함
```

측정하려는 질문에 맞는 도구를 선택합니다.

### startup과 steady-state 성능은 다른 질문이다

서버가 수일 동안 실행되는 경우 steady-state throughput이 중요할 수 있습니다. 반면 serverless/CLI처럼 프로세스가 짧게 실행된다면 startup과 warm-up 비용이 더 중요할 수 있습니다.

```text
Long-running server
startup ─ warm-up ───────── steady state ─────▶

Short-lived process
startup ─ run ─ exit
```

Warm-up을 제거한 benchmark만 보고 모든 환경에서 같은 결론을 내리면 안 됩니다.

### HotSpot 구현 설명을 Java specification과 구분한다

다음 내용은 서로 다른 층입니다.

- Java Language Specification: Java 프로그램의 의미
- JVM Specification: class file과 JVM 실행 모델
- HotSpot: interpreter/JIT/compiler/tiered compilation 같은 구체적인 JVM 구현
- CPU: 실제 native instruction 실행

"Java는 호출 10,000회 후 반드시 C2 compile한다" 같은 문장은 specification guarantee가 아닙니다. JVM version, flag, implementation에 따라 바뀔 수 있습니다.

### 문제를 풀 때 확인할 것

1. `javac` compile과 runtime JIT compile을 구분합니다.
2. 처음 실행과 반복 실행을 같은 상태로 가정하지 않습니다.
3. JIT가 runtime profile을 사용할 수 있다는 점을 확인합니다.
4. speculative optimization과 deoptimization을 함께 봅니다.
5. 특정 threshold/최적화 방식을 Java language guarantee로 말하지 않습니다.
6. microbenchmark와 실제 server workload를 구분합니다.
7. 무엇을 측정하는지에 따라 warm-up 포함 여부를 결정합니다.

### 면접에서 설명한다면

HotSpot JVM은 class bytecode를 실행하면서 profiling 정보를 수집하고 자주 실행되는 code를 JIT compile해 최적화된 native code로 실행할 수 있습니다. 실제 type이나 branch 경향을 이용해 speculative optimization을 할 수 있고 가정이 깨지면 deoptimization이 일어날 수도 있습니다. 그래서 Java benchmark에서는 warm-up과 JIT 상태가 결과에 영향을 주며, 구체적인 compilation threshold나 optimization 정책은 Java language가 아니라 JVM implementation의 영역입니다.