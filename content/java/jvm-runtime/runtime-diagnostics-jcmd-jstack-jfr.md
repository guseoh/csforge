---
kind: concept
contentKey: java.core.jvm-runtime.runtime-diagnostics-jcmd-jstack-jfr
topicContentKey: java.core.jvm-runtime
slug: runtime-diagnostics-jcmd-jstack-jfr
title: "jcmd·jstack·JFR로 JVM 진단하기"
summary: "증상에 따라 thread dump·jcmd·JFR이 제공하는 런타임 진단 근거를 구분하고 하나의 스냅샷만으로 원인을 단정하지 않는 흐름을 익힌다"
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

"서버가 느리다"는 증상만으로 JVM 옵션을 바꾸면 원인을 찾기 어렵습니다. CPU를 많이 사용하는 스레드가 있을 수도 있고, 잠금이나 외부 I/O를 기다릴 수도 있으며, 메모리 할당 증가가 GC 일시 정지로 이어졌을 수도 있습니다.

JVM 진단은 해결책을 고르는 데서 시작하지 않습니다. **증상을 관찰 가능한 질문으로 바꾸고, 질문에 맞는 근거를 수집하는 것**이 출발점입니다.

### 먼저 무엇이 느린지 분해한다

```text
응답 지연 증가
├─ CPU가 높은가?
├─ 스레드는 어디에서 기다리는가?
├─ GC pause가 늘었는가?
├─ 메모리 할당률(allocation rate)이 증가했는가?
├─ 힙(heap)과 생존 객체 집합(live set)이 커지는가?
└─ 외부 I/O가 오래 걸리는가?
```

질문이 달라지면 필요한 도구도 달라집니다.

### 스레드 덤프(thread dump)는 현재 실행 위치와 대기 관계를 보여 준다

`jstack`이나 `jcmd`의 스레드 관련 명령으로 스택 추적(stack trace)을 수집하면 각 스레드가 어느 코드 경로에 있고 무엇을 기다리는지 확인할 수 있습니다.

```text
worker-1
  BLOCKED
  at OrderService.update(...)

worker-2
  BLOCKED
  at OrderService.update(...)
```

여러 스레드가 같은 모니터에 진입하려다 반복해서 막혀 있다면 잠금 경합(lock contention)을 의심할 수 있습니다. 반대로 DB 드라이버나 소켓 읽기에서 오래 머무른다면 외부 I/O 지연을 살펴야 합니다.

`RUNNABLE`, `BLOCKED`, `WAITING` 같은 상태 이름만으로 원인을 단정하지 말고 **스택과 잠금·자원 관계를 함께 살펴야 합니다.**

### 한 시점의 스냅샷보다 여러 시점의 비교가 더 강한 근거가 될 수 있다

스레드 덤프는 기본적으로 특정 시점의 관찰 결과입니다.

```text
16:00:00 worker-1 -> Service.call
16:00:05 worker-1 -> Service.call
16:00:10 worker-1 -> Service.call
```

같은 스레드와 스택이 여러 시점에 반복되면 우연한 순간보다 강한 단서가 됩니다. 반대로 덤프 한 건에서 특정 메서드가 보였다는 사실만으로 해당 메서드가 병목이라고 결론내리지는 않습니다.

### 가상 스레드가 많다면 덤프 명령의 범위를 확인한다

Java 25에서는 `jcmd Thread.dump_to_file`로 플랫폼 스레드와 가상 스레드를 모두 포함하는 덤프를 만들 수 있습니다. 기존 스레드 덤프 명령은 출력 범위와 표현 방식이 다를 수 있습니다.

```text
jcmd <pid> Thread.dump_to_file -format=plain dump.txt
```

`Thread.dump_to_file`은 가상 스레드가 많은 구조를 관찰하는 데 유용하지만, JVM을 멈춘 완전한 일관성 스냅샷이나 자동 교착 상태 탐지기는 아닙니다. 따라서 **각 명령이 어떤 스레드와 잠금 정보를 보여 주는지** 공식 문서에서 확인해야 합니다.

### `jcmd`는 여러 진단 기능을 호출하는 도구다

