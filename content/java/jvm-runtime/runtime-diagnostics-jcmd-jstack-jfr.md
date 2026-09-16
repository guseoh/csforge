---
kind: concept
contentKey: java.core.jvm-runtime.runtime-diagnostics-jcmd-jstack-jfr
topicContentKey: java.core.jvm-runtime
slug: runtime-diagnostics-jcmd-jstack-jfr
title: "jcmd·jstack·JFR로 JVM 진단하기"
summary: "증상에 따라 thread dump·jcmd·JFR이 제공하는 runtime evidence를 구분하고 하나의 snapshot만으로 원인을 단정하지 않는 진단 흐름을 익힌다"
level: 3
status: PUBLISHED
displayOrder: 120
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/specs/man/jcmd.html"
    title: "The jcmd Command"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JVM process 진단 명령과 command 선택 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/specs/man/jstack.html"
    title: "The jstack Command"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: thread stack trace 수집 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/specs/man/jfr.html"
    title: "The jfr Command"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: Flight Recorder recording 조작과 출력 확인
  - url: "https://d2.naver.com/helloworld/6043"
    title: "네이버 D2: Garbage Collection 모니터링 방법"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 4
    relationNote: GC 관측 지표와 도구 선택의 실제 맥락 보충
---
# jcmd·jstack·JFR로 JVM 진단하기

"서버가 느리다"는 증상만으로 JVM option을 바꾸면 원인을 맞히기 어렵습니다. CPU를 많이 쓰는 thread가 있을 수도 있고, lock이나 외부 I/O를 기다릴 수도 있으며, allocation 증가가 GC pause로 이어졌을 수도 있습니다.

JVM 진단의 출발점은 해결책이 아니라 **증상을 관찰 가능한 질문으로 바꾸고 그 질문에 맞는 evidence를 수집하는 것**입니다.

### 먼저 무엇이 느린지 분해한다

```text
응답 지연 증가
├─ CPU가 높은가?
├─ thread가 어디에서 기다리는가?
├─ GC pause가 늘었는가?
├─ allocation rate가 증가했는가?
├─ heap/live set이 커지는가?
└─ 외부 I/O가 오래 걸리는가?
```

질문이 달라지면 필요한 도구도 달라집니다.

### Thread dump는 현재 실행 위치와 대기 관계를 본다

`jstack`이나 `jcmd`의 thread 관련 명령으로 thread stack trace를 수집하면 각 thread가 어느 code path에 있고 무엇을 기다리는지 확인할 수 있습니다.

```text
worker-1
  BLOCKED
  at OrderService.update(...)

worker-2
  BLOCKED
  at OrderService.update(...)
```

여러 thread가 같은 monitor 진입에서 반복적으로 막혀 있다면 lock contention을 의심할 수 있습니다. 반대로 DB driver나 socket read에서 오래 머무른다면 외부 I/O 지연을 볼 필요가 있습니다.

`RUNNABLE`, `BLOCKED`, `WAITING` 같은 state 이름만으로 원인을 확정하지 않고 **stack과 lock/resource 관계를 함께 봅니다.**

### Snapshot 하나보다 여러 시점 비교가 강한 evidence가 될 수 있다

Thread dump는 기본적으로 특정 시점의 관찰입니다.

```text
16:00:00 worker-1 -> Service.call
16:00:05 worker-1 -> Service.call
16:00:10 worker-1 -> Service.call
```

같은 thread와 stack이 여러 시점에 계속 반복되면 우연한 순간보다 강한 단서가 됩니다. 반대로 한 장의 dump에서 특정 method가 보였다는 사실만으로 그 method가 병목이라고 결론내리지 않습니다.

### Virtual thread가 많다면 dump 종류의 범위를 확인한다

Java 25에서는 `jcmd Thread.dump_to_file`로 platform thread와 virtual thread를 모두 포함하는 dump를 만들 수 있습니다. 반면 전통적인 thread dump 명령은 출력 범위와 표현 방식이 다를 수 있습니다.

```text
jcmd <pid> Thread.dump_to_file -format=plain dump.txt
```

