---
kind: concept
contentKey: java.core.jvm-runtime.jit-hotspot-warmup
topicContentKey: java.core.jvm-runtime
slug: jit-hotspot-warmup
title: "JIT, HotSpot, and warm-up"
summary: "JIT, profiling, tiered compilation, warm-up 같은 설명을 HotSpot/JVM implementation behavior로 범위를 명시하고 benchmark 결과에 미치는 영향을 이해한다"
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
# JIT·HotSpot·warm-up

## 쉬운 진입

처음 호출은 느리고 같은 method를 반복 호출한 뒤 빨라지는 현상이 있을 수 있다.
실행 중 runtime이 자주 실행되는 code를 관찰하고 최적화된 native code로 바꾸는 JIT
컴파일과 warm-up 때문이다. 이 설명은 Java language 규칙이 아니라 특정 JVM
implementation 동작으로 범위를 표시해야 한다.

## 정확한 메커니즘

HotSpot은 interpreter 실행과 여러 compilation tier, profiling 결과를 조합할 수 있다.
자주 호출되는 method나 loop는 최적화 대상이 되고, assumptions가 깨지면 deoptimization이
일어날 수 있다. 정확한 tier threshold, code cache, compiler 선택은 JVM 버전과 flag의
구현 세부다. JVMS는 bytecode를 실행할 의미를 정의하지만 “몇 번 호출하면 native로
컴파일된다”는 수치를 보장하지 않는다.

짧은 한 번의 측정은 class loading, allocation, JIT warm-up, GC, OS noise를 결과에
섞는다. 반대로 warm-up 구간을 숨긴다고 모든 실험이 production을 대표하는 것도
아니다. 무엇을 측정하고 어느 JVM/flag에서 관찰했는지 기록하는 것이 핵심이며, 이
Concept은 완전한 성능 방법론보다 implementation 경계와 해석에 집중한다.

## 흔한 오해

- javac의 bytecode 생성과 runtime JIT compilation은 같은 단계가 아니다.
- HotSpot의 현재 최적화 정책을 JVMS가 보장하는 Java semantics로 설명할 수 없다.
- warm-up 후 빨라졌다는 사실만으로 알고리즘이나 모든 환경의 성능을 결론내릴 수 없다.
