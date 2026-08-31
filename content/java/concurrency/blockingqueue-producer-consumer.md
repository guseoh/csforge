---
kind: concept
contentKey: java.core.concurrency.blockingqueue-producer-consumer
topicContentKey: java.core.concurrency
slug: blockingqueue-producer-consumer
title: "BlockingQueue and producer-consumer"
summary: "BlockingQueue의 put/take와 bounded capacity를 이용해 producer-consumer 사이의 handoff와 full/empty 상태에서 기다리는 동작을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 120
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/BlockingQueue.html"
    title: "Java SE 25 API: BlockingQueue"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: put/take와 capacity 동작 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ArrayBlockingQueue.html"
    title: "Java SE 25 API: ArrayBlockingQueue"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: bounded queue 구현 확인
---
# BlockingQueue와 producer-consumer

## 쉬운 진입

producer가 물건을 만들고 consumer가 처리하는 속도가 다르면 둘 사이에 queue를 둔다.
BlockingQueue는 queue가 비었을 때 consumer가 기다리고, bounded queue가 가득 찼을 때
producer가 기다리게 하여 양쪽의 속도 차이를 표현한다.

## 정확한 메커니즘

~~~
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(100);

void produce(Task task) throws InterruptedException {
    queue.put(task);   // 가득 차면 자리가 날 때까지 대기
}

Task consume() throws InterruptedException {
    return queue.take(); // 비어 있으면 task가 올 때까지 대기
}
~~~

put/take는 interruptible blocking operation이다. offer/poll은 즉시 결과를 주고,
timeout overload는 유한한 기다림을 표현한다. bounded capacity는 queue가 무한히 자라
메모리를 소진하는 상황을 줄이지만, producer가 막혔을 때 호출자에게 backpressure를
어떻게 전달할지와 shutdown sentinel/interrupt 정책을 함께 설계해야 한다.

Java API의 concurrent collection과 blocking operation 계약은 thread 간 handoff와 memory
consistency를 제공한다. 그러나 queue에 넣었다고 task 내부의 외부 side effect가 모두
완료되거나 consumer가 작업을 반드시 성공한다는 뜻은 아니다.

## 흔한 오해

- BlockingQueue가 full/empty 상태를 항상 예외로 알리는 것은 아니다. put/take는 기다린다.
- bounded queue가 producer와 consumer의 속도를 같게 만들어 주지는 않는다.
- interrupt를 무시한 consumer는 shutdown 요청에 계속 남을 수 있다.
