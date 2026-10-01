---
kind: concept
contentKey: java.core.jvm-runtime.gc-fundamentals-collectors
topicContentKey: java.core.jvm-runtime
slug: gc-fundamentals-collectors
title: "GC 기본 원리와 수집기(Collector)"
summary: "GC가 더 이상 도달할 수 없는 객체의 메모리를 회수하는 이유와 일시 정지 시간·처리량·지연 시간의 장단점을 이해하고 G1·ZGC 같은 수집기를 JVM 구현 선택으로 구분한다"
level: 3
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/en/java/javase/25/gctuning/"
    title: "Java SE 25 HotSpot VM Garbage Collection Tuning Guide"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: HotSpot collector 선택과 throughput·pause trade-off 확인
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html#jvms-2.5.3"
    title: "Java SE 25 JVMS: Heap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: heap과 automatic reclamation의 specification 범위 확인
  - url: "https://d2.naver.com/helloworld/1329"
    title: "네이버 D2: Java Garbage Collection"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: GC의 세대별 흐름과 stop-the-world 관찰 포인트 보충
---
# GC 기본 원리와 수집기(Collector)

Java에서는 객체 메모리를 개발자가 직접 `free()`하지 않습니다. JVMS는 힙에 자동 메모리 관리 시스템(automatic storage management system)이 존재할 수 있음을 정의하고, 실제 HotSpot은 가비지 컬렉터가 더 이상 사용할 수 없는 객체의 메모리를 회수합니다.

GC가 있다는 사실은 메모리 문제를 신경 쓰지 않아도 된다는 뜻이 아닙니다. 서버에서는 **객체가 얼마나 빠르게 만들어지고, 얼마나 오래 살아 있으며, 수집기가 애플리케이션 실행을 얼마나 방해하는가**가 처리량과 지연 시간에 영향을 줍니다.

### GC는 실행 중인 객체와 회수 가능한 객체를 구분해야 한다

앞 Concept에서 본 것처럼 수집기는 살아 있는 root에서 객체 그래프를 따라 reachability를 판단합니다.

```text
GC 루트
 ├─▶ A ─▶ B
 └─▶ C

D ─▶ E   // root에서 도달 불가
```

D와 E처럼 더 이상 루트에서 도달할 수 없는 객체는 저장 공간 회수 후보가 될 수 있습니다. 실제 수집기는 살아 있는 객체를 추적하고 빈 공간을 재사용할 수 있도록 관리하며, 구현에 따라 객체를 이동하거나 힙을 압축할 수도 있습니다.

어떤 알고리즘으로 이 작업을 수행해야 하는지는 Java 언어나 JVMS가 하나로 정하지 않습니다.

### GC 작업과 애플리케이션 실행은 일부 구간에서 겹칠 수 있다

Collector에 따라 어떤 작업은 애플리케이션 스레드를 멈춘 상태에서 수행되고, 어떤 작업은 애플리케이션과 concurrently 진행될 수 있습니다.

```text
시간 ─────────────────────────▶
애플리케이션  ██████░░██████░████
GC work         ███      █████
               ↑        ↑
             pause 가능 구간
```

`Stop-The-World`는 JVM이 특정 GC 작업을 위해 애플리케이션 스레드의 진행을 멈추는 구간을 설명합니다. 하지만 모든 수집기가 모든 GC phase를 같은 방식으로 멈추는 것은 아닙니다.

### 처리량과 일시 중지 시간 latency는 같은 목표가 아니다

GC 선택과 튜닝에서는 무엇을 최적화하려는지 먼저 정해야 합니다.

- 처리량: 전체 시간 중 애플리케이션이 실제 일을 수행한 비율
- 일시 중지 시간 latency: GC 때문에 애플리케이션 진행이 멈추는 시간
- footprint: 힙과 수집기가 사용하는 메모리 규모

Batch 작업에서는 높은 총 처리량이 더 중요할 수 있고, 사용자 요청을 처리하는 API 서버에서는 긴 tail latency를 피하는 것이 더 중요할 수 있습니다. 한 수집기가 모든 작업 부하에서 항상 우월하다고 볼 수 없는 이유입니다.

### G1과 ZGC는 HotSpot 구현 선택이다

G1, ZGC 같은 이름은 Java 언어의 메모리 모델이 아니라 HotSpot JVM이 제공하는 수집기입니다.

```text
Java/JVMS 명세
  └─ 힙(heap)과 자동 메모리 관리(automatic storage management)에 관한 추상 계약

HotSpot
  ├─ G1
  ├─ ZGC
  └─ 기타 지원 collector
```

G1은 힙을 지역 단위로 관리하며 일시 중지 시간 목표와 처리량 사이에서 균형을 잡도록 설계된 수집기입니다. ZGC는 많은 GC work를 concurrent하게 수행해 낮은 일시 중지 시간을 중요한 목표로 둡니다.

그렇다고 "ZGC는 일시 중지 시간이 0" 또는 "G1은 항상 느리다"처럼 단정하면 안 됩니다. 실제 결과는 힙 규모, 실행 중인 집합, 할당 rate, CPU 여유와 JDK version에 영향을 받습니다.

### 힙 크기만으로 GC 부담을 판단하지 않는다

같은 8GB 힙이라도 상황은 크게 다를 수 있습니다.

```text
A: live set 1GB, allocation rate 낮음
B: live set 7GB, allocation rate 높음
```

B는 수집기가 회수할 여유가 작고 계속 많은 객체를 처리해야 할 수 있습니다. 그래서 GC 문제를 볼 때는 다음을 함께 관찰합니다.

- 할당 rate
- 실행 중인 집합 크기
- 힙 occupancy
- GC frequency와 일시 중지 시간
- concurrent cycle 시간
- CPU 사용량

GC가 자주 실행된다는 이유만으로 `-Xmx`를 늘리거나 수집기를 바꾸면 원인을 놓칠 수 있습니다. 실제 원인은 메모리 할당 증가, 캐시·대기열 성장, 메모리 누수, 힙 크기 설정일 수 있습니다.

### 수집기 변경은 측정 이후의 선택이다

Collector를 바꾸기 전에는 현재 문제를 구체적으로 정의합니다.

```text
p99 latency가 GC pause와 함께 상승하는가?
throughput이 GC CPU cost 때문에 제한되는가?
live set이 지나치게 큰가?
allocation rate가 비정상적으로 증가했는가?
```

이 근거가 있어야 수집기 변경이나 힙 sizing이 해결책인지 판단할 수 있습니다. `System.gc()`를 반복 호출해 메모리 pressure를 해결하려는 접근도 같은 이유로 피합니다.

### 정리

GC는 더 이상 도달할 수 없는 객체의 메모리를 자동으로 회수할 수 있게 합니다. 실제 수집기는 일시 정지와 동시 작업을 서로 다르게 배치하므로 처리량, 지연 시간, 메모리 사용량 사이에 장단점이 생깁니다. G1과 ZGC는 HotSpot의 구현 선택이며 Java 언어의 보장이 아닙니다. GC 문제는 힙 크기 하나만 보지 말고 생존 객체 집합(live set), 할당률, 일시 정지 시간, CPU 사용량과 작업 부하를 함께 측정한 뒤 판단해야 합니다.
