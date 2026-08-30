---
kind: concept
contentKey: java.core.object-model.interface-vs-abstract-class
topicContentKey: java.core.object-model
slug: interface-vs-abstract-class
title: "Interface와 abstract class"
summary: "contract, 공유 구현과 상태, 확장 요구를 기준으로 interface와 abstract class를 선택한다"
level: 2
status: PUBLISHED
displayOrder: 110
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: interface member와 contract 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: abstract class와 class inheritance 확인
---
# Interface와 abstract class

## 쉬운 진입

interface는 “이 일을 할 수 있다”는 역할 계약에 가깝고, abstract class는 같은 종류의 객체가
공유할 상태나 기본 구현까지 묶는 부모 설계에 가깝다. 둘 중 더 고급 문법을 고르는 것이 아니라
변경과 대체의 경계를 고르는 문제다.

## 정확한 메커니즘

```java
interface Retryable {
    void retry();
}

abstract class Job {
    private final String id;

    protected Job(String id) { this.id = id; }
    String id() { return id; }
    abstract void run();
}
```

class는 여러 interface를 구현할 수 있고, class 상속은 하나의 class 계층으로 상태·구현과
constructor 계약을 공유한다. interface도 default method와 static method를 가질 수 있지만
instance state를 부모 class처럼 소유하는 용도와는 다르다. 추상 class는 직접 instance를 만들
수 없고, 구체 subclass가 필요한 행동을 완성해야 한다.

## 실전·면접 연결

서로 무관한 class가 같은 capability를 제공해야 하거나 구현 교체가 핵심이면 interface가 적합하다.
공유 invariant·상태·template이 안정적으로 함께 움직이는 계층이면 abstract class를 검토한다.
Spring의 interface proxy나 Bean contract는 이 Java 경계를 기반으로 하지만 framework 동작 자체는
이 Concept의 범위를 넘는다.

## 흔한 오해

- interface가 항상 구현이 전혀 없는 순수 선언만을 뜻하지는 않는다.
- abstract class가 있다고 상속 계층을 무조건 만들어야 하는 것은 아니다.
- 공통 메서드가 하나 있다는 이유만으로 abstract class를 선택하지 않는다.
