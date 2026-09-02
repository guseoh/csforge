---
kind: concept
contentKey: java.core.concurrency.safe-publication-final-fields
topicContentKey: java.core.concurrency
slug: safe-publication-final-fields
title: "Safe publication and final fields"
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
    relationNote: inter-thread visibility와 synchronization 관계 확인
---
# Safe publication과 final field

객체 생성자에서 필드를 올바르게 채웠다는 사실과 **그 객체 참조를 다른 thread에 어떻게 전달했는가**는 일반적으로 별도의 문제입니다. 특히 일반 field나 이후 변경되는 mutable state까지 다른 thread가 올바르게 관찰해야 한다면 volatile, monitor/Lock, static initialization, concurrent collection처럼 Java가 memory consistency를 정의한 publication 경계를 사용해야 합니다.

이 과정을 publication이라고 부르고, 필요한 visibility/order까지 보장되는 방식으로 전달하는 것을 safe publication이라고 설명할 수 있습니다.

다만 Java의 `final` field에는 이 일반 규칙과 구분해야 할 **특별한 생성자 semantics**가 있습니다. 객체가 올바르게 생성되고 생성 중인 `this`가 외부로 escape하지 않았다면, JLS는 그 객체 참조가 data race를 통해 전달되더라도 다른 thread가 올바르게 초기화된 final field 값을 볼 수 있는 보장을 둡니다. 따라서 "모든 field를 보기 위해 항상 별도의 synchronization publication이 반드시 필요하다"고 일반화하면 final-field 규칙을 놓치게 됩니다.

### 일반 field의 잘못된 전달은 생성 완료와 다른 thread의 관찰을 연결하지 못할 수 있다

```java
class Holder {
    static Config config;
}

void initialize() {
    Holder.config = new Config(...);
}
```

여러 thread가 아무 synchronization 없이 이 필드를 읽고 쓰고 `Config`에 일반 mutable field도 있다면 "생성자가 먼저 실행됐으니 다른 thread도 모든 초기화 값을 당연히 본다"고 추론하면 안 됩니다.

Thread 사이에 어떤 memory consistency 관계가 있는지 확인해야 합니다.

### volatile reference를 publication 경계로 사용할 수 있다

```java
final class Config {
    private final int port;
    private final List<String> hosts;

    Config(int port, List<String> hosts) {
        this.port = port;
        this.hosts = List.copyOf(hosts);
    }
}

private volatile Config current;

void publish(Config next) {
    current = next;
}

Config read() {
    return current;
}
```

Publisher가 객체를 완성한 뒤 volatile reference에 저장하고 reader가 그 volatile field를 읽으면, volatile write/read의 happens-before 관계를 통해 이전 초기화 action을 reader 쪽과 연결할 수 있습니다.

```text
Thread A
Config 생성 완료
   │
current = config   (volatile write)
   │
   └────────────────────────▶ volatile read current
                                  │
                                  ▼
                              Config 사용
                               Thread B
```

Synchronized lock, static initialization, concurrent collection의 규정된 handoff 등도 상황에 따라 안전한 publication 경계가 될 수 있습니다.

### final field에는 특별한 생성자 규칙이 있다

Java는 `final` field에 대해 일반 field보다 강한 초기화 관찰 규칙을 정의합니다. 생성자에서 final field가 정상적으로 설정되고 **생성 중인 `this`가 잘못 외부로 빠져나가지 않는다면**, 다른 thread가 나중에 객체 참조를 보게 되었을 때 해당 final field의 올바르게 초기화된 값을 보도록 보장합니다.

```java
final class UserConfig {
    private final int timeout;

    UserConfig(int timeout) {
        this.timeout = timeout;
    }
}
```

이 보장은 final field를 일반 field와 구분하는 핵심입니다. JLS는 올바르게 구성된 immutable object의 final field를 다른 thread가 data race를 통해 참조받더라도 correctly initialized value를 관찰할 수 있도록 특별한 freeze semantics를 둡니다.

