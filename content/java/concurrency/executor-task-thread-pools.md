---
kind: concept
contentKey: java.core.concurrency.executor-task-thread-pools
topicContentKey: java.core.concurrency
slug: executor-task-thread-pools
title: "Executor, tasks, and thread pools"
summary: "task submission과 thread lifecycle을 분리하고 pool size, work queue와 resource limit가 시스템 동작에 미치는 영향을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 110
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/package-summary.html"
    title: "Java SE 25 API: java.util.concurrent"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: ExecutorService와 task execution framework 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html"
    title: "Java SE 25 API: ThreadPoolExecutor"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: worker·queue·rejection 동작 확인
---
# Executor, task와 thread pool

## 쉬운 진입

task는 수행할 일이고 worker thread는 그 일을 실행하는 자원이다. Executor는 caller가
직접 thread를 만들고 join하는 대신 task 제출과 실행 정책을 분리한다. pool은 worker를
재사용하지만, 무한한 작업 처리 능력을 의미하지 않는다.

## 정확한 메커니즘

~~~
ThreadPoolExecutor executor = new ThreadPoolExecutor(
        2, 4, 30, TimeUnit.SECONDS,
        new ArrayBlockingQueue<>(100),
        new ThreadPoolExecutor.CallerRunsPolicy());
Future<Integer> result = executor.submit(() -> compute());
int value = result.get();
executor.shutdown();
~~~

ThreadPoolExecutor는 core/max worker 수, keep-alive, work queue와 rejection policy의
조합으로 동작한다. task가 즉시 worker에서 실행되지 않고 queue에 쌓일 수 있으며, bounded
queue는 메모리와 대기 시간을 제한하는 대신 saturation 시 거부나 caller 실행 같은
정책을 요구한다. unbounded queue는 queue가 커지는 위험을 숨길 수 있다.

적절한 pool size는 CPU 수, I/O 대기, 작업 시간, 외부 자원 한도와 관측 결과에 따라 정한다.
Java API는 이 정책을 구성할 수 있게 하지만 특정 크기를 정답으로 보장하지 않는다. task
제출과 executor shutdown의 lifecycle을 분리하지 않으면 애플리케이션이 종료되지 않거나
새 작업이 뒤늦게 거부될 수 있다.

## 흔한 오해

- ExecutorService에 submit한 task가 반드시 즉시 실행되지 않는다.
- pool size를 늘리면 외부 DB·CPU·메모리 병목이 자동으로 해결되지 않는다.
- shutdown()은 이미 실행 중인 작업을 무조건 중단시키는 호출이 아니다.