`Thread.dump_to_file`은 많은 virtual thread를 포함한 구조를 관찰하는 데 유용하지만, JVM을 멈춘 완전한 일관 snapshot이나 자동 deadlock detector와 같은 것은 아닙니다. 따라서 **어떤 명령이 어떤 thread와 lock 정보를 보여 주는지** 공식 문서 기준으로 확인합니다.

### jcmd는 여러 진단 기능으로 들어가는 입구다

`jcmd <pid> help`로 현재 JDK/JVM이 지원하는 diagnostic command를 확인할 수 있습니다. 환경에 따라 다음 정보를 얻는 데 활용합니다.

- thread dump
- class histogram
- heap dump
- VM flags와 system properties
- NMT 정보
- JFR recording 시작·조회·중지

정확한 command 이름과 지원 범위는 사용하는 Java version의 `jcmd help`를 기준으로 확인합니다.

### Histogram은 객체 수를 보여 주지만 retained path는 보여 주지 않는다

Heap이 증가할 때 class histogram은 어떤 class의 instance 수와 크기가 늘어나는지 빠르게 확인하는 데 유용합니다.

```text
Class                    Instances       Bytes
byte[]                   ...             ...
com.example.Session      ...             ...
HashMap$Node             ...             ...
```

하지만 histogram만으로 **왜 그 객체가 살아 있는지**는 알 수 없습니다. Leak root cause를 찾으려면 필요할 때 heap dump를 분석해 GC root까지의 retained path를 확인합니다.

### Heap dump는 강력하지만 운영 비용과 민감 정보가 있다

큰 heap dump는 파일 크기, disk I/O, 수집 영향이 클 수 있고 heap 안의 credential이나 개인정보가 포함될 수도 있습니다.

따라서 production에서는 저장 공간, 서비스 영향, 접근 권한과 보관 정책을 확인한 뒤 수집합니다. "메모리가 이상하니 일단 heap dump를 반복해서 뜬다"는 접근은 피합니다.

### JFR은 JVM event를 시간축으로 연결한다

JFR(Java Flight Recorder)은 일정 시간 동안 runtime event를 기록해 CPU, GC, allocation, lock, I/O 같은 변화를 같은 시간축에서 볼 수 있게 합니다.

```text
시간 ─────────────────────────▶
CPU        ███████  ███████
GC             ██      ███
Allocation ████████████████
Locks         ████
```

예를 들어 p99 latency가 특정 시각에 급증했고 같은 시간대에 allocation과 GC pause가 함께 늘었다면 단순히 "GC가 느렸다"에서 멈추지 않고 **무엇이 allocation을 증가시켰는가**까지 추적할 근거가 생깁니다.

### JVM evidence와 application observability는 서로 다른 질문에 답한다

JFR이 rich한 runtime evidence를 준다고 해서 주문 ID나 HTTP 요청의 전체 business flow가 자동으로 기록되는 것은 아닙니다.

```text
Metrics / tracing
  -> 언제 어떤 요청이 느렸는가

JFR / thread dump
  -> 그 시각 JVM 내부에서 무엇이 일어났는가
```

Application log, metric, distributed trace와 JVM evidence를 시간축으로 맞춰야 실제 장애 원인을 설명하기 쉬워집니다.

### 진단 도구 자체도 비용이 있다

Heap dump, 매우 상세한 JFR configuration, NMT 같은 도구는 환경에 따라 CPU·메모리·I/O 비용을 가질 수 있습니다. Production에서는 필요한 evidence를 가장 낮은 비용부터 단계적으로 수집합니다.

```text
증상 정의
  -> low-cost metric/thread evidence
  -> 필요 시 JFR/histogram
  -> 필요 시 heap dump 등 더 무거운 자료
```

### 정리

JVM 장애 진단에서는 먼저 증상을 측정 가능한 질문으로 바꾸고 그 질문에 맞는 evidence를 선택합니다. Thread dump는 현재 stack과 대기 관계를, histogram과 heap dump는 객체 분포와 retained graph를, JFR은 시간에 따른 CPU·GC·allocation·lock 변화를 보는 데 유용합니다. Java 25의 virtual thread 환경에서는 사용하는 thread dump 명령의 관찰 범위도 확인해야 하며, 하나의 snapshot만으로 원인을 단정하지 않고 application metrics·log·trace와 함께 비교해야 합니다.
