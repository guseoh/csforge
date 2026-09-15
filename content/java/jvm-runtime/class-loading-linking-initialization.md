---
kind: concept
contentKey: java.core.jvm-runtime.class-loading-linking-initialization
topicContentKey: java.core.jvm-runtime
slug: class-loading-linking-initialization
title: "Class Loading·Linking·Initialization"
summary: "class가 사용되기까지 loading·linking·initialization이 어떤 순서와 의미로 진행되는지 이해하고 static 초기화 시점과 오류를 구분한다"
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-5.html"
    title: "Java SE 25 JVMS Chapter 5: Loading, Linking, and Initializing"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: class lifecycle 단계와 initialization trigger 확인
  - url: "https://engineering.linecorp.com/en/blog/line-open-jdk/"
    title: "LINE의 OpenJDK 적용기: 호환성 확인부터 주의 사항까지"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 2
    relationNote: JDK 구현과 실행 환경 차이가 class/runtime 호환성에 미치는 영향 보충
---
# Class Loading·Linking·Initialization

Java class가 처음 사용될 때 JVM은 class file을 읽자마자 곧바로 static initializer를 실행하지 않습니다. JVMS는 class가 실행 가능한 상태가 되는 과정을 크게 **loading, linking, initialization**으로 나눕니다. 이 구분을 알면 static 초기화 시점, `LinkageError`, `NoClassDefFoundError` 같은 문제를 더 정확하게 추적할 수 있습니다.

![class lifecycle의 loading, linking, initialization 흐름](/learning/java/class-loading-lifecycle.svg)

### Loading은 binary representation으로 runtime class를 만든다

Loading 단계에서는 class loader가 binary name에 해당하는 class의 binary representation을 찾고 JVM 안에 class를 생성합니다.

```text
com.example.Config
        │
        ▼
   ClassLoader
        │ class bytes
        ▼
   runtime Class
```

Class bytes를 어디에서 찾는지는 classpath, module path, custom class loader 같은 실행 환경에 따라 달라질 수 있습니다. 중요한 점은 **loading이 끝났다는 사실과 static 초기화까지 끝났다는 사실은 다르다**는 것입니다.

### Linking은 verification, preparation, resolution을 포함한다

Linking은 loaded class를 JVM runtime에 연결하는 단계이며 verification, preparation, resolution으로 나눌 수 있습니다.

```text
Loading
  │
  ▼
Linking
  ├─ Verification
  ├─ Preparation
  └─ Resolution
  │
  ▼
Initialization
```

다만 이 그림을 모든 단계가 항상 한 번에 직선으로 끝나는 실제 시간 순서로 외우면 안 됩니다. JVMS는 **verification과 preparation은 initialization 전에 완료되어야 하지만 resolution은 symbolic reference마다 늦게 수행될 수 있도록 허용**합니다.

Verification은 class file 구조와 bytecode가 JVM의 구조적·타입 규칙을 만족하는지 확인합니다. Preparation에서는 static field를 위한 runtime storage를 만들고 기본값을 준비합니다.

```java
class Config {
    static int port = 8080;
    static String name = loadName();
}
```

Preparation을 개념적으로 보면 아직 source initializer의 결과를 실행하는 단계가 아닙니다.

```text
port -> 0
name -> null
```

`8080`을 대입하거나 `loadName()`을 호출하는 source-level 초기화는 initialization과 연결해서 이해해야 합니다. Compile-time constant에는 별도 규칙이 있으므로 모든 static field를 한 문장으로 일반화하지 않습니다.

### Resolution은 symbolic reference를 runtime entity에 연결한다

Class file의 constant pool에는 다른 class, field, method 등에 대한 symbolic reference가 들어 있습니다. Resolution은 이 reference가 가리키는 실제 runtime class·field·method를 결정하고 유효성을 확인합니다.

```text
"com/example/Service.doWork:()V"
                │
                ▼
        runtime method reference
```

JVM은 이 작업을 일찍 수행할 수도 있고 실제 reference가 필요해질 때까지 늦출 수도 있습니다. 따라서 잘못된 binary dependency가 애플리케이션 시작 시점이 아니라 특정 코드 경로를 처음 실행할 때 드러날 수도 있습니다.

### Initialization에서 static initializer가 실행된다

Initialization에서는 class variable initializer와 static initializer가 규칙에 따라 실행됩니다.

```java
class Config {
    static int port = readPort();

    static {
        validate(port);
    }
}
```

개념적으로 다음 흐름입니다.

```text
Preparation
port = 0
   │
   ▼
Initialization
readPort()
   │
validate(port)
```

Class가 load되었다고 initialization된 것은 아닙니다. 또한 class 이름을 어떤 형태로 언급했다고 모두 initialization이 시작되는 것도 아닙니다. `new`, 특정 static field/method 사용, reflective operation 등 실제 initialization trigger는 JLS/JVMS 규칙을 따릅니다.

### 초기화는 여러 thread 사이에서도 JVM이 조정한다

같은 class를 여러 thread가 처음 사용하더라도 static initialization이 임의로 여러 번 동시에 실행되지는 않습니다. JVM은 class/interface의 initialization 상태와 synchronization 절차를 정의합니다.

이 성질은 initialization-on-demand holder처럼 class initialization을 publication 경계로 사용하는 패턴의 근거가 됩니다. 반대로 static initializer에서 다른 lock이나 다른 class initialization을 복잡하게 유발하면 초기화 의존성이 꼬일 수 있으므로 무거운 작업은 신중하게 둡니다.

### Initialization 실패와 class 부재를 구분한다

```java
class Broken {
    static final Config CONFIG = load(); // 예외
}
```

Initialization이 실패하면 해당 class는 정상 initialized 상태가 되지 못하고 erroneous state가 될 수 있습니다. 최초 실패에서는 `ExceptionInInitializerError` 같은 오류가 보이고, 이후 같은 class를 사용하려는 코드에서는 `NoClassDefFoundError`가 나타날 수 있습니다.

따라서 `NoClassDefFoundError`를 보았다고 항상 "class 파일이 없다"고 결론내리면 안 됩니다. 실제 classpath 부재인지, 이전 initialization 실패인지 실행 이력을 함께 확인해야 합니다.

### 정리

Class lifecycle은 `loading → linking → initialization`으로 이해할 수 있지만 resolution은 필요 시점까지 지연될 수 있습니다. Preparation은 static storage와 기본값을 준비하고, 개발자가 작성한 static initializer의 실행은 initialization 단계와 연결됩니다. 그래서 class가 load됐다는 사실, 모든 symbolic reference가 resolve됐다는 사실, static initialization이 끝났다는 사실을 서로 같은 상태로 취급하면 안 됩니다.
