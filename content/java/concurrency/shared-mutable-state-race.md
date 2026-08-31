---
kind: concept
contentKey: java.core.concurrency.shared-mutable-state-race
topicContentKey: java.core.concurrency
slug: shared-mutable-state-race
title: "Shared mutable state and race"
summary: "여러 thread가 같은 mutable state를 읽고 쓰면서 lost update와 race condition이 발생하는 interleaving을 식별하고 보호해야 할 invariant를 찾는다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java SE 25 JLS Chapter 17: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: shared variable와 data race의 언어 모델 확인
---
# Shared mutable state와 race

## 쉬운 진입

두 thread가 같은 숫자를 읽고 각각 1을 더해 저장하면, 둘 다 0을 읽은 뒤 1을 저장하는
순서가 가능하다. 두 번 증가했지만 결과는 1인 lost update다. 문제는 더하기 문장이
짧다는 것이 아니라 읽기·계산·쓰기라는 여러 단계가 하나의 보호된 단위가 아니라는 데 있다.

## 정확한 메커니즘

~~~
class Counter {
    private int value;

    void increment() {
        value++; // read -> add -> write
    }
}
~~~

race condition은 실행 결과가 thread interleaving에 의존해 요구한 invariant를 깨뜨리는
상태다. invariant가 “재고는 음수가 아니다”라면 단순히 count 변수 하나를 보호하는 것만
으로 충분하지 않고, 재고 확인과 차감이 같은 원자적 경계 안에 있어야 한다. 해결책은
state를 공유하지 않거나, immutable message를 전달하거나, synchronized/Lock/atomic
operation으로 실제 invariant의 경계를 보호하는 것이다.

JLS의 Java Memory Model은 data race가 있는 프로그램에서 모든 관찰을 순차 실행처럼
가정하지 않게 한다. visibility 문제와 atomicity 문제는 별개이므로, 값이 보인다는
것만으로 read-modify-write가 안전해지지 않는다.

## 흔한 오해

- 한 줄의 source code가 여러 memory action을 자동으로 원자화하지 않는다.
- volatile을 붙이는 것만으로 count++의 lost update가 해결되지 않는다.
- thread 수를 줄이는 것이 invariant 보호를 대신하지 않는다.