`jcmd <pid> help`로 현재 JDK/JVM이 지원하는 진단 명령을 확인할 수 있습니다. 환경에 따라 다음 정보를 얻는 데 활용합니다.

- thread dump
- 클래스 히스토그램
- 힙 덤프
- VM 플래그와 시스템 속성
- NMT 정보
- JFR 기록의 시작·조회·중지

정확한 명령 이름과 지원 범위는 사용하는 Java 버전의 `jcmd help`에서 확인합니다.

### 클래스 히스토그램은 객체 수를 보여 주지만 유지 참조 경로는 보여 주지 않는다

힙이 증가할 때 클래스 히스토그램은 어떤 클래스의 인스턴스 수와 크기가 늘어나는지 빠르게 확인하는 데 유용합니다.

```text
클래스                    인스턴스        바이트
byte[]                   ...             ...
com.example.Session      ...             ...
HashMap$Node             ...             ...
```

하지만 히스토그램만으로 **객체가 살아 있는 이유**를 알 수는 없습니다. 메모리 누수의 원인을 찾으려면 필요에 따라 힙 덤프를 분석해 GC 루트까지 이어지는 유지 참조 경로를 확인합니다.

### 힙 덤프는 유용하지만 운영 비용과 민감 정보를 고려해야 한다

큰 힙 덤프는 파일 크기와 디스크 I/O가 크고 서비스에 영향을 줄 수 있으며, 덤프 안에 인증 정보나 개인정보가 포함될 수도 있습니다.

따라서 운영 환경에서는 저장 공간, 서비스 영향, 접근 권한과 보관 정책을 확인한 뒤 수집해야 합니다. "메모리가 이상하니 힙 덤프를 반복해서 뜬다"는 접근은 피합니다.

### JFR은 JVM 이벤트를 시간축으로 연결한다

JFR(Java Flight Recorder)은 일정 시간 동안 실행 시점 이벤트를 기록해 CPU, GC, 메모리 할당, 잠금, I/O 변화를 같은 시간축에서 볼 수 있게 합니다.

```text
시간 ─────────────────────────▶
CPU        ███████  ███████
GC             ██      ███
Allocation ████████████████
Locks         ████
```

예를 들어 특정 시각에 p99 지연 시간이 급증하고 같은 시간대에 메모리 할당과 GC 일시 정지가 함께 늘었다면, 단순히 "GC가 느렸다"에서 멈추지 않고 **무엇이 메모리 할당을 늘렸는지** 추적할 근거가 생깁니다.

### JVM 진단 근거와 애플리케이션 관측성은 서로 다른 질문에 답한다

JFR이 풍부한 실행 시점 근거를 제공한다고 해서 주문 ID나 HTTP 요청의 전체 업무 흐름이 자동 기록되는 것은 아닙니다.

```text
Metrics / tracing
  -> 언제 어떤 요청이 느렸는가

JFR / 스레드 덤프
  -> 그 시각 JVM 내부에서 무엇이 일어났는가
```

Application log, metric, distributed trace와 JVM evidence를 시간축으로 맞춰야 실제 장애 원인을 설명하기 쉬워집니다.

### 진단 도구를 사용할 때도 비용을 고려한다

힙 덤프, 상세한 JFR 설정, NMT 같은 도구는 환경에 따라 CPU·메모리·I/O 비용을 일으킬 수 있습니다. 운영 환경에서는 필요한 근거를 비용이 낮은 방법부터 단계적으로 수집합니다.

```text
증상 정의
  -> 저비용 지표·스레드 근거
  -> 필요 시 JFR/histogram
  -> 필요 시 heap dump 등 더 무거운 자료
```

### 정리

JVM 장애를 진단할 때는 증상을 측정 가능한 질문으로 바꾸고 그에 맞는 근거를 선택합니다. 스레드 덤프는 현재 스택과 대기 관계를, 히스토그램·힙 덤프는 객체 분포와 유지 참조 경로를, JFR은 시간에 따른 CPU·GC·메모리 할당·잠금 변화를 보여 줍니다. Java 25의 가상 스레드 환경에서는 스레드 덤프 명령의 관찰 범위도 확인해야 합니다. 스냅샷 한 건으로 원인을 단정하지 말고 애플리케이션 지표·로그·추적 정보와 함께 비교해야 합니다.