하지만 이 규칙을 "final만 붙이면 객체 전체가 thread-safe"라고 확대하면 안 됩니다. 일반 non-final field, final reference가 가리키는 객체의 **생성 이후 mutation**, 여러 field의 atomic invariant까지 자동으로 보호하는 규칙은 아닙니다.

### constructor에서 `this`가 빠져나가는 것을 조심한다

```java
class Listener {
    Listener(EventBus bus) {
        bus.register(this); // 생성 완료 전에 다른 코드가 this를 볼 수 있음
    }
}
```

생성자가 끝나기 전에 `this`를 외부 registry, callback, 다른 thread 등에 넘기는 것을 constructor escape라고 부릅니다. 다른 실행 흐름이 아직 초기화 중인 객체를 사용할 수 있으므로 final field semantics의 올바른 생성 전제를 깨뜨릴 수 있습니다.

가능하면 객체를 완전히 만든 뒤 별도 단계에서 등록하거나 factory가 생성 후 publication을 담당하는 구조를 검토합니다.

### final reference와 immutable object는 같은 말이 아니다

```java
final List<String> tags = new ArrayList<>();
tags.add("java"); // 가능
```

`final`은 reference 변수가 다른 객체를 가리키도록 재대입하는 것을 막습니다. 그 List 내부 상태를 불변으로 만들지는 않습니다.

Safe publication으로 `tags`를 포함한 객체를 전달했더라도 이후 여러 thread가 같은 mutable List를 변경한다면 다시 동기화 문제가 생깁니다.

```text
safe publication
    -> 초기 상태를 안전하게 전달

subsequent mutation
    -> 이후 변경은 별도의 thread-safety 규칙 필요
```

### immutable object와 safe publication은 서로 보완한다

객체가 생성 후 바뀌지 않으면 publication 이후 공유 상태를 계속 lock으로 보호해야 하는 부담이 줄어듭니다. 특히 final field를 올바르게 사용한 immutable object는 JMM의 특별한 생성자 semantics까지 활용할 수 있습니다. 반대로 일반 mutable object를 다른 thread와 공유한다면 publication 이후 mutation에 대한 별도 synchronization이 필요합니다.

- immutability: 생성 후 상태 변경이 없는가?
- publication: 객체 참조와 일반 state가 thread 사이에 어떤 memory relation으로 전달되는가?
- final-field semantics: 올바르게 생성된 final field에 JMM이 어떤 특별한 관찰 보장을 주는가?

이 세 가지를 같은 말로 섞지 않는 것이 중요합니다.

### 문제를 풀 때 확인할 것

1. 객체가 어느 thread에서 생성되는지 봅니다.
2. 생성 중 `this`가 외부로 빠져나가는지 확인합니다.
3. 다른 thread가 참조를 어떤 필드/queue/lock을 통해 받는지 확인합니다.
4. final field와 일반 mutable field를 구분합니다.
5. publication 이후 객체가 다시 변경되는지 봅니다.

### 자주 헷갈리는 부분

- `final` reference가 가리키는 객체까지 깊게 불변이 되는 것은 아닙니다.
- 올바르게 생성된 final field에는 일반 field와 다른 특별한 JMM 보장이 있습니다.
- 생성자 안에서 객체를 외부에 등록하면 final-field 보장의 전제를 깨뜨릴 수 있습니다.
- safe publication은 이후 모든 mutable operation을 atomic하게 만들지 않습니다.

### 면접에서 설명한다면

Safe publication은 한 thread에서 만든 객체의 참조와 필요한 상태를 다른 thread가 올바르게 관찰할 수 있도록 memory consistency가 정의된 경계를 통해 전달하는 것을 말합니다. Volatile reference, monitor/Lock, static initialization, concurrent collection 등의 계약을 활용할 수 있습니다. 다만 Java의 final field는 예외적으로 강한 생성자 semantics를 가지며, 객체가 올바르게 생성되고 `this`가 construction 중 escape하지 않았다면 참조가 data race로 전달되더라도 final field의 correctly initialized value를 관찰하도록 보장합니다. 이 보장이 일반 mutable field나 생성 이후 변경까지 thread-safe하게 만드는 것은 아닙니다.
