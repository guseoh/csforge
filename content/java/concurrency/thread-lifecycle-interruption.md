---
kind: concept
contentKey: java.core.concurrency.thread-lifecycle-interruption
topicContentKey: java.core.concurrency
slug: thread-lifecycle-interruption
title: "Thread lifecycle and interruption"
summary: "Thread start/join/sleep과 lifecycle state를 이해하고 interruption이 강제 종료가 아니라 cooperative cancellation 신호라는 점을 설명한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Java SE 25 API: Thread"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: lifecycle, interrupt, join, sleep 계약 확인
---
# Thread lifecycle과 interruption

## 쉬운 진입

Thread 객체를 만든 것과 실행이 시작된 것은 다르다. start()를 호출해야 실행이 예약되고,
run()이 끝나면 thread가 종료된다. 다른 thread가 끝날 때까지 기다리려면 join()을 사용하며,
interrupt()는 상대 thread에게 “중단을 검토하라”고 알리는 협력적 신호다.

## 정확한 메커니즘

~~~
Thread worker = new Thread(() -> {
    try {
        while (!Thread.currentThread().isInterrupted()) {
            doSmallUnit();
            Thread.sleep(100);
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt(); // 상위 정책에 신호 보존
    }
});
worker.start();
worker.join();
~~~

Thread.State에는 NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED가 있다.
이는 JVM의 관찰 가능한 상태 이름이지 OS scheduler의 모든 상태를 그대로 노출하는 목록은
아니다. sleep()이나 interruptible wait 중 interrupt를 받으면 InterruptedException이
발생하면서 interrupted status가 지워질 수 있다. 그 예외를 처리하고도 취소 의사를
전달해야 하면 다시 interrupt하거나 상위에 예외를 전파한다.

## 실전·면접 연결

작업이 interrupt를 무시하면 호출자는 thread를 강제로 죽일 수 없다. executor task에서는
현재 작업을 정리하고 반환하는 cancellation protocol을 설계한다. interrupt 상태가 이미
설정된 thread에서 interruptible blocking API의 동작은 API contract를 읽고, catch 블록에서
무조건 조용히 삼키지 않는다.

## 흔한 오해

- interrupt()가 대상 thread의 실행을 즉시 종료시키지 않는다.
- run()을 직접 호출하면 새 thread에서 실행되지 않는다.
- InterruptedException을 잡았다는 이유만으로 취소를 완료한 것이 아니다.
