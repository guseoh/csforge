---
kind: concept
contentKey: java.core.jvm-runtime.gc-fundamentals-collectors
topicContentKey: java.core.jvm-runtime
slug: gc-fundamentals-collectors
title: "GC fundamentals and collectors"
summary: "GC가 unreachable 객체의 storage를 회수하는 이유와 pause·throughput·latency trade-off를 이해하고 G1/ZGC 같은 collector를 JVM 구현 선택으로 구분한다"
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
---
# GC는 왜 필요하고 collector는 왜 여러 종류일까

Java에서는 객체를 만들 때마다 개발자가 직접 `free()`하지 않습니다. 더 이상 사용할 수 없는 객체의 storage는 JVM의 garbage collector가 회수할 수 있습니다. 덕분에 수동 메모리 해제 실수는 크게 줄지만, GC가 "메모리 문제를 신경 쓰지 않아도 된다"는 뜻은 아닙니다.

서버에서는 **얼마나 자주 객체를 만들고, 얼마만큼의 객체가 오래 살아 있으며, GC가 애플리케이션 실행을 얼마나 방해하는가**가 latency와 처리량에 영향을 줄 수 있습니다.

### GC의 출발점은 unreachable 객체를 찾는 것이다

앞 Concept에서 본 것처럼 GC는 root에서 객체 graph를 따라 reachability를 판단합니다.

```text
GC Roots
   │
   ├─▶ A ─▶ B
   │
   └─▶ C

D ─▶ E     // root에서 도달 불가
```

D와 E처럼 root에서 도달할 수 없는 객체는 회수 대상이 될 수 있습니다.

여기서 collector가 해야 할 일은 단순히 "죽은 객체 찾기" 하나만은 아닙니다. 구현에 따라 살아 있는 객체를 추적하고, 비어 있는 공간을 다시 사용할 수 있게 만들고, 필요하면 객체를 이동하거나 heap을 정리해야 합니다.

### GC가 일하는 동안 애플리케이션도 같이 실행될 수 있다

Collector에 따라 어떤 작업은 애플리케이션 thread를 멈춘 상태에서 수행되고, 어떤 작업은 애플리케이션과 동시에(concurrently) 진행될 수 있습니다.

```text
시간 ─────────────────────────────▶
Application  ██████░░████████░█████
GC work         ███      █████
                ↑
             pause 구간이 있을 수 있음
```

`Stop-The-World`라는 표현은 JVM이 특정 GC 작업을 위해 애플리케이션 thread들의 실행을 멈추는 구간을 설명할 때 사용합니다. 하지만 모든 collector가 모든 GC 작업을 같은 방식과 같은 길이로 멈춘다고 생각하면 안 됩니다.

### throughput과 latency는 다른 목표다

GC 튜닝에서 중요한 두 축은 다음처럼 생각할 수 있습니다.

**Throughput**은 전체 시간 중 실제 애플리케이션 작업에 얼마나 많은 시간을 썼는지에 가깝습니다.

**Latency**는 개별 요청이나 작업이 얼마나 오래 지연되는지를 봅니다. GC pause가 짧아야 하는 서비스에서는 tail latency에 민감할 수 있습니다.

예를 들어:

```text
Collector A
- 총 처리량은 높음
- 가끔 비교적 긴 pause

Collector B
- concurrent GC 일을 더 많이 수행
- pause 목표를 더 낮추려 함
- CPU/메모리 overhead가 달라질 수 있음
```

무조건 하나가 더 좋다고 할 수 없습니다. Batch workload와 latency-sensitive API 서버의 목표가 다를 수 있기 때문입니다.

### G1, ZGC는 Java language가 아니라 HotSpot collector다

Java 언어는 "반드시 G1을 사용한다"거나 "객체는 generation 0/1/2에 있어야 한다"고 규정하지 않습니다.

G1, ZGC 같은 이름은 HotSpot JVM에서 제공되는 collector 구현과 정책입니다.

```text
Java/JVMS
- 자동 storage reclamation이 가능한 heap 모델

HotSpot
- G1
- ZGC
- 기타 지원 collector/구현 정책
```

따라서 collector의 region 구조, barrier, concurrent phase, generation 정책을 설명할 때는 **HotSpot implementation**이라는 범위를 표시해야 합니다.

### G1은 heap을 region 단위로 다루는 HotSpot collector다

G1(Garbage-First)은 큰 heap에서 예측 가능한 pause 목표를 지원하기 위해 설계된 collector입니다. Heap을 동일한 크기의 region들로 나누고, 회수 효율 등을 고려해 collection work를 계획합니다.

