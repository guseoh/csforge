---
kind: concept
contentKey: java.core.jvm-runtime.runtime-diagnostics-jcmd-jstack-jfr
topicContentKey: java.core.jvm-runtime
slug: runtime-diagnostics-jcmd-jstack-jfr
title: "Runtime diagnostics with jcmd, jstack, and JFR"
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
---
# JVM 문제를 만났을 때 무엇부터 관찰해야 할까

"서버가 느리다"는 말만으로는 원인을 알 수 없습니다. CPU를 과하게 쓰는 thread가 있을 수도 있고, 많은 thread가 lock을 기다릴 수도 있고, GC pause가 길어졌을 수도 있고, 객체 allocation이 갑자기 증가했을 수도 있습니다.

진단의 첫 단계는 기술을 바꾸는 것이 아니라 **증상에 맞는 evidence를 수집하는 것**입니다. JDK에는 `jcmd`, `jstack`, Java Flight Recorder(JFR) 같은 runtime 진단 도구가 포함되어 있습니다.

### 먼저 증상을 관찰 가능한 질문으로 바꾼다

예를 들어 "느리다"를 다음처럼 나눌 수 있습니다.

```text
응답 지연 증가
├─ CPU가 높은가?
├─ thread가 무엇을 기다리는가?
├─ GC pause가 늘었는가?
├─ allocation rate가 늘었는가?
├─ heap/live set이 증가하는가?
└─ 외부 I/O가 오래 걸리는가?
```

질문이 달라지면 필요한 도구도 달라집니다.

### jstack은 thread가 지금 어디에 있는지 보는 snapshot이다

`jstack`은 대상 JVM의 thread stack trace를 수집하는 도구입니다.

```text
jstack <pid>
```

출력에서는 각 thread가 어떤 stack frame에 있고 어떤 상태인지 확인할 수 있습니다.

예를 들어 여러 request thread가 비슷한 위치에서 `BLOCKED`로 나타난다면 lock 경합을 의심할 수 있습니다.

```text
http-worker-1
  BLOCKED
  at OrderService.update(...)

http-worker-2
  BLOCKED
  at OrderService.update(...)
```

반대로 많은 thread가 socket read나 DB driver 호출에서 WAITING/RUNNABLE 상태로 오래 머문다면 외부 I/O 대기를 확인해야 할 수 있습니다.

Thread state 이름만 보고 원인을 단정하지 말고 **stack과 lock/resource 관계를 같이 봅니다.**

### thread dump 한 장보다 여러 시점 비교가 더 유용할 때가 많다

한 번의 thread dump는 그 순간의 snapshot입니다. 우연히 정상 thread가 특정 위치에 있던 순간을 찍었을 수도 있습니다.

그래서 장애 상황에서는 일정 간격으로 여러 dump를 비교하는 방식이 도움이 됩니다.

```text
16:00:00 dump
worker-1 -> Service.call

16:00:05 dump
worker-1 -> Service.call

16:00:10 dump
worker-1 -> Service.call
```

같은 thread가 오랫동안 같은 stack에서 멈춰 있다면 단순 순간 관찰보다 강한 단서가 됩니다.

### jcmd는 JVM에 여러 종류의 진단 명령을 요청하는 입구다

`jcmd`는 하나의 특정 문제만 보는 도구가 아니라 대상 JVM에 다양한 diagnostic command를 전달합니다.

```text
jcmd <pid> help
```

환경과 JDK가 지원하는 명령을 확인하고 필요한 것을 선택합니다.

대표적으로 진단 상황에 따라 다음 계열의 정보를 얻을 수 있습니다.

- thread 관련 정보
- class histogram
- heap dump 요청
- VM flags/system properties
- native memory 정보(NMT가 활성화된 경우)
- JFR recording 시작/중지/조회

정확한 command 이름과 지원 여부는 사용 중인 JDK의 `jcmd help` 및 공식 문서를 확인합니다.

### class histogram은 "어떤 객체가 많이 존재하는가"를 빠르게 보는 단서다

Heap이 계속 증가할 때 class histogram으로 class별 instance 수와 크기 분포를 볼 수 있습니다.

```text
Class                         Instances       Bytes
byte[]                        ...             ...
com.example.Session           ...             ...
java.util.HashMap$Node        ...             ...
```

여러 시점에서 특정 class instance 수가 계속 증가한다면 leak 후보를 좁힐 수 있습니다.

하지만 histogram은 **왜 그 객체가 살아 있는지 retained path를 직접 설명하지 않습니다.** Root cause를 보려면 heap dump와 heap 분석 도구로 GC root 경로를 확인해야 할 수 있습니다.

### heap dump는 강력하지만 운영 비용도 생각해야 한다

Heap dump는 heap object graph를 깊게 분석할 수 있는 자료입니다. 하지만 큰 heap의 dump는 파일 크기와 수집 시간, disk I/O, 민감 데이터 포함 위험이 있습니다.

운영에서 무작정 반복 수집하기보다:

