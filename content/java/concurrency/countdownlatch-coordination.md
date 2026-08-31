---
kind: concept
contentKey: java.core.concurrency.countdownlatch-coordination
topicContentKey: java.core.concurrency
slug: countdownlatch-coordination
title: "CountDownLatch coordination"
summary: "여러 작업의 완료를 하나의 thread 또는 여러 thread가 기다리는 one-shot coordination에 CountDownLatch를 사용하는 목적과 count가 0이 되는 의미를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 130
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CountDownLatch.html"
    title: "Java SE 25 API: CountDownLatch"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: one-shot countDown/await 계약 확인
---
# CountDownLatch coordination

## 쉬운 진입

주 스레드가 여러 초기화 작업이 끝날 때까지 기다리거나, 여러 worker가 작업을 마친
뒤 다음 단계를 시작하고 싶을 때 “남은 신호 수”를 둔다. CountDownLatch는 count가
0이 될 때까지 await를 막고, 한 번 0이 되면 통과시킨다.

## 정확한 메커니즘

~~~
CountDownLatch ready = new CountDownLatch(3);
for (Runnable task : tasks) {
    executor.execute(() -> {
        try {
            task.run();
        } finally {
            ready.countDown();
        }
    });
}
ready.await();
startServing();
~~~

countDown은 count를 하나 줄이며 0 아래로 내리지 않는다. 여러 thread가 await할 수
있고, 성공적인 countDown 전에 한 작업은 같은 latch의 await 이후 관찰과 memory
consistency 관계를 갖는다. task가 예외로 끝나도 finally에서 countDown할지, 실패를
별도로 기록해 주 thread가 확인할지는 application policy다.

CountDownLatch는 reset되지 않는 one-shot 도구다. 반복되는 세대별 barrier나 참여자가
다시 모이는 계산에는 CyclicBarrier·Phaser 등 다른 abstraction을 검토한다. latch가
task 자체를 실행하거나 cancel하는 것은 아니다.

## 흔한 오해

- countDown()이 0이 되었다고 기다리는 thread가 즉시 CPU를 얻는다고 보장하지 않는다.
- CountDownLatch의 count는 자동으로 다시 설정되지 않는다.
- latch는 worker의 예외를 자동으로 전달하지 않는다.
