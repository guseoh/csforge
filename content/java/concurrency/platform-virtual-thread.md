---
kind: concept
contentKey: java.core.concurrency.platform-virtual-thread
topicContentKey: java.core.concurrency
slug: platform-virtual-thread
title: "플랫폼 스레드(Platform Thread)와 가상 스레드(Virtual Thread)"
summary: "플랫폼 스레드와 가상 스레드의 자원 모델을 구분하고 I/O 중심 백엔드에서 가상 스레드가 유리한 이유를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Java SE 25 API: Thread"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java 25의 플랫폼 스레드와 가상 스레드 Thread API 계약 확인
  - url: "https://openjdk.org/jeps/491"
    title: "JEP 491: Synchronize Virtual Threads without Pinning"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: JDK 24부터 synchronized가 가상 스레드를 캐리어에 고정하지 않도록 바뀐 구현 경계 확인
  - url: "https://d2.naver.com/news/1203723"
    title: "네이버 D2: Virtual Thread의 기본 개념 이해하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: Java 스레드와 Executor를 운영 관점에서 연결해 이해
---
# 플랫폼 스레드(Platform Thread)와 가상 스레드(Virtual Thread)

플랫폼 스레드와 가상 스레드는 둘 다 `java.lang.Thread`이지만 **실행을 뒷받침하는 자원 모델과 스케줄링 방식이 다릅니다.** 이 차이 때문에 가상 스레드는 특히 블로킹 I/O가 많은 서버에서 많은 동시 작업을 작업당 스레드(thread-per-task) 방식으로 표현하기 좋습니다.

![가상 스레드와 캐리어 플랫폼 스레드의 실행 관계](/learning/java/virtual-thread-carriers.svg)

### 플랫폼 스레드는 보통 OS 스레드와 밀접하게 연결된다

Java 25 문서는 플랫폼 스레드를 일반적으로 OS 커널 스레드와 1:1로 연결되는 스레드로 설명합니다.

```text
Java 플랫폼 스레드 A ── OS 스레드 A
Java 플랫폼 스레드 B ── OS 스레드 B
Java 플랫폼 스레드 C ── OS 스레드 C
```

따라서 플랫폼 스레드를 매우 많이 만들면 호출 스택과 네이티브 자원 사용량, OS 스케줄링 비용이 함께 커질 수 있습니다. 전통적인 서버에서는 제한된 작업 스레드 풀을 두고 작업을 재사용 가능한 스레드에 할당하는 구조가 흔합니다.

### 가상 스레드는 Java 실행 환경이 스케줄링한다

```java
Thread virtual = Thread.ofVirtual().start(this::handleRequest);
```

가상 스레드 역시 `Thread` 객체이지만 특정 OS 스레드 하나에 생명주기 전체가 고정되지 않습니다. Java 실행 환경이 실행할 때 플랫폼 스레드에 마운트하고, 이 플랫폼 스레드가 **캐리어(carrier)** 역할을 합니다.

```text
가상 스레드 A ─┐
가상 스레드 B ─┼── 실행 시점 스케줄러 ── 캐리어 플랫폼 스레드 1
가상 스레드 C ─┤                    └─ 캐리어 플랫폼 스레드 2
가상 스레드 D ─┘
```

애플리케이션은 캐리어의 동일성이나 정확한 개수를 정확성 계약으로 사용하면 안 됩니다. 이런 세부는 JDK 구현과 실행 시점 스케줄링의 영역입니다.

### 블로킹 I/O 중 가상 스레드는 캐리어를 양보할 수 있다

지원되는 블로킹 I/O에서 가상 스레드가 기다리게 되면 실행 환경은 가상 스레드를 일시 중단하고 캐리어를 다른 가상 스레드 실행에 사용할 수 있습니다.

```text
가상 스레드 A
  ├─ Java 코드 실행 -> 캐리어 사용
  ├─ 블로킹 I/O 대기
  │       └─ 언마운트 -> 캐리어를 다른 작업에 사용 가능
  └─ I/O 준비 -> 다시 스케줄링
```

이 때문에 콜백(callback)이나 이벤트 루프(event loop) 방식으로 코드를 크게 바꾸지 않고도 많은 대기 작업을 표현할 수 있습니다.

