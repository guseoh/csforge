---
kind: concept
contentKey: java.core.concurrency.blockingqueue-producer-consumer
topicContentKey: java.core.concurrency
slug: blockingqueue-producer-consumer
title: "BlockingQueue와 생산자·소비자"
summary: "생산자와 소비자의 처리 속도가 다를 때 BlockingQueue가 작업을 전달하고 full/empty 상태에서 어떻게 기다리게 하는지 이해한다"
level: 2
status: PUBLISHED
displayOrder: 120
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/BlockingQueue.html"
    title: "Java SE 25 API: BlockingQueue"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: put/take·offer/poll과 memory consistency 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ArrayBlockingQueue.html"
    title: "Java SE 25 API: ArrayBlockingQueue"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 고정 capacity queue의 동작 확인
---
# BlockingQueue와 생산자·소비자

파일을 읽는 작업은 빠른데 처리하는 작업은 느리거나, 요청을 받는 쪽과 실제 작업을 수행하는 쪽의 속도가 다를 수 있습니다. 두 쪽을 직접 맞물리게 하면 생산자가 소비자를 계속 기다리거나, 반대로 소비자가 할 일이 올 때까지 반복해서 확인하는 코드가 필요합니다.

이때 대기열을 사이에 두면 **생산자(producer)는 작업을 넣고 소비자(consumer)는 작업을 꺼내는 역할**로 나뉩니다. `BlockingQueue`는 여기에 "비어 있거나 가득 찼을 때 기다리는 동작"까지 API로 제공합니다.

### 큐가 두 작업의 속도 차이를 흡수한다

```text
생산자(producer) ──▶ [ 작업 ][ 작업 ][     ] ──▶ 소비자(consumer)
                 BlockingQueue
```

생산자가 잠깐 더 빠르면 큐에 작업이 쌓이고 소비자가 나중에 처리할 수 있습니다. 하지만 소비자가 계속 더 느리다면 큐가 무한히 커져서는 안 됩니다. 그래서 실무에서는 용량이 있는 bounded 큐가 중요한 경우가 많습니다.

```java
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(100);
```

이 큐에는 최대 100개의 원소만 들어갈 수 있습니다.

### `put`과 `take`는 상태가 바뀔 때까지 기다린다

```java
void produce(Task task) throws InterruptedException {
    queue.put(task);
}

Task consume() throws InterruptedException {
    return queue.take();
}
```

`put`은 큐가 가득 찼다면 자리가 생길 때까지 기다립니다. `take`는 큐가 비었다면 원소가 들어올 때까지 기다립니다.

```text
대기열 가득 참
Producer -- put --> [기다림]
                       │
소비자 -- take ------┘ 자리 발생

대기열 비어 있음
Consumer -- take --> [기다림]
                       │
생산자 -- put -------┘ 작업 도착
```

이 기다림은 CPU를 계속 돌며 `isEmpty()`를 확인하는 busy waiting과 다릅니다. 정확히 어떤 OS 대기 방식이 사용되는지는 구현 영역이지만, Java API 관점에서는 호출 스레드가 조건이 충족될 때까지 진행하지 않는 블로킹 연산입니다.

### 기다리는 방법은 하나가 아니다

`BlockingQueue`에는 요구에 맞는 여러 형태의 메서드가 있습니다.

- `put`: 넣을 수 있을 때까지 기다림
- `take`: 꺼낼 수 있을 때까지 기다림
- `offer`: 지금 바로 넣을 수 없으면 실패 결과 반환
- `poll`: 지금 바로 꺼낼 것이 없으면 빈 결과 반환
- 타임아웃이 있는 `offer`/`poll`: 일정 시간까지만 기다림

서버 요청 스레드에서 `put`이 오래 막히는 것이 허용되는지, 아니면 즉시 거부하거나 타임아웃을 줘야 하는지는 애플리케이션 정책입니다.

### bounded 큐는 메모리 보호와 backpressure의 단서를 준다

