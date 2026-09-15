---
kind: concept
contentKey: java.core.concurrency.safe-publication-final-fields
topicContentKey: java.core.concurrency
slug: safe-publication-final-fields
title: "안전한 공개와 final 필드"
summary: "완성된 객체 참조를 다른 thread에 안전하게 전달하는 방법과 final field가 제공하는 특별한 초기화 규칙을 구분한다"
level: 3
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.5"
    title: "Java SE 25 JLS: final Field Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: constructor 종료와 final field의 특별한 관찰 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java SE 25 JLS Chapter 17: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 일반 shared state의 inter-thread visibility와 synchronization 관계 확인
---
# 안전한 공개와 final 필드

한 thread에서 객체를 완성했다는 사실과 다른 thread가 그 객체의 초기 상태를 올바르게 관찰한다는 사실은 일반적으로 같은 보장이 아닙니다. 객체 참조를 thread 사이에 전달할 때는 **어떤 publication 경계를 통해 전달했는지**를 봐야 합니다.

다만 Java의 `final` field에는 일반 field와 구분되는 특별한 초기화 semantics가 있습니다. 이 규칙을 일반 safe publication과 섞지 않는 것이 핵심입니다.

### 일반 mutable state는 thread 사이의 전달 경계를 확인한다

```java
class Holder {
    static Config config;
}

void initialize() {
    Holder.config = new Config(...);
}
```

여러 thread가 아무 synchronization 없이 `config`를 읽고 쓰고, `Config` 안에도 일반 non-final field가 있다면 "생성자가 먼저 끝났으니 reader도 초기화 값을 당연히 본다"고 추론할 수 없습니다.

일반적인 safe publication에는 thread 사이의 memory consistency가 정의된 경계를 사용할 수 있습니다. 예를 들어 완성된 객체를 volatile reference에 저장하고 다른 thread가 그 reference를 volatile read로 얻으면 앞선 초기화 action을 reader의 후속 action과 happens-before로 연결할 수 있습니다.

```java
private volatile Config current;

void publish(Config next) {
    current = next;
}

Config read() {
    return current;
}
```

```text
Thread A
Config 생성과 초기화
      │
volatile write current
      │ happens-before
      ▼
volatile read current
      │
Config 사용
Thread B
```

같은 monitor의 unlock/lock, 적절한 `java.util.concurrent` handoff, class initialization처럼 공식 계약이 memory relation을 제공하는 경계도 상황에 따라 같은 역할을 할 수 있습니다.

### final field에는 생성자 종료와 연결된 특별한 보장이 있다

JLS는 올바르게 생성된 객체의 `final` field에 일반 field보다 강한 관찰 규칙을 둡니다.

```java
final class UserConfig {
    private final int timeout;

    UserConfig(int timeout) {
        this.timeout = timeout;
    }
}
```

객체가 constructor 안에서 final field를 설정하고 **constructor가 끝나기 전에 그 객체 참조가 다른 thread가 볼 수 있는 곳으로 빠져나가지 않았다면**, 다른 thread가 이후 그 객체 참조를 보았을 때 final field의 correctly initialized value를 관찰하도록 특별한 final-field semantics가 적용됩니다.

JLS의 예에서도 data race를 통해 객체 참조를 얻은 reader가 `final int x`의 생성자 값은 보도록 보장되지만, 같은 객체의 일반 `int y`는 기본값을 볼 수도 있습니다.

```text
constructor
  ├─ final x = 3
  └─ normal y = 4
       │
       ▼
잘못 동기화된 reference handoff
       │
       ├─ x -> final-field rule로 3 보장
       └─ y -> 같은 보장 없음
```

이것이 "final field도 safe publication이 필요 없다"는 단순한 규칙은 아닙니다. **Final field 자체의 초기화 관찰 보장**과 객체의 일반 mutable state를 안전하게 전달·수정하는 규칙을 나눠야 합니다.

### final reference가 가리키는 객체에도 생성 시점 관련 보장이 있지만 이후 mutation은 별도다

JLS는 final field가 객체나 배열을 참조할 때 그 생성 시점의 상태에 대해서도 특별한 관찰 보장을 정의합니다. 하지만 이것을 "final reference가 가리키는 객체가 영원히 thread-safe하다"고 확대하면 안 됩니다.

```java
final class Tags {
    private final List<String> values;

    Tags(List<String> values) {
        this.values = values;
    }
}
```

생성 이후 다른 thread가 같은 mutable List를 계속 변경한다면 그 후속 mutation에는 별도의 synchronization이 필요합니다. `final`은 reference 재대입을 막고 특별한 construction semantics를 제공하지만, 참조 대상의 미래 변경을 자동으로 직렬화하지 않습니다.

### constructor escape는 final-field 보장의 전제를 깨뜨릴 수 있다

```java
class Listener {
    Listener(EventBus bus) {
        bus.register(this);
    }
}
```

Constructor가 끝나기 전에 `this`를 외부 registry, callback 또는 다른 thread가 접근할 수 있는 곳에 넘기면 아직 완전히 초기화되지 않은 객체가 관찰될 수 있습니다.

```text
constructor 진행 중
      │
      ├─ this 외부 공개  ← 위험
      │
      └─ 나머지 초기화
```

가능하면 객체를 완전히 만든 뒤 별도 단계에서 등록하거나, factory가 생성 완료 후 publication을 담당하도록 설계하는 편이 안전합니다.

### 세 개념을 분리하면 혼동이 줄어든다

```text
immutability
→ 생성 후 상태가 변하는가?

safe publication
→ 객체 참조와 일반 state를 thread 사이에 어떤 memory relation으로 전달하는가?

final-field semantics
→ 올바르게 생성된 final field에 JMM이 주는 특별한 construction-time 보장은 무엇인가?
```

불변 객체는 공유 후 동기화 부담을 크게 줄여 주지만, `final` 하나가 객체 전체의 모든 mutable behavior를 thread-safe하게 만드는 것은 아닙니다. Publication 문제를 풀 때는 constructor escape 여부, 참조 전달 경로, final과 non-final state, publication 이후 mutation을 차례로 확인해야 합니다.