하지만 가상 스레드가 작업을 더 빨리 계산한다는 뜻은 아닙니다. **I/O를 기다리는 스레드의 비용을 낮추는 것과 CPU 계산량을 줄이는 것은 다른 문제**입니다.

### 가상 스레드는 CPU 병렬성을 늘리지 않는다

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        executor.submit(this::heavyCpuCalculation);
    }
}
```

CPU 중심 작업을 매우 많이 만들더라도 CPU 코어 수 자체가 늘어나는 것은 아닙니다. 실제 계산은 제한된 CPU 자원에서 경쟁합니다.

가상 스레드의 대표적인 이점은 **많은 블로킹 작업을 비교적 저렴한 Thread로 표현해 처리량 확장에 도움을 주는 것**입니다. CPU 중심 병렬 계산의 기본 해법으로 스레드 수를 크게 늘리는 기능은 아닙니다.

### 가상 스레드를 작은 고정 크기 풀로 재사용하지 않는다

플랫폼 스레드는 스레드 자체가 비싸기 때문에 풀 크기로 동시성을 제한하는 경우가 많습니다. 가상 스레드는 작업마다 새 스레드를 만드는 사용 모델을 지원하기 위해 설계되었습니다.

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(this::callDatabase);
    executor.submit(this::callRemoteApi);
}
```

제한해야 하는 것은 가상 스레드 개수 자체보다 **실제로 희소한 자원**일 수 있습니다.

```text
많은 가상 스레드 작업
    │
    ├─ CPU 코어
    ├─ DB 연결
    └─ 외부 API 할당량
```

DB가 연결을 20개만 허용한다면 가상 스레드를 수만 개 만들 수 있어도 DB 동시 사용량은 별도의 연결 풀(connection pool)이나 `Semaphore` 같은 정책으로 제한해야 합니다.

### Java 25에서는 synchronized가 대표적인 pinning 원인이 아니다

초기 가상 스레드 구현에서는 `synchronized` 모니터를 보유한 상태에서 블로킹할 때 캐리어에 고정(pinning)될 수 있었습니다. JDK 24의 JEP 491은 모니터 구현을 변경해 **`synchronized` 때문에 발생하던 이 고정 제약을 제거**했습니다.

따라서 Java 25 기준으로 "가상 스레드에서는 `synchronized`를 쓰면 캐리어가 반드시 고정된다"고 설명하면 오래된 구현 정보를 현재 계약처럼 전달하게 됩니다.

현재 Java 25 가이드는 가상 스레드가 네이티브 메서드(native method) 또는 외부 함수(foreign function)를 실행하는 동안에는 캐리어에 고정될 수 있다고 설명합니다. 고정은 정확성 오류는 아니지만 오래 블로킹하면 확장성을 낮출 수 있습니다.

```text
일반적인 가상 스레드 대응 블로킹 I/O
→ 캐리어 양보 가능

네이티브/외부 함수 호출 중 블로킹
→ 캐리어 고정 가능
```

### ThreadLocal도 자원 모델에 맞춰 다시 본다

가상 스레드도 `ThreadLocal`을 지원합니다. 하지만 가상 스레드를 매우 많이 만들 수 있기 때문에 각 스레드에 크고 비싼 재사용 객체를 캐시하는 패턴은 메모리 이점을 줄일 수 있습니다.

요청 ID처럼 한 방향 컨텍스트를 전달하는 목적이라면 Java 25의 `ScopedValue`도 검토할 수 있습니다. 이것은 `ThreadLocal`이 가상 스레드에서 동작하지 않는다는 뜻이 아니라 **작업당 스레드 모델에서 컨텍스트와 캐시의 수명을 다시 설계하라는 의미**입니다.

플랫폼 스레드와 가상 스레드를 비교할 때는 "어느 쪽이 더 빠른가"보다 작업이 CPU 중심인지 블로킹 I/O 중심인지, 제한해야 할 실제 자원이 무엇인지, 블로킹 중 캐리어를 양보할 수 있는지부터 확인하세요. 가상 스레드는 Java의 동시성 표현 비용을 낮추지만 CPU·DB·외부 시스템의 실제 수용량까지 늘려 주지는 않습니다.