생산 속도가 1,000/s, 소비 속도가 500/s라면 차이는 계속 쌓입니다.

```text
초당 +500 task
10초  -> +5,000
60초  -> +30,000
```

무제한 큐는 이 차이를 메모리에 계속 숨길 수 있습니다. bounded 큐는 결국 생산자에게 "더 이상 바로 받을 수 없다"는 상태를 드러냅니다.

`put`을 쓰면 생산자가 기다리고, `offer`를 쓰면 호출자가 실패를 처리할 수 있습니다. 이것이 시스템에 유입되는 속도를 제어하는 backpressure 설계의 한 부분이 될 수 있지만, `BlockingQueue` 하나만 둔다고 전체 시스템의 backpressure 전략이 자동으로 완성되는 것은 아닙니다.

### 큐에 넣은 것과 작업 완료는 다르다

```text
Producer
  │ put(task)
  ▼
Queue
  │ take()
  ▼
Consumer
  │ 실제 처리
  ▼
외부 DB/API 변경
```

`put()`이 성공했다는 것은 큐가 작업을 받아들였다는 뜻입니다. 소비자가 그 작업을 성공적으로 처리했다는 뜻이 아닙니다. 소비자가 예외로 실패할 수 있고 프로세스가 종료될 수도 있습니다.

따라서 "큐에 넣었으니 업무가 완료됐다"고 판단하면 안 됩니다. 성공 확인, 재시도, 영속적인 메시징이 필요한지는 별도의 시스템 요구사항입니다. 이 Concept에서는 JVM 내부의 스레드 간 전달을 다루고, Kafka 같은 durable broker의 전달 보장은 Messaging 영역에서 다룹니다.

### 스레드 사이에 값을 전달할 때 메모리 일관성도 중요하다

`BlockingQueue`의 공식 API는 한 스레드가 원소를 큐에 넣기 전에 수행한 작업과 다른 스레드가 그 원소를 제거한 뒤 수행하는 작업 사이에 메모리 일관성 효과를 정의합니다. 즉 올바른 API를 통한 전달은 단순한 컬렉션 저장 이상의 동시성 계약을 가집니다.

다만 큐에 들어 있는 객체가 이후 여러 스레드에서 동시에 수정된다면 그 가변 상태 자체의 동기화는 별도 문제입니다.

### 종료 정책을 미리 정해야 한다

무한 loop에서 `take()`를 호출하는 소비자는 작업이 없으면 기다립니다. 애플리케이션 종료 시 어떻게 빠져나올지도 설계해야 합니다.

가능한 방식은 상황에 따라 다릅니다.

- 소비자 스레드를 interrupt하고 interruption을 처리
- 특별한 종료 메시지(poison/sentinel)를 전달
- 별도 종료 상태와 타임아웃 poll을 함께 사용

어떤 방식이든 정상 작업과 종료 신호가 충돌하지 않게 해야 합니다.

### 문제를 풀 때 확인할 것

1. 생산자와 소비자 중 어느 쪽의 처리 속도가 더 빠를 수 있는지 살펴봅니다.
2. 큐에 용량이 있는지 확인합니다.
3. full일 때 `put`/`offer`가 어떻게 다르게 동작하는지 봅니다.
4. 비어 있음일 때 `take`/`poll`을 구분합니다.
5. 큐 삽입 성공과 실제 업무 완료를 구분합니다.
6. shutdown/interruption 경로를 확인합니다.

### 학습 후 스스로 설명해 보기

`BlockingQueue`는 생산자와 소비자 사이에서 스레드 안전하게 작업을 전달하고, 대기열이 비거나 가득 찬 상태에서 기다리는 API를 제공합니다. 크기가 제한된 대기열을 사용하면 처리 속도보다 유입 속도가 계속 빠를 때 대기열이 무제한으로 커지는 것을 막을 수 있습니다. 다만 대기열에 작업을 넣었다고 실제 처리가 완료된 것은 아니므로 실패와 종료 정책은 별도로 설계해야 합니다.
