---
kind: concept
contentKey: java.core.jvm-runtime.gc-fundamentals-collectors
topicContentKey: java.core.jvm-runtime
slug: gc-fundamentals-collectors
title: "GC 기본 원리와 Collector"
summary: "GC가 unreachable 객체의 storage를 회수하는 이유와 pause·처리량·지연 시간 trade-off를 이해하고 G1/ZGC 같은 collector를 JVM 구현 선택으로 구분한다"
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
# GC 기본 원리와 Collector

Java에서는 객체 storage를 개발자가 직접 `free()`하지 않습니다. JVMS는 heap에 automatic storage management system이 존재할 수 있음을 정의하고, 실제 HotSpot은 garbage collector가 더 이상 사용할 수 없는 객체의 storage를 회수합니다.

GC가 있다는 사실은 메모리 문제를 신경 쓰지 않아도 된다는 뜻이 아닙니다. 서버에서는 **객체가 얼마나 빠르게 만들어지고, 얼마나 오래 살아 있으며, collector가 애플리케이션 실행을 얼마나 방해하는가**가 처리량과 지연 시간에 영향을 줍니다.

### GC는 live object와 회수 가능한 객체를 구분해야 한다

앞 Concept에서 본 것처럼 collector는 살아 있는 root에서 object graph를 따라 reachability를 판단합니다.

```text
Roots
 ├─▶ A ─▶ B
 └─▶ C

D ─▶ E   // root에서 도달 불가
```

D와 E처럼 더 이상 reachable하지 않은 객체는 storage 회수 후보가 될 수 있습니다. 실제 collector는 살아 있는 객체를 추적하고 빈 공간을 재사용할 수 있도록 관리하며, 구현에 따라 객체를 이동하거나 heap을 압축할 수도 있습니다.

어떤 알고리즘으로 이 작업을 수행해야 하는지는 Java language나 JVMS가 하나로 정하지 않습니다.

### GC 작업과 애플리케이션 실행은 일부 구간에서 겹칠 수 있다

Collector에 따라 어떤 작업은 애플리케이션 thread를 멈춘 상태에서 수행되고, 어떤 작업은 애플리케이션과 concurrently 진행될 수 있습니다.

```text
시간 ─────────────────────────▶
Application  ██████░░██████░████
GC work         ███      █████
               ↑        ↑
             pause 가능 구간
```

`Stop-The-World`는 JVM이 특정 GC 작업을 위해 애플리케이션 thread의 진행을 멈추는 구간을 설명합니다. 하지만 모든 collector가 모든 GC phase를 같은 방식으로 멈추는 것은 아닙니다.

### 처리량과 pause latency는 같은 목표가 아니다

GC 선택과 튜닝에서는 무엇을 최적화하려는지 먼저 정해야 합니다.

- 처리량: 전체 시간 중 애플리케이션이 실제 일을 수행한 비율
- pause latency: GC 때문에 애플리케이션 진행이 멈추는 시간
- footprint: heap과 collector가 사용하는 메모리 규모

Batch 작업에서는 높은 총 처리량이 더 중요할 수 있고, 사용자 요청을 처리하는 API 서버에서는 긴 tail latency를 피하는 것이 더 중요할 수 있습니다. 한 collector가 모든 workload에서 항상 우월하다고 볼 수 없는 이유입니다.

### G1과 ZGC는 HotSpot 구현 선택이다

G1, ZGC 같은 이름은 Java language의 메모리 모델이 아니라 HotSpot JVM이 제공하는 collector입니다.

```text
Java/JVMS
  └─ heap + automatic storage management라는 추상 계약

HotSpot
  ├─ G1
  ├─ ZGC
  └─ 기타 지원 collector
```

G1은 heap을 region 단위로 관리하며 pause 목표와 처리량 사이에서 균형을 잡도록 설계된 collector입니다. ZGC는 많은 GC work를 concurrent하게 수행해 낮은 pause를 중요한 목표로 둡니다.

그렇다고 "ZGC는 pause가 0" 또는 "G1은 항상 느리다"처럼 단정하면 안 됩니다. 실제 결과는 heap 규모, live set, allocation rate, CPU 여유와 JDK version에 영향을 받습니다.

### heap 크기만으로 GC 부담을 판단하지 않는다

같은 8GB heap이라도 상황은 크게 다를 수 있습니다.

```text
A: live set 1GB, allocation rate 낮음
B: live set 7GB, allocation rate 높음
```

B는 collector가 회수할 여유가 작고 계속 많은 객체를 처리해야 할 수 있습니다. 그래서 GC 문제를 볼 때는 다음을 함께 관찰합니다.

- allocation rate
- live set 크기
- heap occupancy
- GC frequency와 pause
- concurrent cycle 시간
- CPU 사용량

GC가 자주 돈다는 사실만으로 `-Xmx`를 늘리거나 collector부터 바꾸면 원인을 놓칠 수 있습니다. 실제로는 allocation 증가, cache/queue 성장, memory leak, heap sizing 문제가 원인일 수 있습니다.

### collector 변경은 측정 이후의 선택이다

Collector를 바꾸기 전에는 현재 문제를 구체적으로 정의합니다.

```text
p99 latency가 GC pause와 함께 상승하는가?
throughput이 GC CPU cost 때문에 제한되는가?
live set이 지나치게 큰가?
allocation rate가 비정상적으로 증가했는가?
```

이 evidence가 있어야 collector 변경이나 heap sizing이 해결책인지 판단할 수 있습니다. `System.gc()`를 반복 호출해 memory pressure를 해결하려는 접근도 같은 이유로 피합니다.

### 정리

GC는 더 이상 reachable하지 않은 객체의 storage를 자동으로 회수할 수 있게 합니다. 실제 collector는 pause와 concurrent work를 서로 다르게 배치하므로 처리량, 지연 시간, footprint 사이에 trade-off가 생깁니다. G1과 ZGC는 HotSpot 구현 선택이며 Java language 보장이 아닙니다. GC 문제는 heap 크기 하나보다 live set, allocation rate, pause, CPU와 workload를 함께 측정한 뒤 판단해야 합니다.
