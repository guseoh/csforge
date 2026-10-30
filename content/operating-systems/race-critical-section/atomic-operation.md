---
kind: concept
contentKey: operating-systems.core.race-critical-section.atomic-operation
topicContentKey: operating-systems.core.race-critical-section
slug: atomic-operation
title: "원자적 연산(Atomic Operation)"
summary: "중간 상태가 관찰되지 않는 원자적 상태 전이와 가시성·순서·복합 불변 조건의 경계를 설명한다."
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
# 원자적 연산(Atomic Operation)

원자적 연산은 동시 실행 환경에서 **중간 상태가 다른 실행 흐름에 노출되지 않고 하나의 분할 불가능한 상태 전이처럼 보이도록 보장된 연산**이다.

예를 들어 원자적 증가가 `10 → 11`을 보장한다면 다른 스레드가 같은 이전 값 10을 기준으로 중간 단계에 끼어들어 한 번의 갱신을 잃게 만들지 않도록 동작해야 한다.

### 소스 코드 한 줄과 원자성은 같은 개념이 아니다

`counter++`가 한 줄이라고 원자적인 것은 아니다. 반대로 내부적으로 여러 기계어 단계를 사용하더라도 CPU의 원자적 연산 도구나 락을 이용해 더 큰 연산을 하나의 상태 전이처럼 보이게 만들 수 있다.

따라서 원자성을 판단할 때는 코드 줄 수가 아니라 **어떤 관찰 가능한 상태 전이를 한 번에 일어난 것처럼 보장하는가**를 본다.

### 원자성과 순서·가시성은 분리해서 생각한다

하나의 갱신이 원자적이라는 사실만으로 주변의 모든 메모리 접근이 원하는 순서로 관찰된다는 뜻은 아니다. 언어·런타임의 atomic API가 순서나 가시성까지 함께 보장할 수 있지만, 그것은 해당 메모리 모델이 별도로 정하는 계약이다.

이 운영체제 Concept에서는 원자성 자체에 집중한다. Java의 `volatile`, happens-before 같은 구체적인 보장은 Java Memory Model 영역에서 따로 판단해야 한다.

### 원자적 연산 하나가 모든 불변 조건을 보호하는 것은 아니다

카운터 하나의 증가라면 하나의 원자적 읽기-수정-쓰기(read-modify-write)로 충분할 수 있다. 하지만 여러 필드가 함께 바뀌어야 하나의 불변 조건이 유지된다면 각 필드를 개별적으로 원자적으로 만드는 것만으로 전체 상태 전이까지 원자적이 되지는 않는다.

원자적 연산의 핵심은 **도구가 계약한 범위의 상태 전이만 분할 불가능하게 만들 뿐이며, 보호해야 할 불변 조건이 더 크다면 그 전체 범위를 덮는 별도의 동기화 규칙이 필요하다는 점**이다.

### 흐름으로 보기

```text
비원자적 증가의 한 실행 순서
Thread A: read 10 ───────── write 11
Thread B:      read 10 ───────── write 11
결과: 11  (두 번 증가했지만 한 번의 갱신이 사라짐)

원자적 증가
10 → 11 → 12
```
