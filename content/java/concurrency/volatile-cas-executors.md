---
kind: concept
contentKey: java.core.concurrency.volatile-cas-executors
topicContentKey: java.core.concurrency
slug: volatile-cas-executors
title: volatile, CAS, ExecutorService
summary: 가시성 변수와 원자 갱신, 작업 실행기 추상화를 상황에 맞게 선택한다
level: 3
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java Language Specification 17장: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: volatile와 happens-before 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorService.html"
    title: ExecutorService API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 작업 제출·종료 lifecycle 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/package-summary.html"
    title: java.util.concurrent.atomic API
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: CAS 기반 원자 변수 연산 확인
---
# volatile, CAS, ExecutorService

`volatile` 필드는 읽기·쓰기에 대한 가시성과 순서 규칙을 제공하지만 `count++` 같은 읽기-수정-쓰기 복합 연산을 자동으로 원자화하지 않습니다. 단순한 상태 플래그처럼 한 번의 쓰기와 읽기로 의미가 완성되는 경우와, 여러 필드의 불변식을 함께 갱신해야 하는 경우를 구분해야 합니다.

CAS(compare-and-set)는 현재 값이 예상 값과 같을 때만 새 값으로 바꾸는 원자 조건부 갱신입니다. `AtomicInteger.incrementAndGet()`처럼 작은 독립 상태의 경쟁 갱신에 적합하지만, 여러 객체를 함께 바꾸는 불변식에는 lock이나 다른 설계가 필요할 수 있습니다.

`ExecutorService`는 작업(task)을 제출하고 실행 스레드의 수명·종료를 관리하는 추상화입니다. 작업과 스레드를 분리하면 호출자가 매번 스레드를 직접 만들지 않아도 되지만, executor를 만들었다면 shutdown과 queue·동시성 제한을 운영 계약으로 다뤄야 합니다.
