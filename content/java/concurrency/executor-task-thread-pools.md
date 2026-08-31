---
kind: concept
contentKey: java.core.concurrency.executor-task-thread-pools
topicContentKey: java.core.concurrency
slug: executor-task-thread-pools
title: "Executor, tasks, and thread pools"
summary: "작업 제출과 thread 생명주기를 분리하고 worker 수·queue·거부 정책이 처리량과 대기 시간에 어떤 영향을 주는지 이해한다"
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

요청마다 직접 `new Thread(...)`를 만들면 "할 일"과 "그 일을 실행할 thread를 만들고 관리하는 일"이 한 코드에 섞입니다. 요청이 늘어날수록 thread 생성 비용뿐 아니라 동시에 몇 개까지 실행할지, 기다리는 작업을 어디에 둘지, 종료할 때 무엇을 할지까지 직접 관리해야 합니다.

`Executor` 계열은 이 두 책임을 나눕니다. 애플리케이션은 **task를 제출**하고, executor는 **어떤 worker가 언제 실행할지**를 관리합니다.

### task와 worker는 같은 것이 아니다

```java
ExecutorService executor = Executors.newFixedThreadPool(2);

Future<Integer> first = executor.submit(() -> calculate(10));
Future<Integer> second = executor.submit(() -> calculate(20));
```

여기서 lambda 두 개는 수행할 일인 task이고, pool 안의 thread는 task를 실행하는 worker입니다. task를 두 개 제출했다고 새 thread가 반드시 두 개 생성되는 것도 아니고, 제출 즉시 실행된다고 보장되는 것도 아닙니다.

```text
caller
  │ submit
  ▼
work queue ──▶ worker 1
           └─▶ worker 2
```

worker가 모두 바쁘면 새 task는 executor 정책에 따라 queue에서 기다릴 수 있습니다.

### ThreadPoolExecutor는 worker와 queue를 함께 봐야 한다

```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
        2,
        4,
        30,
        TimeUnit.SECONDS,
        new ArrayBlockingQueue<>(100),
        new ThreadPoolExecutor.CallerRunsPolicy()
);
```

이 설정에서 중요한 것은 숫자 하나가 아니라 **worker 수, queue 크기, 거부 정책이 서로 연결되어 있다는 점**입니다.

- `corePoolSize`: 기본적으로 유지하며 사용하는 worker 수
- `maximumPoolSize`: 필요할 때 늘어날 수 있는 최대 worker 수
- work queue: 바로 실행되지 못한 task가 기다리는 곳
- rejection policy: 더 이상 task를 받을 수 없을 때의 처리 방식

`ThreadPoolExecutor`가 새 task를 받았다고 무조건 `maximumPoolSize`까지 worker부터 늘리는 식으로 생각하면 안 됩니다. 현재 worker 수와 queue 종류/상태에 따라 task를 worker에 맡기거나 queue에 넣거나 추가 worker를 만들고, 더 받을 수 없으면 거부 정책이 적용됩니다. 정확한 선택 순서는 API 계약을 기준으로 이해해야 합니다.

### 무제한 queue는 실패를 없애는 것이 아니라 늦출 수 있다

worker가 초당 100개를 처리하는데 초당 500개의 task가 계속 들어온다고 해 보겠습니다.

```text
들어오는 속도  500/s
처리 속도      100/s
───────────────────
queue 증가     400/s
```

queue에 제한이 없다면 당장은 거부가 보이지 않을 수 있지만 대기 시간이 계속 늘고 메모리도 사용합니다. 결국 사용자는 오래된 작업의 결과를 한참 뒤에 받거나 메모리 부족을 만날 수 있습니다.

반대로 bounded queue는 한도를 넘었을 때 실패나 호출자 실행 같은 정책을 드러냅니다. 불편해 보이지만 시스템이 감당할 수 있는 양을 명시한다는 장점이 있습니다.

### pool 크기는 공식 하나로 정하지 않는다

CPU 계산이 대부분인 task와 외부 API/DB 응답을 기다리는 task는 자원 사용 방식이 다릅니다.

CPU 계산 작업에서 worker를 과도하게 늘리면 CPU가 더 생기는 것이 아니라 context switching과 경쟁이 커질 수 있습니다. I/O 대기가 많은 작업은 더 많은 동시 작업이 유리할 수도 있지만, DB connection pool이나 외부 API의 허용 동시 요청 수가 더 작은 병목이라면 thread만 늘려도 처리량은 늘지 않습니다.

따라서 pool 크기는 다음을 함께 봅니다.

- CPU 사용량
- task 실행 시간
- I/O 대기 시간
- queue 대기 시간과 길이
- DB connection 같은 하위 자원 한도
- 실제 처리량과 응답 지연

"CPU 코어 수 × 2" 같은 값을 모든 서버의 정답으로 외우지 않습니다.

### 거부 정책도 시스템 동작의 일부다

pool과 queue가 모두 포화되면 새 작업을 어떻게 할지 결정해야 합니다. `AbortPolicy`처럼 예외로 거부할 수도 있고, `CallerRunsPolicy`처럼 제출한 thread가 직접 task를 실행하도록 할 수도 있습니다.

`CallerRunsPolicy`는 caller를 느리게 만들어 유입 속도를 낮추는 효과가 생길 수 있지만, 어떤 caller가 실행하는지에 따라 request thread가 오래 막히는 부작용도 생깁니다. 따라서 이름만 보고 "자동 backpressure"라고 단정하지 말고 전체 요청 경로를 봐야 합니다.

### shutdown은 새 작업 접수와 기존 작업 처리를 구분한다

```java
executor.shutdown();
```

`shutdown()`은 보통 새 task 제출을 받지 않도록 전환하면서 이미 제출된 task가 끝날 기회를 줍니다. 이미 실행 중인 모든 작업을 즉시 강제 종료하는 메서드가 아닙니다.

더 적극적인 종료를 위해 `shutdownNow()`를 사용할 수 있지만, 실행 중 task의 중단은 interruption에 협력하는 코드인지와 연결됩니다. 외부 I/O나 자원 정리까지 자동으로 완결되는 것은 아닙니다.

### 문제를 풀 때 확인할 것

1. 제출되는 것은 task인지 thread 자체인지 구분합니다.
2. worker가 모두 바쁠 때 task가 어디에 가는지 봅니다.
3. queue가 계속 커질 수 있는지 확인합니다.
4. pool보다 DB connection 같은 하위 자원이 더 작은 병목인지 봅니다.
5. 포화 시 거부 정책과 caller의 동작을 추적합니다.
6. 종료 시 새 task, 대기 task, 실행 중 task를 따로 생각합니다.

### 면접에서 설명한다면

Executor는 작업 제출과 thread 생명주기 관리를 분리하는 실행 추상화입니다. Thread pool에서는 worker 수만 보는 것이 아니라 work queue와 거부 정책을 함께 봐야 합니다. worker나 queue를 크게 만든다고 처리 능력이 무한해지는 것은 아니며 CPU, I/O, DB connection 같은 실제 병목을 측정해 크기를 정해야 합니다.