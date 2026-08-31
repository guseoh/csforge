---
kind: concept
contentKey: java.core.concurrency.concurrency-vs-parallelism
topicContentKey: java.core.concurrency
slug: concurrency-vs-parallelism
title: "Concurrency versus parallelism"
summary: "여러 작업이 겹쳐 진행되는 concurrency와 실제로 동시에 CPU에서 실행되는 parallelism을 구분한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Java SE 25 API: Thread"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java thread의 concurrent execution 계약 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java SE 25 JLS Chapter 17: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: thread execution과 memory model 경계 확인
---
# Concurrency와 parallelism

## 쉬운 진입

두 일을 번갈아 조금씩 진행하면 한 실행 흐름에서도 여러 일이 “겹쳐 진행”된다. 이것이
concurrency다. 두 일을 서로 다른 실행 자원이 같은 시각에 실제로 수행하면 parallelism이다.
따라서 동시성은 작업을 구성하고 다루는 방식이고, 병렬성은 실행이 겹치는 방식에 관한
관찰이다.

## 정확한 메커니즘

~~~
ExecutorService executor = Executors.newFixedThreadPool(2);
Future<?> first = executor.submit(() -> readFile());
Future<?> second = executor.submit(() -> callService());
first.get();
second.get();
executor.shutdown();
~~~

두 작업이 같은 pool에 제출되어도 실제 시작 순서와 실행 시각은 executor와 runtime의
스케줄링에 달려 있다. worker 하나라면 두 task가 번갈아 실행될 수 있어도 동시에 CPU에서
실행되지는 않는다. worker 여러 개와 충분한 실행 자원이 있으면 parallel execution이
가능하지만, task 내부의 shared state는 여전히 interleaving을 고려해야 한다.

## 실전·면접 연결

I/O 대기와 CPU 계산은 concurrency의 이점과 병렬성의 이점이 서로 다르다. Java API는
Thread와 Executor라는 실행 abstraction을 제공하며, 어떤 OS thread에 언제 배치되는지는
OS·JDK implementation 선택이다. “thread를 여러 개 만들면 반드시 빨라진다”는 식으로
성능을 결론내리지 말고 병목, 대기, 자원 경쟁을 분리해 생각한다.

## 흔한 오해

- concurrency가 항상 parallelism을 뜻하지 않는다.
- parallelism이 있어도 공유 데이터에 대한 race가 자동으로 사라지지 않는다.
- Java Thread API가 특정 OS 스케줄링 순서나 실행 시간을 보장하지 않는다.
