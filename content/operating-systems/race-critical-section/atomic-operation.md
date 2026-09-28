---
kind: concept
contentKey: operating-systems.core.race-critical-section.atomic-operation
topicContentKey: operating-systems.core.race-critical-section
slug: atomic-operation
title: "원자적 연산(원자적 연산)"
summary: "중간 상태가 관찰되지 않는 원자적 transition과 visibility·ordering·복합 불변 조건의 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf"
    title: "Operating Systems: Three Easy Pieces — Locks"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "mutex/lock이 atomic primitive를 이용해 critical section의 mutual exclusion을 구현하는 방식을 확인한다."
    displayOrder: 1
  - url: "https://man7.org/linux/man-pages/man2/futex.2.html"
    title: "futex(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux futex가 atomic user-space state와 kernel blocking/wakeup을 연결하는 방식을 확인한다."
    displayOrder: 2
---
# 원자적 연산(원자적 연산)

원자적 연산은 concurrent 실행에서 **중간 상태가 다른 실행 흐름에 노출되지 않는 하나의 indivisible 상태 transition처럼 보이는 연산**이다.

예를 들어 원자적 increment가 `10 → 11`을 보장한다면 다른 스레드가 같은 이전 값 10을 기준으로 중간 단계에 끼어들어 갱신를 잃게 만들지 않도록 primitive가 동작한다.

### Source 코드 한 줄과 atomicity는 같은 개념이 아니다

`counter++`가 한 줄이라고 원자적한 것은 아니다. 반대로 내부적으로 여러 machine step을 사용하더라도 CPU 원자적 primitive나 lock을 이용해 더 큰 연산을 하나의 원자적 transition처럼 보이게 만들 수 있다.

따라서 atomicity를 판단할 때는 코드 줄 수가 아니라 **어떤 observable 상태 transition을 한 번에 보이도록 보장하는가**를 본다.

### Atomicity와 ordering·visibility는 분리해서 생각한다

하나의 갱신가 원자적하다는 사실만으로 주변의 모든 메모리 접근가 원하는 순서로 관찰된다는 뜻은 아니다. Language/런타임의 원자적 API가 ordering이나 visibility 의미까지 제공할 수 있지만 이는 해당 메모리 model의 별도 계약이다.

이 OS Concept에서는 원자성 자체에 집중한다. Java의 `volatile`, happens-before 같은 구체적인 보장은 Java/JMM 영역에서 따로 판단해야 한다.

### 원자적 primitive 하나가 모든 불변 조건를 보호하는 것은 아니다

Counter 하나의 증가라면 하나의 원자적 read-modify-write로 충분할 수 있다. 하지만 여러 field가 함께 바뀌어야 하나의 불변 조건가 유지된다면 각 field를 개별적으로 원자적하게 만드는 것만으로 전체 transition이 원자적해지지는 않는다.

원자적 연산의 핵심은 **primitive가 계약한 범위의 상태 transition을 indivisible하게 만들 뿐이며, 보호해야 할 불변 조건가 더 크다면 그 범위를 덮는 별도의 동기화 프로토콜이 필요하다는 점**이다.

### 흐름으로 보기

```text
비원자적 증가의 한 실행 순서
Thread A: read 10 ───────── write 11
Thread B:      read 10 ───────── write 11
결과: 11  (두 번 증가했지만 한 번의 갱신이 사라짐)

원자적 증가
10 → 11 → 12
```
