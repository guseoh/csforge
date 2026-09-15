---
kind: concept
contentKey: java.core.jvm-runtime.heap-metaspace-native-thread-memory
topicContentKey: java.core.jvm-runtime
slug: heap-metaspace-native-thread-memory
title: "Heap·Metaspace·Native·Thread 메모리"
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
# Heap·Metaspace·Native·Thread 메모리

Java 프로세스의 메모리를 `-Xmx` 하나로 설명하면 운영에서 쉽게 오판합니다. `-Xmx`는 Java heap의 최대 크기와 관련된 설정이지 **process RSS 전체의 상한**이 아닙니다. JVM은 heap 밖에서도 class metadata, thread stack, direct buffer, JIT code cache와 여러 native structure에 메모리를 사용합니다.

![Java process memory와 heap 밖 영역](/learning/java/jvm-process-memory.svg)

### Process memory와 Java heap을 먼저 구분한다

```text
Java Process
├─ Java Heap
├─ Metaspace / class metadata
├─ Thread stacks
├─ Code cache
├─ Direct buffer backing memory
└─ JVM/JDK/native allocations
```

따라서 다음과 같은 상태는 그 자체로 모순이 아닙니다.

```text
-Xmx = 1 GB
Process RSS = 1.5 GB
```

Heap 외 영역이 추가로 메모리를 사용하기 때문입니다.

### Heap은 JVM의 객체 저장 영역이고 collector가 관리한다

JVMS의 추상 모델에서는 class instance와 array가 heap에 할당되고 automatic storage management system이 storage를 회수할 수 있습니다. HotSpot에서는 선택한 collector가 실제 heap을 관리합니다.

GC log, heap usage metric, heap dump는 이 **Java heap object graph**를 분석하는 데 유용합니다. 하지만 RSS가 증가했다는 이유만으로 heap dump부터 수집하면 native/thread/class metadata 문제를 놓칠 수 있습니다.

### Method area와 Metaspace는 같은 specification 용어가 아니다

JVMS는 class-level 구조를 위한 **method area**라는 논리적 runtime 영역을 정의하지만 물리적 위치나 구현 방법을 강제하지 않습니다.

HotSpot은 class metadata를 native memory에 관리하며 이 구현 영역을 Metaspace라고 부릅니다.

```text
JVMS:    method area라는 추상 계약
HotSpot: class metadata를 Metaspace 등으로 구현
```

그래서 "method area = metaspace"라고 완전히 같은 개념처럼 설명하면 specification과 구현을 섞게 됩니다.

ClassLoader가 계속 새 class를 정의하고 이전 loader가 reachable하게 남으면 class metadata도 오래 유지될 수 있습니다. 이 경우 heap이 충분해도 `OutOfMemoryError: Metaspace` 같은 문제가 발생할 수 있습니다.

### Platform thread도 process resource를 사용한다

JVMS는 각 thread마다 private JVM stack이 존재하는 추상 모델을 정의합니다. HotSpot의 platform thread는 일반적으로 OS thread와 연결되므로 stack과 native thread resource를 사용합니다.

```text
platform thread 증가
   ├─ thread stack/resource 증가
   └─ OS scheduling 부담 증가
```

`-Xss`를 줄였다고 thread를 무제한 만들 수 있는 것은 아닙니다. Stack이 너무 작으면 깊은 호출에서 `StackOverflowError` 위험이 커질 수 있고, OS/native thread resource도 별도 한계를 가집니다.

Virtual thread는 platform thread와 비용 구조가 다르므로 같은 계산식을 적용하면 안 되지만, virtual thread 역시 완전히 0-cost resource는 아닙니다.

### Direct buffer는 Java object와 backing memory를 분리해서 본다

```java
ByteBuffer buffer = ByteBuffer.allocateDirect(1024 * 1024);
```

이때 `ByteBuffer`를 가리키는 Java object/reference와 실제 direct backing storage는 같은 메모리 층위가 아닐 수 있습니다. Direct buffer는 heap 밖 native memory를 사용할 수 있으므로 heap used는 안정적인데 RSS가 증가하는 상황에서 확인할 대상이 됩니다.

### RSS 증가를 heap leak 하나로 단정하지 않는다

운영에서는 다음 관계를 비교합니다.

```text
Process RSS / container memory
        │
        ├─ Heap used/committed
        ├─ Metaspace
        ├─ Thread count
        ├─ Direct buffer
        └─ Native/JVM memory
```

Heap used와 live set이 함께 증가한다면 heap object retention을 우선 볼 수 있습니다. 반대로 heap은 안정적인데 RSS만 증가한다면 metaspace, thread, direct/native memory를 따로 확인해야 합니다.

### NMT는 HotSpot 내부 native memory를 보는 도구다

HotSpot Native Memory Tracking(NMT)을 활성화한 환경에서는 `jcmd VM.native_memory`로 JVM 내부 native memory category의 reservation/commit을 관찰할 수 있습니다.

그러나 NMT 결과를 process RSS 전체와 동일시하면 안 됩니다. Java 25 HotSpot 문서는 NMT가 **HotSpot VM 내부 메모리를 추적하며 third-party native code와 JDK class library의 native allocation은 추적하지 않는다**고 명시합니다.

```text
RSS 증가
  ├─ NMT category 증가
  │      -> HotSpot 내부 후보
  └─ NMT로 설명 안 됨
         -> JDK/third-party native, mmap 등 추가 확인
```

NMT는 기본적으로 꺼져 있고 시작 옵션이 필요하므로 장애가 발생한 뒤 즉석에서 모든 정보를 복원할 수 있는 만능 도구도 아닙니다.

### Container limit에는 heap 밖 여유도 필요하다

```text
Container limit 2 GB
├─ Heap max 2 GB
├─ Metaspace
├─ Threads
├─ Direct/native
└─ JVM overhead
```

이 설정은 heap 외 영역이 사용할 여지가 거의 없으므로 container limit을 넘길 수 있습니다. 실제 sizing에서는 heap뿐 아니라 non-heap/native 사용량을 측정해 여유를 둡니다. "컨테이너 메모리의 몇 %를 heap으로 둔다"는 고정 비율보다 workload evidence가 우선입니다.

### 정리

Java process memory는 heap 하나가 아닙니다. JVMS의 heap·stack·method area 같은 논리적 영역과 HotSpot의 Metaspace, platform thread resource, direct/native allocation, code cache 같은 구현 영역을 구분해야 합니다. 그래서 `-Xmx`는 process 전체 memory 상한이 아니며 heap이 안정적인데 RSS가 증가하면 다른 영역을 따로 봐야 합니다. NMT도 강력하지만 HotSpot 내부 native memory 범위의 도구라는 한계를 함께 이해해야 합니다.
