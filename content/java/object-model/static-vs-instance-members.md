---
kind: concept
contentKey: java.core.object-model.static-vs-instance-members
topicContentKey: java.core.object-model
slug: static-vs-instance-members
title: "Static과 instance member"
summary: "class에 속한 static 상태와 object별 instance 상태를 구분한다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: static member와 instance member 선언·접근 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html"
    title: "Java Language Specification 12장: Execution"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: class initialization과 instance initialization 경계 확인
---
# Static과 instance member

## 쉬운 진입

학생마다 이름이 따로 있지만 학교 전체의 이름은 하나인 것처럼, instance member는 각 object가
가지고 `static` member는 class에 하나의 공용 상태나 행동으로 연결된다. 여러 object가 같은 값을
공유해야 하는지, 각 object가 독립 값을 가져야 하는지를 먼저 묻는다.

## 정확한 메커니즘

```java
class Counter {
    static int created;
    int value;

    Counter() {
        created++;
        value = 0;
    }
}

Counter a = new Counter();
Counter b = new Counter();
a.value++;
// a.value == 1, b.value == 0, Counter.created == 2
```

`value`는 object마다 따로 있고 `created`는 class에 연결되어 생성된 instance들이 공유한다.
static method는 특정 instance의 `this`를 가지지 않으므로 instance member를 직접 사용할 수 없다.
instance method 호출은 객체가 필요하지만, static member 접근은 class 이름으로 표현하는 것이
의도를 분명하게 한다.

```text
Counter.created ───── 하나의 class 상태
Counter a.value ───── a 전용 상태
Counter b.value ───── b 전용 상태
```

## 실전·면접 연결

static mutable 상태는 전역 공유 상태가 되어 테스트 격리와 동시성에 부담을 줄 수 있다. 상수나
순수한 utility처럼 실제로 object별 상태가 필요 없는 경우에만 static을 사용하고, 의존성이나
request 상태를 static field에 숨겨 Spring Bean과 혼동하지 않는다.

## 흔한 오해

- static field는 object마다 복사되는 instance field가 아니다.
- static method는 override를 통한 runtime dispatch 대상이 아니다.
- static이라고 thread-safe하거나 불변이라는 뜻은 아니다.
