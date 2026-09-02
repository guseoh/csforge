---
kind: concept
contentKey: java.core.jvm-runtime.heap-metaspace-native-thread-memory
topicContentKey: java.core.jvm-runtime
slug: heap-metaspace-native-thread-memory
title: "Heap, metaspace, native, and thread memory"
summary: "Java process의 메모리를 heap 하나로 보지 않고 metaspace·thread stack·direct/native allocation과 구분해 OOM과 RSS 증가를 진단한다"
level: 3
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html"
    title: "Java SE 25 JVMS Chapter 2: The Structure of the JVM"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: heap·stack·method area 추상 영역 확인
  - url: "https://docs.oracle.com/en/java/javase/25/gctuning/"
    title: "Java SE 25 HotSpot VM Garbage Collection Tuning Guide"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: HotSpot heap·metaspace와 collector 구현 범위 확인
  - url: "https://docs.oracle.com/en/java/javase/25/vm/native-memory-tracking.html"
    title: "Java SE 25 HotSpot VM: Native Memory Tracking"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: NMT가 추적하는 HotSpot 내부 native memory 범위와 한계 확인
---
# Java 프로세스 메모리는 heap만 보면 될까

운영 서버에서 컨테이너 메모리가 2GB인데 `-Xmx1g`로 설정했으니 절대 1GB를 넘지 않을 것이라고 생각하면 위험합니다. `Xmx`는 Java heap의 최대 크기와 관련된 설정이지 **Java process 전체 메모리 사용량의 상한**이 아닙니다.

JVM process는 heap 외에도 class metadata, thread stack, direct buffer, JIT/code cache, JVM 자체 native allocation 등 여러 곳에서 메모리를 사용합니다.

### 먼저 process 전체와 Java heap을 구분한다

```text
Java Process Memory
├─ Java Heap
├─ Metaspace / class metadata
├─ Thread stacks
├─ Code cache / JIT 관련 영역
├─ Direct buffer
├─ JVM native structures
└─ native library allocation 등
```

운영체제가 보는 RSS와 JVM heap 사용량이 서로 다른 이유입니다.

```text
-Xmx = 1 GB
Process RSS = 1.6 GB
```

이 자체가 이상한 현상은 아닙니다. Heap 밖의 memory consumer가 존재할 수 있습니다.

### Heap은 일반 Java 객체가 논리적으로 할당되는 JVM 영역이다

JVMS에서는 모든 class instance와 array의 memory가 heap에서 할당되는 추상 실행 모델을 정의합니다. Heap storage는 automatic storage management system, 즉 GC가 회수하며 JVMS는 특정 GC 알고리즘이나 물리적 heap layout을 요구하지 않습니다.

HotSpot에서는 선택한 collector가 이 heap을 관리합니다. 대표적인 heap 관찰값은:

- committed heap
- used heap
- maximum heap
- young/old generation 또는 collector별 region 상태

등입니다.

GC 로그나 heap dump는 주로 이 Java heap 문제를 분석하는 evidence입니다.

하지만 process memory가 커졌다고 항상 heap dump부터 보면 안 됩니다.

### Metaspace는 HotSpot의 class metadata 관리 영역이다

JVMS에는 **method area**라는 논리적 영역이 있지만 그 물리적 위치나 관리 정책을 규정하지 않습니다. HotSpot에서는 class metadata를 native memory에 저장하고 이 구현 영역을 metaspace라고 부릅니다.

```text
JVMS concept: Method Area
HotSpot implementation: native-memory 기반 Metaspace 등으로 class metadata 관리
```

둘을 완전히 같은 specification 용어로 쓰지 않습니다.

ClassLoader가 계속 새 class를 정의하고 이전 loader와 그 class가 unload되지 않으면 metaspace 사용량이 증가할 수 있습니다. Application server redeploy, dynamic proxy/class generation, plugin system에서 class loader lifecycle이 중요한 이유입니다.

HotSpot의 class metadata용 native memory가 부족하거나 설정된 `MaxMetaspaceSize` 한계를 넘으면 heap이 충분해도 `OutOfMemoryError: Metaspace`가 나타날 수 있습니다.

### thread 하나도 메모리와 OS 자원을 사용한다

JVMS는 각 JVM thread마다 private JVM stack이 존재한다고 정의하고, 구체적인 stack 크기·연속성·구현 방식에는 자유를 둡니다. HotSpot의 platform thread는 일반적으로 OS thread와 연결되므로 stack과 native thread resource가 필요합니다.

```text
100 platform threads
   │
   ├─ stack/resource per thread
   └─ scheduler/native structures
```

Thread 수가 수천 개로 늘면 heap 객체뿐 아니라 thread stack reservation/commit, native thread 생성 한도, scheduler 부담을 함께 봐야 합니다.

`-Xss`는 HotSpot/JDK 실행에서 thread stack 크기와 관련된 옵션이지만, 단순히 작게 만들면 thread 수를 무제한 늘릴 수 있다는 뜻은 아닙니다. 너무 작으면 깊은 호출에서 `StackOverflowError` 위험이 커질 수 있습니다.

Virtual thread는 platform thread와 다른 비용 구조를 가지므로 "thread 10만 개 = platform stack 10만 개" 식으로 그대로 계산하면 안 됩니다. 그렇다고 virtual thread가 메모리를 전혀 사용하지 않는 것도 아닙니다.

### DirectByteBuffer는 Java object와 backing memory 위치를 구분해야 한다

```java
ByteBuffer buffer = ByteBuffer.allocateDirect(1024 * 1024);
```

