---
kind: concept
contentKey: java.core.concurrency.volatile
topicContentKey: java.core.concurrency
slug: volatile
title: "volatile과 가시성"
summary: "volatile이 제공하는 visibility와 ordering을 이해하고 복합 갱신의 atomicity와 구분한다"
level: 3
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.3.1.4"
    title: "Java SE 25 JLS: volatile Fields"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: volatile field의 Java 언어 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4.5"
    title: "The Java Language Specification — 17.4.5 Happens-before Order"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Java에서 conflicting access와 happens-before를 기준으로 data race를 정의하는 정확한 경계를 확인한다."
    displayOrder: 2
    relationNote: volatile write/read의 happens-before 관계 확인
---
# volatile과 가시성

한 thread가 중단 flag를 `true`로 바꾸고 다른 thread가 그 flag를 확인한다고 해 보겠습니다. 두 thread 사이에 아무 synchronization도 없다면 writer의 변경을 reader가 언제, 어떤 값으로 관찰하는지 단순 실행 순서만 보고 보장할 수 없습니다.

`volatile`은 **특정 shared field의 read/write를 Java Memory Model의 synchronization action으로 만들고 thread 사이에 visibility와 ordering 관계를 제공**합니다.

### 상태 flag는 volatile의 대표적인 사용 형태다

```java
class Worker implements Runnable {
    private volatile boolean stopRequested;

    void requestStop() {
        stopRequested = true;
    }

    @Override
    public void run() {
        while (!stopRequested) {
            doSmallUnit();
        }
    }
}
```

한 thread의 `stopRequested = true`라는 volatile write는 synchronization order상 그 뒤의 같은 field volatile read와 synchronizes-with 관계를 만들고, 따라서 happens-before edge가 됩니다.

```text
Thread A                         Thread B
stopRequested = true
   volatile write
        │
        └──────────────────▶ volatile read stopRequested
```

그래서 volatile을 "항상 RAM에서 읽는다"거나 "CPU cache를 끈다"고 정의하면 부정확합니다. Java 코드가 의존할 수 있는 것은 **JMM이 정의한 read/write의 memory semantics**이고, HotSpot과 CPU가 이를 어떤 instruction이나 barrier로 구현하는지는 별도 계층입니다.

### publication flag는 앞선 일반 write까지 연결할 수 있다

```java
int data;
volatile boolean ready;

void publish() {
    data = 42;
    ready = true;
}

void consume() {
    if (ready) {
        System.out.println(data);
    }
}
```

Writer 안에서 `data = 42`는 volatile write보다 program order상 앞에 있고, reader가 그 뒤의 volatile read를 거쳐 `data`를 읽습니다. Program order, volatile synchronization edge, transitivity를 연결하면 `data`의 초기화 write를 reader의 후속 read와 happens-before로 연결할 수 있습니다.

```text
write data=42
     │
write ready=true (volatile)
     │ happens-before
read ready
     │
read data
```

이것은 "volatile reference 하나를 읽으면 객체 전체의 모든 미래 변경이 자동으로 안전하다"는 뜻은 아닙니다. Edge 이전의 action과 이후의 action을 실제 순서대로 추적해야 합니다.

### volatile은 복합 read-modify-write를 하나로 묶지 않는다

```java
volatile int count;

void increment() {
    count++;
}
```

`count++`는 read, 계산, write의 복합 동작입니다. 각 volatile access에 memory semantics가 있어도 두 thread가 같은 이전 값을 읽고 각각 1을 써서 lost update를 만들 수 있습니다.

```text
A: read 0              B: read 0
A: compute 1           B: compute 1
A: write 1             B: write 1

최종 count = 1
```

따라서 volatile은 mutual exclusion을 제공하지 않고, 복합 갱신 전체를 atomic operation으로 바꾸지도 않습니다.

### 여러 값의 invariant도 volatile field 여러 개로 자동 보호되지 않는다

```text
available = 10
reserved  = 3

invariant: reserved <= available
```

각 field를 각각 volatile로 선언하면 개별 read/write의 visibility는 강화되지만 두 값을 하나의 일관된 상태 전이로 묶어 주지는 않습니다. 여러 값이 함께 바뀌어야 한다면 같은 lock으로 보호하거나, 관련 상태를 immutable object 하나로 묶어 volatile reference 전체를 교체하거나, 요구에 맞는 atomic abstraction을 사용할 수 있습니다.

```text
volatile이 잘 맞는 질문
"이 하나의 상태 값을 다른 thread가 어떤 ordering으로 보아야 하는가?"

lock/atomic state model이 필요한 질문
"여러 단계나 여러 값이 하나의 invariant로 함께 바뀌어야 하는가?"
```

`volatile`을 사용할 때는 같은 field의 writer와 reader가 어디에서 연결되는지, 연산이 단순 read/write인지 복합 갱신인지, 그리고 보호해야 할 invariant가 한 값에 한정되는지를 확인하세요. 이 세 가지를 분리하면 `volatile`과 `synchronized`나 atomic class를 대체 관계로 오해하지 않게 됩니다.
