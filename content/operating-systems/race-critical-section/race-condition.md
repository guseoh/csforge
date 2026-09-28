---
kind: concept
contentKey: operating-systems.core.race-critical-section.race-condition
topicContentKey: operating-systems.core.race-critical-section
slug: race-condition
title: "경쟁 상태(경쟁 상태)"
summary: "실행 순서에 따라 불변 조건와 결과가 달라지는 경쟁 condition을 data 경쟁와 구분한다."
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
# 경쟁 상태(경쟁 상태)

경쟁 condition은 둘 이상의 concurrent action의 **상대적인 실행 순서가 결과의 correctness를 바꾸는 상황**이다. 대부분의 실행에서는 정상 결과가 나오더라도 특정 interleaving에서 불변 조건가 깨진다면 경쟁 condition이 존재한다.

예를 들어 두 스레드가 공유 counter를 증가시킬 때 둘 다 같은 이전 값을 읽으면 갱신 하나가 사라질 수 있다. 문제는 스레드가 둘이라는 사실 자체가 아니라, 보호되지 않은 read-modify-write의 순서가 결과를 바꾼다는 데 있다.

```text
정상 결과: 0 → 1 → 2
위험한 interleaving: 둘 다 0을 읽음 → 둘 다 1을 씀 → 최종 1
```

### 경쟁 condition과 data 경쟁는 완전히 같은 용어가 아니다

경쟁 condition은 실행 순서 때문에 correctness가 달라지는 넓은 개념이다. 반면 Java 같은 언어의 `data race`는 메모리 model이 정의하는 더 구체적인 용어다. Java에서는 같은 variable에 대한 conflicting 접근가 happens-before로 정렬되지 않은 경우를 data 경쟁로 정의한다.

이 OS Topic에서는 JMM 전체를 다루지 않는다. 중요한 경계는 **경쟁 condition이 더 넓은 실행 순서 문제이고, language-level data 경쟁는 해당 언어 메모리 model의 정의를 따라 판단해야 한다는 점**이다.

### 경쟁를 찾을 때는 불변 조건와 경쟁 구간을 본다

경쟁를 진단할 때 단순히 "공유 변수가 있는가"만 보지 않는다.

- 어떤 상태가 공유 가변 상태인가
- 어떤 불변 조건가 유지되어야 하는가
- 어떤 read/check/write 사이에 다른 실행 흐름이 끼어들 수 있는가

를 추적해야 한다.

경쟁 Condition의 핵심은 **correctness가 우연한 timing에 의존하지 않도록 위험한 interleaving을 제거하거나, 어떤 순서에서도 불변 조건가 유지되도록 상태 transition을 설계하는 것**이다.