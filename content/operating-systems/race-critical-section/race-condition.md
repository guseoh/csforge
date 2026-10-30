---
kind: concept
contentKey: operating-systems.core.race-critical-section.race-condition
topicContentKey: operating-systems.core.race-critical-section
slug: race-condition
title: "경쟁 상태(Race Condition)"
summary: "실행 순서에 따라 불변 조건과 결과가 달라지는 경쟁 상태를 데이터 레이스(data race)와 구분한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4.5"
    title: "The Java Language Specification — 17.4.5 Happens-before Order"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Java에서 conflicting access와 happens-before를 기준으로 data race를 정의하는 정확한 경계를 확인한다."
    displayOrder: 2
---
# 경쟁 상태(Race Condition)

경쟁 상태는 둘 이상의 동시 실행 동작에서 **상대적인 실행 순서에 따라 결과의 정확성이 달라지는 상황**이다. 대부분의 실행에서는 정상 결과가 나오더라도 특정 실행 교차에서 불변 조건이 깨진다면 경쟁 상태가 존재한다.

예를 들어 두 스레드가 공유 카운터를 증가시킬 때 둘 다 같은 이전 값을 읽으면 한 번의 갱신이 사라질 수 있다. 문제는 스레드가 둘이라는 사실 자체가 아니라, 보호되지 않은 `읽기 → 수정 → 쓰기` 순서가 결과를 바꾼다는 데 있다.

```text
정상 결과: 0 → 1 → 2
위험한 실행 교차: 둘 다 0을 읽음 → 둘 다 1을 씀 → 최종 1
```

### 경쟁 상태와 데이터 레이스는 완전히 같은 용어가 아니다

경쟁 상태는 실행 순서 때문에 결과의 정확성이 달라지는 넓은 개념이다. 반면 Java 같은 언어에서 **데이터 레이스(data race)**는 메모리 모델이 정의하는 더 구체적인 용어다. Java에서는 같은 변수에 대한 충돌 접근(conflicting access)이 happens-before 관계로 정렬되지 않은 경우를 데이터 레이스로 정의한다.

이 운영체제 Topic에서는 Java Memory Model 전체를 다루지 않는다. 중요한 경계는 **경쟁 상태가 더 넓은 실행 순서 문제이고, 언어 수준의 데이터 레이스는 해당 언어 메모리 모델의 정의를 따라 판단해야 한다는 점**이다.

### 경쟁 상태를 찾을 때는 불변 조건과 경쟁 구간을 본다

공유 변수가 있다는 사실만으로 경쟁 상태를 확정하지 않는다. 다음을 순서대로 추적해야 한다.

- 어떤 상태가 여러 실행 흐름 사이에서 공유되고 변경되는가
- 어떤 불변 조건을 유지해야 하는가
- 어떤 읽기·검사·쓰기 사이에 다른 실행 흐름이 끼어들 수 있는가

경쟁 상태를 제거하려면 **프로그램의 정확성이 우연한 타이밍에 의존하지 않도록 위험한 실행 교차를 막거나, 어떤 허용된 순서에서도 불변 조건이 유지되도록 상태 전이를 설계해야 한다.**
