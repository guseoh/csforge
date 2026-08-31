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
    relationNote: HotSpot heap 설정과 process/native memory 관찰 경계 확인
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

JVMS에서는 객체와 배열을 heap에 할당하는 추상 모델을 정의합니다. HotSpot collector가 heap을 관리하고 unreachable 객체 storage를 회수할 수 있습니다.

대표적인 heap 관찰값은:

- committed heap
- used heap
- maximum heap
- young/old generation 또는 collector별 region 상태

등입니다.

GC 로그나 heap dump는 주로 이 Java heap 문제를 분석하는 evidence입니다.

하지만 process memory가 커졌다고 항상 heap dump부터 보면 안 됩니다.

### Metaspace는 HotSpot의 class metadata 관리 영역이다

JVMS에는 **method area**라는 논리적 영역이 있지만, HotSpot에서는 class metadata를 관리하기 위해 metaspace라는 구현 영역을 사용합니다.

```text
JVMS concept: Method Area
HotSpot implementation: Metaspace 등으로 class metadata 관리
```

둘을 완전히 같은 specification 용어로 쓰지 않습니다.

ClassLoader가 계속 새 class를 정의하고 이전 loader가 unload되지 않으면 metaspace 사용량이 증가할 수 있습니다. Application server redeploy, dynamic proxy/class generation, plugin system에서 class loader lifecycle이 중요한 이유입니다.

Metaspace 부족은 heap이 충분해도 별도의 `OutOfMemoryError`로 나타날 수 있습니다.

### thread 하나도 메모리와 OS 자원을 사용한다

Platform thread는 OS thread와 밀접하게 연결되고 thread stack을 위한 자원이 필요합니다.

```text
100 threads
   │
   ├─ stack/resource per thread
   └─ scheduler/native structures
```

Thread 수가 수천 개로 늘면 heap 객체뿐 아니라 thread stack reservation, native thread 생성 한도, scheduler 부담을 함께 봐야 합니다.

`-Xss`는 thread stack 크기와 관련된 옵션이지만, 단순히 작게 만들면 thread 수를 무제한 늘릴 수 있다는 뜻은 아닙니다. 너무 작으면 깊은 호출에서 `StackOverflowError` 위험이 커질 수 있습니다.

Virtual thread는 platform thread와 다른 비용 구조를 가지므로 "thread 10만 개 = platform stack 10만 개" 식으로 그대로 계산하면 안 됩니다. 그렇다고 virtual thread가 메모리를 전혀 사용하지 않는 것도 아닙니다.

### DirectByteBuffer는 Java object와 backing memory 위치를 구분해야 한다

```java
ByteBuffer buffer = ByteBuffer.allocateDirect(1024 * 1024);
```

`ByteBuffer` Java 객체 자체는 heap에서 관리되는 참조 구조를 가질 수 있지만, direct buffer의 backing storage는 heap 밖 native memory를 사용할 수 있습니다.

```text
Heap
 └─ DirectByteBuffer object
          │
          ▼
Native memory backing storage
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

HotSpot에서는 Native Memory Tracking(NMT)을 활성화한 환경에서 `jcmd VM.native_memory` 같은 진단이 도움이 될 수 있습니다. 다만 NMT 자체도 JVM option과 overhead가 있는 구현 도구이므로 운영 설정을 확인해야 합니다.

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
3. metaspace와 JVMS method area의 층위를 구분합니다.
4. platform thread 수와 stack/native resource를 함께 봅니다.
5. direct buffer backing memory가 heap 밖일 수 있음을 확인합니다.
6. OOM message를 보고 부족한 resource 영역을 좁힙니다.
7. container limit에는 heap 외 영역을 위한 여유가 필요한지 봅니다.

### 면접에서 설명한다면

Java process memory는 heap만으로 구성되지 않습니다. HotSpot에서는 class metadata를 위한 metaspace, platform thread stack, JIT code cache, direct buffer와 JVM/native allocation 등이 process memory를 사용합니다. 그래서 `-Xmx`는 전체 process memory 상한이 아니며 heap 사용량은 안정적인데 RSS가 증가하면 native/direct/thread/metaspace 영역을 따로 확인해야 합니다. 실제 OOM도 error message와 JVM 진단 자료를 보고 어느 resource가 부족한지 구분해야 합니다.