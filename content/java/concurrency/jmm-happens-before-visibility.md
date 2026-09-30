---
kind: concept
contentKey: java.core.concurrency.jmm-happens-before-visibility
topicContentKey: java.core.concurrency
slug: jmm-happens-before-visibility
title: "JMM의 happens-before와 가시성"
summary: "여러 스레드 사이에서 어떤 쓰기를 안전하게 관찰할 수 있는지 Java Memory Model의 happens-before 관계로 추론한다"
level: 3
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4.5"
    title: "The Java Language Specification — 17.4.5 Happens-before Order"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Java에서 conflicting access와 happens-before를 기준으로 data race를 정의하는 정확한 경계를 확인한다."
    displayOrder: 1
    relationNote: happens-before 정의와 synchronization edge 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/package-summary.html"
    title: "Java SE 25 API: java.util.concurrent"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Executor, Future, concurrent collection 등 고수준 API의 memory consistency effects 확인
  - url: "https://techblog.lycorp.co.jp/ko/20231216a"
    title: "LY 기술 블로그: 메모리 모델 입문 - Sequential Consistency와 Total Store Order 이해하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: CPU memory model과 SC-for-DRF 배경을 더 깊게 이해하는 보충 자료. Java의 실제 보장은 JLS의 JMM 계약을 우선한다.
---
# JMM의 happens-before와 가시성

한 스레드가 `data = 42`를 실행하고 이어서 `ready = true`를 실행했다고 해 보겠습니다. 다른 스레드가 나중에 `ready == true`를 읽었다는 사실만으로 `data == 42`도 반드시 본다고 결론내리려면 **두 스레드 사이를 연결하는 Java Memory Model의 관계**가 필요합니다.

JMM은 특정 CPU 캐시 구조를 설명하는 문서가 아니라, 여러 스레드가 공유 변수에 접근할 때 어떤 실행 결과를 Java 프로그램이 허용하는지를 정의합니다. 그 핵심 추론 도구가 **happens-before**입니다.

![happens-before와 동기화 경계](/learning/java/happens-before.svg)

### happens-before는 관찰 가능성과 정렬 순서를 추론하는 관계다

JLS는 동작 `x`가 `y`보다 happens-before한다면 `x`가 `y`에 대해 visible하고 ordered before라고 설명합니다. 하지만 이것을 "벽시계상 x가 반드시 먼저 실행된다"로 읽으면 안 됩니다. 구현은 결과가 JMM이 허용하는 실행과 일치한다면 내부적으로 동작을 재배치할 수 있습니다.

```text
질문해야 할 것
"실제로 어느 CPU 명령이 먼저 실행됐나?" X

"이 write와 저 read를 연결하는 happens-before 경로가 있나?" O
```

### 같은 스레드 안에서는 프로그램 순서가 기본 관계를 만든다

```java
void publish() {
    data = 42;
    ready = true;
}
```

같은 스레드에서 프로그램 순서상 앞선 동작은 뒤 동작보다 happens-before합니다.

```text
스레드 A

data = 42
   │ 프로그램 순서(program order)
   ▼
ready = true
```

하지만 이 관계만으로 다른 스레드의 읽기까지 연결되지는 않습니다. Thread 사이에는 동기화 동작이 만드는 edge가 필요합니다.

### 모니터와 volatile은 대표적인 스레드 간 간선(edge)를 만든다

한 모니터의 unlock은 동기화 순서상 그 뒤에 오는 같은 모니터의 lock과 synchronizes-with 관계를 만들고, 따라서 happens-before edge가 됩니다.

```text
스레드 A                     스레드 B
data 쓰기
   │
unlock M ────────────────▶ lock M
                              │
                              ▼
                           data 읽기
```

Volatile도 같은 방식으로 추론할 수 있습니다. 같은 volatile 필드에 대한 쓰기는 동기화 순서상 그 뒤의 읽기와 synchronizes-with 관계를 만듭니다.

```java
int data;
volatile boolean ready;

void publish() {
    data = 42;
    ready = true;
}

void consume() {
    if (ready) {
        System.out.println(data);
    }
}
```

```text
스레드 A                         스레드 B
data 쓰기
   │ 프로그램 순서(program order)
write ready=true (volatile)
   │ synchronizes-with
   └────────────────────────▶ ready 읽기
                                │ 프로그램 순서(program order)
                                ▼
                              data 읽기
```

Happens-before는 transitive하므로 이 경로를 통해 `data = 42`에서 reader의 `data` 접근까지 관계를 연결할 수 있습니다.

### start와 join도 스레드 사이의 경계를 만든다

`Thread.start()` 호출은 시작된 스레드의 동작보다 happens-before하고, 한 스레드의 모든 동작은 다른 스레드가 그 스레드에 대한 `join()`에서 성공적으로 반환한 이후 동작보다 happens-before합니다.

```text
caller의 준비 작업
      │
   start()
      │
      ▼
작업 스레드의 동작
      │
작업 스레드 종료
      │
 join() returns
      │
      ▼
caller의 후속 작업
```

`java.util.concurrent`의 여러 API도 이보다 높은 수준의 메모리 consistency 효과를 계약으로 제공합니다. 예를 들어 Executor에 작업을 제출하기 전의 동작과 작업 실행, 비동기 계산과 `Future.get()`, `CountDownLatch.countDown()`과 성공적인 `await()` 사이의 관계를 공식 API 문서에서 정의합니다.

### 데이터 경쟁(data race)은 happens-before로 정확히 정의된다

JMM에서 같은 공유 변수에 대한 두 접근 중 적어도 하나가 쓰기이고, 서로 다른 스레드에서 수행되며, 두 접근이 happens-before로 정렬되지 않았다면 프로그램에 데이터 경쟁이 있습니다.

```text
같은 변수에 대한 read/write 또는 write/write
        +
서로 다른 thread
        +
happens-before ordering 없음
        =
data race
```

데이터 경쟁이 없는 올바르게 동기화된 프로그램에는 순차 일관성(sequential consistency)이 보장됩니다. 다만 JLS가 명시하듯 데이터 경쟁이 없다고 해서 여러 연산을 하나의 원자적 단위로 묶어야 하는 논리 오류까지 자동으로 사라지는 것은 아닙니다.

### happens-before와 원자성(atomicity)를 분리한다

`volatile int count`가 있어도 `count++`는 읽기-수정-쓰기(read-modify-write) 전체가 하나의 원자적 연산이 아닙니다.

```text
happens-before / visibility
→ write와 read 사이의 관찰·순서 관계

원자성(atomicity)
→ 여러 단계를 하나의 분할 불가능한 상태 전이로 보호할지
```

JMM 문제를 풀 때는 중요한 쓰기와 읽기를 표시하고, 같은 스레드의 프로그램 순서를 그린 뒤, 모니터·volatile·start/join·concurrent API가 만드는 스레드 간 간선(edge)를 연결해 보세요. 최종적으로 쓰기에서 읽기까지 transitive happens-before 경로가 있는지를 확인하는 것이 가장 정확한 추론 방법입니다.
