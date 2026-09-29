---
kind: concept
contentKey: java.core.jvm-runtime.heap-metaspace-native-thread-memory
topicContentKey: java.core.jvm-runtime
slug: heap-metaspace-native-thread-memory
title: "힙(Heap)·Metaspace·네이티브 메모리·스레드 메모리"
summary: "Java 프로세스의 메모리를 힙 하나로만 보지 않고 Metaspace·스레드 스택·직접·네이티브 메모리 할당과 구분해 OOM과 RSS 증가를 진단한다"
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
# 힙(Heap)·Metaspace·네이티브 메모리·스레드 메모리

Java 프로세스의 메모리를 `-Xmx` 하나로 설명하면 운영 상황을 잘못 판단하기 쉽습니다. `-Xmx`는 Java 힙의 최대 크기와 관련된 설정이지 **프로세스 RSS 전체의 상한**이 아닙니다. JVM은 힙 밖에서도 클래스 메타데이터, 스레드 스택, direct buffer, JIT 코드 캐시와 여러 네이티브 구조에 메모리를 사용합니다.

![Java 프로세스 메모리와 힙 밖 영역](/learning/java/jvm-process-memory.svg)

### 프로세스 메모리와 Java 힙을 먼저 구분한다

```text
Java 프로세스
├─ Java 힙
├─ Metaspace / 클래스 메타데이터
├─ 스레드 스택
├─ 코드 캐시
├─ 다이렉트 버퍼(Direct buffer)의 실제 저장 메모리
└─ JVM/JDK/네이티브 메모리 할당
```

따라서 다음과 같은 상태는 그 자체로 모순이 아닙니다.

```text
-Xmx = 1 GB
Process RSS = 1.5 GB
```

힙 밖의 영역도 메모리를 사용하기 때문입니다.

### 힙은 JVM의 객체 저장 영역이며 수집기가 관리한다

JVMS의 추상 모델에서는 클래스 인스턴스와 배열이 힙에 할당되고 자동 메모리 관리 시스템(automatic storage management system)이 메모리를 회수할 수 있습니다. HotSpot에서는 선택한 수집기가 실제 힙을 관리합니다.

GC 로그, 힙 사용량 지표, 힙 덤프는 **Java 힙의 객체 그래프**를 분석하는 데 유용합니다. 하지만 RSS가 증가했다는 이유만으로 힙 덤프부터 수집하면 네이티브 메모리·스레드·클래스 메타데이터 문제를 놓칠 수 있습니다.

### Method area와 Metaspace는 같은 명세 용어가 아니다

JVMS는 클래스 수준 구조를 위한 **method area**라는 논리적 실행 영역을 정의하지만 물리적 위치나 구현 방법을 강제하지 않습니다.

HotSpot은 클래스 메타데이터를 네이티브 메모리에서 관리하며 이 구현 영역을 Metaspace라고 부릅니다.

```text
JVMS:    method area라는 추상 계약
HotSpot: class metadata를 Metaspace 등으로 구현
```

따라서 "method area = Metaspace"라고 두 용어를 같은 개념처럼 설명하면 명세와 구현을 혼동하게 됩니다.

`ClassLoader`가 계속 새 클래스를 정의하고 이전 로더가 도달 가능한 상태로 남으면 클래스 메타데이터도 오래 유지될 수 있습니다. 이 경우 힙 공간이 충분해도 `OutOfMemoryError: Metaspace` 같은 문제가 발생할 수 있습니다.

### 플랫폼 스레드도 프로세스 자원을 사용한다

JVMS는 스레드마다 전용 JVM 스택이 존재하는 추상 모델을 정의합니다. HotSpot의 플랫폼 스레드는 일반적으로 OS 스레드와 연결되므로 스택과 네이티브 스레드 자원을 사용합니다.

```text
플랫폼 스레드 증가
   ├─ 스레드 스택·자원 사용 증가
   └─ OS 스케줄링 부담 증가
```

`-Xss`를 줄였다고 스레드를 무제한 만들 수 있는 것은 아닙니다. 스택이 너무 작으면 깊은 호출에서 `StackOverflowError` 위험이 커지고, OS와 네이티브 스레드 자원에도 별도 한계가 있습니다.

