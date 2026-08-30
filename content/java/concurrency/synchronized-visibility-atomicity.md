---
kind: concept
contentKey: java.core.concurrency.synchronized-visibility-atomicity
topicContentKey: java.core.concurrency
slug: synchronized-visibility-atomicity
title: synchronized, 가시성, 원자성
summary: 임계 구간 보호와 메모리 가시성, 복합 연산의 원자성을 구분한다
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java Language Specification 17장: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: synchronized와 happens-before 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html"
    title: Object API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: wait/notify와 intrinsic lock API 확인
---
# synchronized와 메모리 규칙

`synchronized`는 같은 모니터에 대한 임계 구간의 상호 배제를 제공하고, 모니터 unlock과 이후 lock 사이에 메모리 가시성 관계를 만듭니다. 한 스레드가 보호된 상태를 바꾸고 다른 스레드가 같은 lock을 획득해 읽으면 해당 변경을 안전하게 관찰할 수 있습니다.

가시성(visibility)은 다른 스레드가 최신 값을 볼 수 있는지, 원자성(atomicity)은 한 연산이 중간 상태로 쪼개져 관찰되지 않는지의 문제입니다. `synchronized`는 보호 범위 안의 복합 연산을 묶는 데 유용하지만, 모든 코드가 같은 lock을 사용해야 계약이 성립합니다.

```java
synchronized (lock) {
    balance -= amount;
}
```

lock을 여러 개 중첩하면 순서를 일관되게 정해 deadlock 가능성을 줄입니다. 락을 잡은 채 외부 네트워크 호출을 하면 경쟁 시간이 길어질 수 있으므로 임계 구간을 짧고 명확하게 유지합니다.
