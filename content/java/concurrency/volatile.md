---
kind: concept
contentKey: java.core.concurrency.volatile
topicContentKey: java.core.concurrency
slug: volatile
title: "volatile"
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
    title: "Java SE 25 JLS: Happens-before Order"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: volatile write와 이후 같은 field read의 happens-before 관계 확인
---
# volatile

한 thread가 "작업을 이제 멈춰라"라는 flag를 true로 바꾸고 다른 thread가 그 flag를 계속 확인한다고 생각해 보겠습니다. 두 thread 사이에 아무 synchronization도 없다면 reader가 write를 안전하게 관찰한다고 근거 없이 가정할 수 없습니다.

`volatile`은 이런 **하나의 공유 field에 대한 visibility와 ordering 관계를 명시적으로 만들기 위한 Java 언어 기능**입니다.

### 대표적인 사용은 상태 flag다

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

Writer의 `stopRequested = true`라는 volatile write와 reader의 이후 같은 field volatile read 사이에는 happens-before 관계가 성립합니다.

```text
Thread A                         Thread B
stopRequested = true
    (volatile write)
          │
          └─────────────────▶ read stopRequested
                               (volatile read)
```

따라서 단순한 독립 상태 flag처럼 한 write를 다른 thread가 관찰해야 하는 경우에 적합할 수 있습니다.

### volatile은 "최신값이 보이게 한다"보다 happens-before로 이해한다

"volatile은 CPU cache를 무시한다" 또는 "항상 RAM에서 읽는다"라고 외우면 Java 언어 보장과 특정 하드웨어 구현을 섞게 됩니다.

Java 개발자가 의존할 수 있는 핵심은 **volatile write가 같은 volatile field의 이후 read와 happens-before 관계를 만든다**는 JMM 규칙입니다. JVM이 이를 특정 CPU에서 어떤 memory barrier나 instruction으로 구현하는지는 implementation 영역입니다.

### `count++`는 volatile이어도 안전한 증가가 아니다

```java
volatile int count;

void increment() {
    count++;
}
```

`count++`는 논리적으로 다음 단계가 있습니다.

```text
1. count 읽기
2. 1 더하기
3. count 쓰기
```

두 thread가 같은 값을 읽으면 각각 계산한 값을 다시 쓸 수 있습니다.

```text
A: read 0                 B: read 0
A: compute 1              B: compute 1
A: write 1                B: write 1

최종값 = 1
```

Volatile read/write 자체의 memory semantics가 있어도 이 **전체 read-modify-write 묶음**이 하나의 atomic operation으로 바뀌는 것은 아닙니다.

### visibility, ordering, mutual exclusion을 나눠 생각한다

| 요구 | volatile | synchronized/Lock |
|---|---|---|
| 같은 volatile field를 통한 visibility/order | 제공 | 제공 가능 |
| 한 thread만 critical section 진입 | 제공하지 않음 | 제공 |
| `count++` 같은 복합 invariant 보호 | 단독으로 부족 | critical section으로 가능 |
| lock 대기/ownership | 없음 | 있음 |

그래서 "volatile이 synchronized보다 가볍다"만 보고 대체 관계로 생각하면 안 됩니다. 해결하는 문제가 다릅니다.

### publication flag로 사용할 때는 write 순서를 본다

```java
int data;
volatile boolean ready;

void publish() {
    data = 42;
    ready = true;
}
```

Reader가 `ready`의 volatile write를 이후 read하는 경로가 있다면 program order와 happens-before transitivity를 통해 `data = 42`의 관찰 근거도 연결할 수 있습니다.

하지만 volatile field 하나를 읽었다는 사실이 **어떤 시점의 모든 객체 변경을 무조건 atomic snapshot으로 만든다**는 뜻은 아닙니다. 필요한 state relation이 실제 edge에 포함되는지 추적해야 합니다.

### 여러 필드가 함께 맞아야 하면 다른 도구가 필요할 수 있다

```text
balance >= reserved
```

처럼 여러 field 사이의 invariant가 있다면 각각 volatile로 선언한다고 두 값을 하나의 일관된 순간으로 갱신/조회하는 것이 자동 보장되지 않습니다.

- 하나의 immutable state object를 volatile reference로 교체
- synchronized/Lock으로 여러 field를 한 critical section에서 보호
- 요구에 맞는 atomic abstraction 사용

같은 방법을 검토할 수 있습니다.

### 문제를 풀 때 확인할 것

1. volatile field가 무엇인지 표시합니다.
2. writer와 reader가 같은 volatile field를 통해 연결되는지 봅니다.
3. 연산이 단순 read/write인지 read-modify-write인지 분해합니다.
4. 한 field만 맞으면 되는지 여러 field invariant가 있는지 확인합니다.
5. 상호 배제가 필요한 문제인지 visibility만 필요한 문제인지 구분합니다.

### 자주 헷갈리는 부분

- volatile은 mutex가 아닙니다.
- `volatile count++`는 atomic increment가 아닙니다.
- volatile은 CPU cache를 끄는 키워드라고 정의하면 부정확합니다.
- volatile reference를 사용한다고 참조 대상 객체의 모든 후속 변경이 thread-safe해지는 것은 아닙니다.

### 면접에서 설명한다면

`volatile`은 같은 field의 write와 이후 read 사이에 happens-before 관계를 만들어 visibility와 ordering을 제공하는 Java Memory Model 기능이라고 설명하면 됩니다. 하지만 mutual exclusion은 제공하지 않으므로 `count++`처럼 read-modify-write가 필요한 복합 연산의 atomicity는 보장하지 않습니다. 단순 상태 flag나 publication에 유용할 수 있지만 여러 필드 invariant에는 lock이나 다른 atomic 상태 모델이 필요할 수 있습니다.