- dump 파일을 저장할 공간이 충분한가
- 수집이 서비스에 주는 영향은 어떤가
- 개인정보/credential이 heap에 포함될 수 있는가
- 안전하게 반출/보관할 수 있는가

를 확인해야 합니다.

### JFR은 시간축으로 JVM event를 기록한다

Thread dump가 한 순간을 보여 준다면 JFR(Java Flight Recorder)은 일정 기간 동안 발생한 JVM event를 recording으로 남겨 **시간에 따른 변화**를 볼 수 있게 합니다.

```text
시간 ─────────────────────────────▶
CPU        ███████  █████████
GC             ██       ███
Allocation ███████████████████
Locks         ████
I/O       ███      █████
```

JFR event를 통해 workload에 따라 다음 같은 정보를 함께 분석할 수 있습니다.

- CPU sample/execution
- thread 상태/lock 관련 event
- GC
- allocation
- class loading
- file/socket I/O 등

어떤 event가 활성화되고 어느 정도 detail을 기록하는지는 recording configuration과 JDK version에 따라 확인합니다.

### JFR의 장점은 서로 다른 신호를 같은 시간축에서 보는 데 있다

예를 들어 p99 latency가 16:05에 급증했다고 해 보겠습니다.

JFR에서 같은 시각에:

```text
16:05
├─ allocation 급증
├─ GC pause 증가
└─ 특정 method CPU 증가
```

가 함께 보인다면 단순히 "GC가 나빴다"보다 왜 GC 부담이 생겼는지를 더 넓게 추적할 수 있습니다.

반대로 GC event가 정상인데 thread가 외부 socket에서 오래 대기한다면 JVM memory tuning이 해결책이 아닐 가능성이 큽니다.

### JFR은 application business tracing을 자동으로 대신하지 않는다

JFR이 JVM runtime evidence를 풍부하게 제공한다고 해서 "주문 12345 요청이 어느 service를 거쳤는가" 같은 모든 business context가 자동으로 들어가는 것은 아닙니다.

Application log, metrics, distributed trace, request ID 같은 observability 자료와 JFR을 연결해야 원인을 더 잘 설명할 수 있습니다.

```text
Application metrics: p99 상승 시각 확인
        │
JFR: JVM 내부 CPU/GC/thread evidence
        │
Logs/trace: 실제 request/business path
```

각 자료가 답하는 질문이 다릅니다.

### 도구 사용 자체도 변경과 overhead가 될 수 있다

진단 도구는 공짜가 아닐 수 있습니다. Heap dump, 매우 상세한 recording, native memory tracking 등은 환경에 따라 CPU/메모리/I/O overhead가 있습니다.

따라서 production에서는:

1. 현재 장애의 severity를 판단하고
2. 가장 낮은 비용으로 필요한 evidence부터 수집하며
3. 더 무거운 자료가 필요한지 단계적으로 결정합니다.

"일단 모든 옵션을 최대로 켜자"는 접근을 피합니다.

### 증상별 첫 관찰 예시

| 증상                    | 먼저 볼 수 있는 evidence                      |
| ----------------------- | --------------------------------------------- |
| 요청이 멈춘 것처럼 보임 | thread dump, lock/wait stack                  |
| CPU가 지속적으로 높음   | JFR/profile, hot thread stack                 |
| heap 사용량 계속 증가   | GC/heap metrics, histogram, 필요 시 heap dump |
| GC pause가 의심됨       | GC metrics/log/JFR                            |
| process RSS만 증가      | heap 외 native/thread/direct memory evidence  |
| 간헐적인 수초 지연      | JFR 시간축 + application metrics/log          |

이 표는 절대적인 순서가 아니라 "증상과 evidence를 맞춘다"는 사고법입니다.

### 문제를 풀 때 확인할 것

1. 증상을 측정 가능한 질문으로 바꿉니다.
2. snapshot이 필요한지 시간축 recording이 필요한지 구분합니다.
3. jstack의 thread state와 실제 stack/resource를 함께 봅니다.
4. histogram의 객체 수와 retained path를 같은 정보로 착각하지 않습니다.
5. JFR event와 application business trace를 구분합니다.
6. 진단 도구 자체의 overhead와 민감 정보 위험을 확인합니다.
7. evidence를 얻기 전에 JVM option이나 기술을 바꾸지 않습니다.

### 면접에서 설명한다면

JVM 장애 진단에서는 증상에 맞는 evidence를 먼저 선택합니다. `jstack`은 thread stack과 대기 상태를 한 시점에 보는 데 유용하고, `jcmd`는 thread·heap·VM·JFR 등 여러 diagnostic command를 실행하는 입구입니다. JFR은 CPU, GC, allocation, lock 같은 JVM event를 시간축으로 기록해 간헐적인 성능 문제를 분석하는 데 유용합니다. 한 snapshot만으로 원인을 단정하지 않고 metrics, 여러 시점의 dump, application log/trace와 함께 비교해야 합니다.
