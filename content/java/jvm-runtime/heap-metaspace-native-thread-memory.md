---
kind: concept
contentKey: java.core.jvm-runtime.heap-metaspace-native-thread-memory
topicContentKey: java.core.jvm-runtime
slug: heap-metaspace-native-thread-memory
title: "Heap, metaspace, native, and thread memory"
summary: "Java process memory를 heap만으로 보지 않고 metaspace, native allocation, thread stack 등과 구분해 진단 관점에서 이해한다"
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
    relationNote: heap 설정과 native/process 관찰 경계 확인
---
# Heap·metaspace·native·thread memory

## 쉬운 진입

프로세스 RSS가 늘었다고 heap 객체가 같은 만큼 늘었다고 단정할 수 없다. Java process에는
heap, class metadata가 놓이는 metaspace, thread stack, JIT/code 영역, direct buffer와
native library allocation 같은 여러 사용처가 있다.

## 정확한 메커니즘

| 관찰 대상 | 의미 |
|---|---|
| heap | 일반 Java object allocation과 GC 대상 |
| metaspace | class metadata를 위한 HotSpot 관리 영역 |
| thread stack | 각 thread의 호출 frame을 위한 실행 자원 |
| native/direct | JVM·라이브러리·direct buffer 등이 JVM heap 밖에서 사용할 수 있는 메모리 |

JVMS의 heap·stack·method area는 추상 영역이고, metaspace라는 이름과 실제 예약/commit
구조는 HotSpot implementation이다. 많은 platform thread는 stack reservation과 OS
자원을 늘릴 수 있고, virtual thread의 비용 모델은 platform thread와 다르다. direct
buffer도 Java reference가 heap에 있어도 backing storage가 native일 수 있다.

진단할 때 heap histogram/heap dump, native memory tracking, thread 수와 stack, process
RSS를 서로 다른 evidence로 본다. 하나의 숫자를 “JVM memory” 전체로 이름 붙이면 원인
범위를 잘못 좁히게 된다.

## 흔한 오해

- Xmx가 프로세스가 사용할 수 있는 모든 메모리의 상한은 아니다.
- metaspace가 Java heap과 완전히 같은 영역이라는 설명은 틀리다.
- Java reference가 heap에 있다는 사실만으로 backing memory가 전부 heap이라고 할 수 없다.
