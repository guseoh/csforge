---
kind: concept
contentKey: operating-systems.core.threads.thread-pool
topicContentKey: operating-systems.core.threads
slug: thread-pool
title: "스레드 풀(Thread Pool)"
summary: "작업 스레드 재사용·대기열·거부 정책을 처리 용량이 제한된 실행 시스템 관점에서 설명한다."
level: 1
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html"
    title: "Java SE 25 API: ThreadPoolExecutor"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 스레드 풀(Thread Pool)

스레드 풀은 작업마다 새 플랫폼 스레드를 만들지 않고 **미리 준비한 작업 스레드(worker)를 재사용**하는 실행 구조다. 생성·종료 비용을 줄이는 효과도 있지만, 더 중요한 역할은 동시에 실행할 작업 수에 명확한 경계를 두는 데 있다.

```text
생산자 → 작업 대기열 → 작업 스레드 1
                    → 작업 스레드 2
                    → 작업 스레드 3
```

모든 작업 스레드가 바쁘면 새 작업은 즉시 실행되지 않는다. 대기열에서 차례를 기다리거나, 대기열까지 가득 찼다면 받아들일지 거부할지를 정한 정책의 영향을 받는다.

### 작업 스레드 수와 대기열은 서로 다른 두 경계다

작업 스레드 수는 동시에 실행할 수 있는 작업 수를 제한한다. 대기열은 당장 실행하지 못하는 작업을 저장한다.

처리 가능한 속도보다 작업이 더 빠르게 들어오면 대기열은 계속 길어진다. 대기열을 무한히 키운다고 과부하가 사라지는 것은 아니다. 과부하 비용이 **거부 대신 더 긴 대기 시간과 더 큰 메모리 사용량으로 이동할 뿐**이다.

```text
도착 속도 > 처리 속도
        ↓
대기열 증가
        ↓
대기 시간 증가
```

그래서 크기가 제한된 대기열과 거부·역압(backpressure) 정책은 단순한 실패 처리가 아니라 **시스템이 감당할 수 있는 실행량의 경계를 드러내는 장치**다.

### 풀 내부의 작업이 서로의 완료를 기다리면 진행이 멈출 수 있다

모든 작업 스레드가 부모 작업에 점유된 상태에서, 각 부모 작업이 같은 풀에 제출한 자식 작업의 완료를 동기적으로 기다린다고 하자. 자식 작업은 대기열에 들어가 있지만 이를 실행할 빈 작업 스레드가 없으므로 부모도 끝날 수 없다.

이 상황은 락의 순환 대기가 없어도 발생할 수 있다. **제한된 실행 자원이 모두 부모 작업에 점유된 채 그 부모가 같은 자원을 필요로 하는 자식 작업을 기다리기 때문**이다.

스레드 풀의 핵심은 단순한 스레드 재사용이 아니라 **작업 스레드 수와 대기열로 동시 실행량을 제한하고, 처리 용량을 넘긴 부하를 어디에서 기다리게 하거나 거부할지 결정하는 실행 시스템**이라는 점이다.