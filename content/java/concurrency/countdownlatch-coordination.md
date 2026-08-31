---
kind: concept
contentKey: java.core.concurrency.countdownlatch-coordination
topicContentKey: java.core.concurrency
slug: countdownlatch-coordination
title: "CountDownLatch coordination"
summary: "여러 작업이 끝날 때까지 기다리는 one-shot 동기화 도구로 CountDownLatch를 사용하고 count·await·실패 처리의 의미를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 130
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CountDownLatch.html"
    title: "Java SE 25 API: CountDownLatch"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: one-shot countDown/await와 memory consistency 계약 확인
---
# CountDownLatch로 여러 작업의 완료 기다리기

서버가 시작되기 전에 세 개의 초기화 작업이 모두 끝나야 하거나, 테스트에서 여러 worker가 작업을 마칠 때까지 주 thread가 기다려야 할 수 있습니다. 이때 각 thread를 하나씩 `join()`하는 대신 **"아직 끝나야 할 신호가 몇 개 남았는가"**를 하나의 값으로 관리할 수 있습니다.

`CountDownLatch`는 이 남은 신호 수를 세고, count가 0이 될 때까지 기다리는 thread를 막아 두는 도구입니다.

### count는 남은 작업 수를 표현한다

```java
CountDownLatch done = new CountDownLatch(3);
```

초기 count가 3이면 세 번의 `countDown()`이 필요합니다.

```text
초기 count = 3
worker A 완료 -> 2
worker B 완료 -> 1
worker C 완료 -> 0
                    │
                    └─ await 중인 thread 진행 가능
```

`countDown()`을 호출한 thread가 특별한 소유권을 갖는 것은 아닙니다. 여러 thread가 각각 완료 시점을 알릴 수 있습니다.

### `await()`는 count가 0이 될 때까지 기다린다

```java
CountDownLatch done = new CountDownLatch(tasks.size());

for (Runnable task : tasks) {
    executor.execute(() -> {
        try {
            task.run();
        } finally {
            done.countDown();
        }
    });
}

done.await();
startNextStep();
```

주 thread는 `done.await()`에서 기다립니다. worker들이 모두 `countDown()`을 호출해 count가 0이 되면 다음 단계로 갈 수 있습니다.

여기서 `await()`가 반환됐다는 것은 **정해진 횟수의 신호가 도착했다**는 뜻입니다. 모든 worker가 업무적으로 성공했다는 뜻은 아닙니다.

### 실패한 작업도 count를 줄일지 정책이 필요하다

위 코드에서 `countDown()`을 `finally`에 둔 이유를 생각해야 합니다.

```java
try {
    task.run();
} finally {
    done.countDown();
}
```

만약 `task.run()`이 예외로 끝났는데 `countDown()`이 실행되지 않으면 주 thread는 영원히 기다릴 수 있습니다. 그래서 "작업 시도가 끝났음"을 latch count로 표현한다면 `finally`가 자연스럽습니다.

하지만 이 경우 latch가 0이 됐다고 작업이 성공한 것은 아니므로 실패 결과는 따로 수집해야 합니다.

```text
Latch의 의미: 모든 작업이 종료됨
별도 결과:     성공 2 / 실패 1
```

동기화 도구와 업무 성공 여부를 같은 상태로 착각하지 않는 것이 중요합니다.

### CountDownLatch는 한 번 쓰면 다시 채울 수 없다

count가 0이 된 latch는 다시 3이나 5로 reset되지 않습니다. 그래서 공식 설명에서도 one-shot synchronization aid로 다룹니다.

반복 라운드마다 참여자들이 다시 모여야 하는 작업이라면 `CyclicBarrier`나 `Phaser`처럼 다른 도구가 더 맞을 수 있습니다. 중요한 것은 클래스 이름을 많이 아는 것이 아니라 **내 문제의 상태가 한 번 끝나는지, 여러 세대에 걸쳐 반복되는지** 구분하는 것입니다.

### 여러 thread가 동시에 기다릴 수도 있다

한 latch에 여러 thread가 `await()`할 수 있습니다. count가 0이 되면 그 조건을 기다리던 thread들이 진행할 수 있게 됩니다.

다만 count가 0이 되는 순간 모든 waiting thread가 정확히 같은 시각에 CPU를 얻는다는 뜻은 아닙니다. 실제 실행 순서는 runtime과 OS scheduling에 달려 있습니다.

### 완료 전에 한 작업은 await 이후 관찰과 연결된다

`CountDownLatch` API는 `countDown()` 이전의 작업과 다른 thread에서 성공적으로 `await()`한 이후의 작업 사이에 memory consistency 효과를 정의합니다. 따라서 단순히 숫자만 세는 유틸리티가 아니라 thread 간 완료 지점을 전달하는 동시성 계약을 가집니다.

이 보장을 "CPU cache를 강제로 비운다" 같은 특정 하드웨어 설명으로 축소하지 말고 Java API의 happens-before 관계로 이해합니다.

### timeout과 interruption도 고려한다

```java
boolean completed = done.await(5, TimeUnit.SECONDS);
```

외부 서비스나 worker 오류 때문에 count가 끝내 0이 되지 않을 수 있다면 무한 대기 대신 timeout을 둘 수 있습니다. `await()`는 interruption에도 반응할 수 있으므로 호출자가 취소 정책을 어떻게 처리할지도 정해야 합니다.

### 어떤 상황에 적합한가

`CountDownLatch`는 이런 문제에 잘 맞습니다.

- N개의 초기화가 모두 끝난 뒤 서버 준비 상태 전환
- 여러 병렬 작업이 끝날 때까지 테스트에서 기다리기
- 한 번의 batch 단계에서 모든 worker 완료 후 다음 단계 시작

반대로 worker가 계속 생성되고 종료되는 장기 실행 queue의 "현재 진행 중 작업 수"처럼 계속 변하는 상태를 표현하는 데는 적합하지 않을 수 있습니다.

### 문제를 풀 때 확인할 것

1. 초기 count가 무엇을 의미하는지 문장으로 적습니다.
2. 어떤 경로에서 `countDown()`이 호출되는지 확인합니다.
3. 예외가 발생해도 count가 줄어야 하는지 봅니다.
4. `await()` 반환이 업무 성공을 뜻하는지 단순 완료를 뜻하는지 구분합니다.
5. 재사용이 필요한 문제인지 확인합니다.
6. 무한 대기 대신 timeout이 필요한지 생각합니다.

### 면접에서 설명한다면

`CountDownLatch`는 정해진 횟수의 완료 신호가 올 때까지 하나 이상의 thread가 기다리게 하는 one-shot 동기화 도구입니다. 작업마다 `countDown()`을 호출하고 기다리는 쪽은 `await()`를 사용합니다. count가 0이 됐다는 사실과 업무 성공 여부는 별개이며, 예외 경로와 timeout을 함께 설계해야 합니다.