```text
Heap
[region][region][region][region][region]...
```

Young/old object가 존재하는 논리는 있지만 과거 collector의 물리적으로 고정된 연속 영역 그림을 그대로 G1에 적용하면 부정확할 수 있습니다.

G1의 세부 phase와 tuning option은 HotSpot GC Tuning Guide를 기준으로 확인합니다. 여기서 중요한 학습 포인트는 **collector마다 heap 관리 방식과 pause/concurrent 작업 배치가 다르다**는 것입니다.

### ZGC는 낮은 pause를 중요한 목표로 둔 collector다

ZGC는 많은 GC 작업을 애플리케이션과 동시에 수행해 pause 시간을 매우 낮게 유지하는 것을 중요한 목표로 하는 HotSpot collector입니다.

그렇다고:

> ZGC는 pause가 0이다.

라고 말하면 안 됩니다. 필요한 짧은 stop-the-world phase가 존재할 수 있고 실제 latency는 heap size, allocation rate, CPU 자원과 실행 환경의 영향을 받습니다.

또 낮은 pause 목표가 모든 workload에서 가장 높은 throughput이나 가장 작은 memory overhead를 의미하지 않습니다.

### GC 성능은 live set과 allocation rate를 함께 봐야 한다

Heap이 8GB라는 숫자만으로 GC 부담을 판단할 수 없습니다.

두 프로그램을 비교해 보겠습니다.

```text
Program A
heap 8GB
live objects 1GB
allocation rate 낮음

Program B
heap 8GB
live objects 7GB
allocation rate 매우 높음
```

같은 heap size라도 GC가 확보할 수 있는 여유와 처리해야 할 작업량이 크게 다릅니다.

중요한 관찰 대상은 다음과 같습니다.

- allocation rate
- live set 크기
- heap occupancy
- GC pause 시간
- GC 빈도
- concurrent cycle 시간
- CPU 사용량
- allocation failure / memory pressure

### "GC가 자주 돈다"는 증상만으로 원인을 정하지 않는다

GC 빈도가 늘었다면:

- 실제 allocation rate가 증가했는지
- heap이 workload에 비해 너무 작은지
- live set이 커졌는지
- memory leak으로 old/live objects가 쌓이는지
- collector 설정이 workload와 맞는지

를 나눠 봐야 합니다.

무조건 `-Xmx`를 늘리거나 collector부터 바꾸는 것은 측정 없는 해결책입니다.

### `System.gc()`로 성능 문제를 해결하려 하지 않는다

`System.gc()`는 JVM에 GC 수행을 요청하는 API이지 "지금 사용하지 않는 모든 메모리를 즉시 완벽하게 정리해라"라는 보장이 아닙니다.

반복적으로 호출하면 오히려 불필요한 collection work와 pause를 만들 수 있습니다. Memory 문제는 객체가 왜 많이 만들어지고 왜 오래 살아 있는지부터 확인해야 합니다.

### collector를 선택할 때 질문해야 할 것

1. latency 목표가 중요한가, 총 throughput이 중요한가?
2. heap과 live set이 얼마나 큰가?
3. allocation rate는 어떤가?
4. CPU 여유가 있는가?
5. 현재 collector에서 실제 pause 문제가 관찰됐는가?
6. 어떤 JDK/HotSpot version을 사용하고 있는가?

Collector 변경은 이름 비교가 아니라 실제 목표와 measurement를 바탕으로 해야 합니다.

### 문제를 풀 때 확인할 것

1. unreachable과 reclaim timing을 구분합니다.
2. pause와 concurrent GC work를 분리해서 봅니다.
3. throughput과 latency 중 어떤 목표를 묻는지 확인합니다.
4. G1/ZGC 특징을 Java language guarantee로 말하지 않습니다.
5. heap size만 보지 말고 live set과 allocation rate를 봅니다.
6. GC 문제라고 해서 무조건 heap 증설/collector 변경부터 선택하지 않습니다.

### 면접에서 설명한다면

GC는 root에서 더 이상 도달할 수 없는 객체의 storage를 JVM이 자동으로 회수할 수 있게 합니다. Collector마다 객체를 추적하고 회수하는 방식, stop-the-world pause와 concurrent 작업의 비율이 달라 throughput과 latency trade-off가 생깁니다. G1과 ZGC는 HotSpot의 collector 구현이지 Java language 보장이 아니며, collector 선택은 heap 크기 하나가 아니라 live set, allocation rate, pause 목표와 실제 측정 결과를 보고 결정해야 합니다.