`ByteBuffer` Java 객체 자체와 direct buffer가 사용하는 backing storage는 같은 메모리 층위가 아닐 수 있습니다. HotSpot/JDK의 direct buffer는 heap 밖의 native memory를 사용할 수 있습니다.

```text
Java heap의 buffer object/reference
          │
          ▼
heap 밖 backing storage
```

그래서 heap 사용량은 낮은데 process RSS가 계속 증가하는 상황에서 direct/native memory를 확인할 필요가 있습니다.

Direct buffer의 실제 회수 timing을 일반 객체의 명시적 `free`처럼 가정하면 안 됩니다. Java reference lifecycle과 native backing resource 관리가 연결되어 있다는 점을 이해해야 합니다.

### JIT compiler와 code cache도 process memory를 사용한다

HotSpot은 자주 실행되는 code를 native machine code로 JIT compile할 수 있습니다. 생성된 compiled code와 관련 metadata를 보관하는 code cache도 process memory의 일부입니다.

일반적인 backend에서 code cache가 첫 번째 OOM 원인인 경우가 흔한 것은 아니지만, process memory를 "heap + metaspace 두 개"로만 설명하지 않기 위해 알아둘 필요가 있습니다.

### RSS가 높을 때 진단 순서를 나눈다

예를 들어 컨테이너 memory limit에 가까워지고 있다고 해 보겠습니다.

먼저 다음을 비교합니다.

```text
Process RSS / container memory
        │
        ├─ Heap used/committed
        ├─ Metaspace
        ├─ Thread count
        ├─ Direct buffer usage
        └─ Native/JVM memory
```

**Heap used가 같이 증가**한다면 object allocation/leak을 우선 의심할 수 있습니다.

**Heap은 안정적인데 RSS만 증가**한다면 native/direct/thread/class metadata 등 다른 영역을 확인해야 합니다.

### NMT는 강력하지만 process native memory 전체를 보여 주는 도구는 아니다

HotSpot에서는 Native Memory Tracking(NMT)을 활성화한 환경에서 `jcmd VM.native_memory`로 JVM/HotSpot 내부 native-memory category와 reservation/commit을 관찰할 수 있습니다.

하지만 NMT의 범위를 process RSS 전체와 동일시하면 안 됩니다. Java 25 HotSpot 문서는 NMT가 **HotSpot VM 내부 메모리 사용을 추적하며 third-party native code와 JDK class library의 native allocation은 추적하지 않는다**고 명시합니다. 따라서:

```text
RSS 증가
  ├─ NMT category 증가       -> HotSpot 내부 후보 추적
  └─ NMT로 설명되지 않는 증가 -> third-party/JDK native, mmap 등 다른 근거도 확인
```

처럼 해석해야 합니다.

NMT는 기본적으로 꺼져 있고 활성화 수준에 따른 overhead가 있으므로, 운영에서 사용할 때는 시작 option과 측정 비용도 확인합니다.

### `-Xmx`와 container limit 사이에는 여유가 필요하다

Container memory limit이 2GB인데 `-Xmx2g`를 주면 heap만 최대 2GB를 사용할 수 있고 heap 밖 memory가 추가로 필요합니다.

```text
Container limit 2 GB
├─ Heap max 2 GB
├─ Threads
├─ Metaspace
├─ Direct/native
└─ JVM overhead

=> 전체가 limit을 넘을 가능성
```

그래서 실제 배포에서는 heap 최대값만 채우지 말고 non-heap/native 영역의 여유를 두고 관찰합니다.

정확한 sizing 비율은 workload와 JVM 설정에 따라 다르므로 "컨테이너의 70%가 항상 정답" 같은 고정 규칙으로 만들지 않습니다.

### OOM 메시지가 말하는 영역을 읽는다

`OutOfMemoryError`라고 모두 같은 원인은 아닙니다.

예를 들어:

- Java heap space
- Metaspace
- unable to create native thread
- direct buffer/native resource 관련 문제

처럼 증상이 달라질 수 있습니다.

Error 이름 하나보다 **어느 resource가 부족했다고 JVM이 말하는지** 확인합니다.

### 문제를 풀 때 확인할 것

1. process RSS와 heap used를 같은 숫자로 보지 않습니다.
2. `Xmx`가 process 전체 memory limit인지 확인합니다. 그렇지 않습니다.
3. JVMS method area와 HotSpot metaspace의 층위를 구분합니다.
4. platform thread 수와 stack/native resource를 함께 봅니다.
5. direct buffer backing memory가 heap 밖일 수 있음을 확인합니다.
6. NMT가 HotSpot 내부 native memory만 추적하고 process native allocation 전체를 포괄하지 않음을 기억합니다.
7. OOM message를 보고 부족한 resource 영역을 좁힙니다.
8. container limit에는 heap 외 영역을 위한 여유가 필요한지 봅니다.

### 면접에서 설명한다면

Java process memory는 heap만으로 구성되지 않습니다. JVMS는 heap·JVM stack·method area 같은 논리적 runtime 영역을 정의하지만 구체적인 물리 배치는 JVM 구현에 맡깁니다. HotSpot에서는 class metadata를 위한 metaspace, platform thread 관련 stack/native resource, JIT code cache, direct/native allocation 등이 process memory를 사용합니다. 그래서 `-Xmx`는 전체 process memory 상한이 아니며 heap 사용량은 안정적인데 RSS가 증가하면 다른 영역을 따로 확인해야 합니다. NMT도 유용하지만 HotSpot 내부 native memory를 추적하는 도구라 third-party/JDK native allocation까지 process 전체를 설명하지는 않습니다.