가상 스레드는 플랫폼 스레드와 비용 구조가 다르므로 같은 계산식을 적용하면 안 됩니다. 다만 가상 스레드도 자원을 전혀 쓰지 않는 것은 아닙니다.

### Direct buffer는 Java 객체와 실제 저장 메모리를 나누어 본다

```java
ByteBuffer buffer = ByteBuffer.allocateDirect(1024 * 1024);
```

이때 `ByteBuffer` 객체와 실제 direct buffer 저장 메모리는 같은 메모리 영역에 있지 않을 수 있습니다. Direct buffer는 힙 밖의 네이티브 메모리를 사용할 수 있으므로, 힙 사용량은 안정적인데 RSS가 증가할 때 확인해야 합니다.

### RSS 증가를 힙 누수 하나로 단정하지 않는다

운영에서는 다음 관계를 비교합니다.

```text
프로세스 RSS / 컨테이너 메모리
        │
        ├─ 힙 사용량·확정량
        ├─ Metaspace
        ├─ 스레드 수
        ├─ 다이렉트 버퍼(Direct buffer)
        └─ 네이티브/JVM 메모리
```

힙 사용량과 생존 객체 집합(live set)이 함께 증가한다면 힙 객체가 계속 참조되는지 먼저 살펴볼 수 있습니다. 반대로 힙은 안정적인데 RSS만 증가한다면 Metaspace, 스레드, direct·네이티브 메모리를 따로 확인해야 합니다.

### NMT는 HotSpot 내부 네이티브 메모리를 보는 도구다

HotSpot Native Memory Tracking(NMT)을 활성화하면 `jcmd VM.native_memory`로 JVM 내부 네이티브 메모리 항목별 예약·확정량(reservation·commit)을 관찰할 수 있습니다.

하지만 NMT 결과를 프로세스 RSS 전체와 동일시하면 안 됩니다. Java 25 HotSpot 문서에 따르면 NMT는 **HotSpot VM 내부 메모리를 추적하지만 제3자 네이티브 코드와 JDK 클래스 라이브러리가 할당한 네이티브 메모리는 추적하지 않습니다.**

```text
RSS 증가
  ├─ NMT 항목 증가
  │      -> HotSpot 내부가 원인일 가능성
  └─ NMT로 설명되지 않음
         -> JDK·제3자 네이티브 코드, mmap 등을 추가 확인
```

NMT는 기본적으로 꺼져 있어 JVM 시작 옵션이 필요합니다. 따라서 장애가 난 뒤 즉시 모든 정보를 복원할 수 있는 만능 도구는 아닙니다.

### 컨테이너 제한에는 힙 밖 메모리 여유도 필요하다

```text
컨테이너 제한 2 GB
├─ 최대 힙 2 GB
├─ Metaspace
├─ 스레드
├─ Direct·네이티브 메모리
└─ JVM 오버헤드
```

이 설정은 힙 밖의 영역에 메모리를 배정할 여지가 거의 없어 컨테이너 제한을 넘길 수 있습니다. 실제 크기를 정할 때는 힙뿐 아니라 비힙·네이티브 메모리 사용량을 측정해 여유를 둡니다. "컨테이너 메모리의 몇 퍼센트를 힙에 할당한다"는 고정 비율보다 실제 작업 부하의 측정 근거가 우선입니다.

### 정리

Java 프로세스 메모리는 heap 하나로 이루어지지 않습니다. JVMS의 heap·stack·method area 같은 논리적 영역과 HotSpot의 Metaspace, 플랫폼 스레드 자원, direct/native 메모리 할당, code cache 같은 구현 영역을 구분해야 합니다. 따라서 `-Xmx`는 프로세스 전체 메모리 상한이 아닙니다. heap이 안정적인데 RSS가 증가하면 다른 영역을 따로 살펴야 합니다. NMT도 유용하지만 HotSpot 내부 네이티브 메모리만 다루는 도구라는 한계를 함께 이해해야 합니다.
