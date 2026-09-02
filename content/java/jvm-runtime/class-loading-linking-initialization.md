---
kind: concept
contentKey: java.core.jvm-runtime.class-loading-linking-initialization
topicContentKey: java.core.jvm-runtime
slug: class-loading-linking-initialization
title: "Class loading, linking, and initialization"
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
---
# class는 파일을 찾는 순간 바로 초기화될까

Java에서 어떤 class를 처음 사용한다고 해서 "파일을 읽자마자 static block부터 실행된다"고 생각하면 여러 현상을 설명하기 어렵습니다. JVM은 class를 runtime에 가져오고 사용할 준비를 하는 과정을 **loading, linking, initialization**으로 나누어 정의합니다.

각 단계의 의미를 구분하면 `NoClassDefFoundError`, static 초기화 실패, class loader 문제를 훨씬 정확하게 볼 수 있습니다.

### 큰 흐름부터 잡되 resolution 시점을 직선 순서로 고정하지 않는다

```text
Loading
  │
  ▼
Linking
  ├─ Verification ─┐
  └─ Preparation  ─┴─ initialization 전에 완료
  │
  ├─ Resolution ───── symbolic reference별로 eager/lazy 가능
  │                    initialization 전에 전부 끝날 필요는 없음
  ▼
Initialization
```

JVMS에서 linking은 verification, preparation, resolution을 포함하지만 **verification과 preparation은 initialization 전에 완료되어야 하고 resolution은 구현이 필요 시점까지 늦출 수 있습니다.** 따라서 `Loading → Verification → Preparation → 모든 Resolution → Initialization`이 모든 class에 고정된 실제 시간 순서라고 외우면 안 됩니다.

### Loading은 class의 binary representation을 찾아 runtime class를 만든다

Loading 단계에서는 class loader가 binary name에 해당하는 class definition을 찾고 JVM 안에서 사용할 `Class`와 runtime 구조를 만듭니다.

```text
"com.example.Order"
       │
       ▼
ClassLoader
       │ class bytes 찾기/정의
       ▼
runtime Class
```

어디서 class bytes를 찾는지는 classpath, module path, custom loader 등의 실행 환경과 연결됩니다.

Loading이 성공했다고 그 class의 static field initializer와 static block이 이미 모두 실행됐다는 뜻은 아닙니다.

### Verification은 class file이 JVM 규칙에 맞는지 확인한다

Linking의 일부인 verification에서는 class file 구조와 bytecode가 JVM이 허용하는 형태인지 확인합니다.

예를 들어 잘못된 bytecode가 operand stack의 타입 규칙을 깨뜨리거나 class file 구조가 잘못되어 있다면 JVM이 그대로 실행해서 메모리를 임의로 망가뜨리게 두지 않습니다.

일반적으로 `javac`가 정상적인 class file을 만들어 주기 때문에 애플리케이션 개발자가 verification을 직접 다룰 일은 적지만, JVM의 안전한 실행 모델을 이해하는 데 중요합니다.

### Preparation에서는 static field의 저장 공간과 기본값을 준비한다

다음 class를 보겠습니다.

```java
class Config {
    static int port = 8080;
    static String name = loadName();
}
```

Preparation을 "8080과 loadName 결과가 바로 들어가는 단계"라고 생각하면 정확하지 않습니다.

개념적으로 preparation에서는 static field를 위한 runtime storage를 준비하고 기본값을 설정합니다.

```text
port -> 0
name -> null
```

개발자가 적은 `= 8080`, `loadName()` 같은 초기화 동작의 효과는 initialization 단계와 연결해 이해합니다. Compile-time constant와 `ConstantValue`가 관련된 field는 initialization 절차에 별도 규칙이 있으므로 단순한 일반 static initializer와 똑같이 처리한다고 외우지 않습니다.

### Resolution은 symbolic reference를 runtime reference와 연결한다

class file constant pool에는 다른 class, field, method에 대한 symbolic reference가 들어갈 수 있습니다.

```text
"java/lang/String"
"com/example/Service.doWork:()V"
```

Resolution은 이런 symbolic reference에서 실제 class, field, method 등의 runtime entity를 결정하는 과정입니다.

중요한 점은 JVM specification이 모든 symbolic reference를 initialization 전에 한 번에 반드시 resolve하라고 강제하지 않는다는 것입니다. 구현은 일찍 resolve할 수도 있고, 해당 reference를 실제로 요구하는 instruction이 실행될 때까지 늦출 수도 있습니다.

그래서 어떤 missing method/class 문제가 애플리케이션 시작 순간이 아니라 특정 코드 경로를 처음 실행할 때 나타날 수 있습니다.

### Initialization에서 개발자가 작성한 static 초기화가 실행된다

Initialization은 class 또는 interface의 initialization method와 연결되는 단계입니다.

```java
class Config {
    static int port = readPort();

    static {
        System.out.println("initialize");
    }
}
```

이런 static field initializer와 static block의 효과는 initialization 과정에서 실행됩니다.

```text
Preparation
port = 0
   │
   ▼
Initialization
readPort() 실행
static block 실행
```

JVMS initialization 절차는 `ConstantValue` attribute가 있는 static field의 constant value 처리도 정의합니다. 따라서 "preparation에서 source의 모든 static 초기값이 최종값으로 들어간다"고 이해하지 않습니다.

### 모든 class 언급이 initialization을 일으키는 것은 아니다

이 부분은 면접에서도 자주 헷갈립니다. class를 어떤 형태로 "참조했다"고 해서 무조건 즉시 initialization되는 것은 아닙니다.

예를 들어 compile-time constant 사용, class literal, 배열 class 생성 등은 initialization trigger를 단순한 "이름을 언급했다"로 설명할 수 없습니다.

정확한 active use 규칙은 Java Language Specification/JVMS를 확인해야 합니다. 학습할 때는 다음 원칙을 기억하면 됩니다.

> class가 load되었다는 사실과 class가 initialization되었다는 사실은 같은 상태가 아니다.

### initialization은 여러 thread가 동시에 요청해도 JVM 규칙으로 조정된다

두 thread가 같은 class를 처음 적극적으로 사용하더라도 static initialization이 서로 무질서하게 두 번 실행되도록 두지 않습니다. JVMS는 class/interface마다 initialization lock과 initialization state를 두는 절차를 정의하고, 다른 thread가 이미 initialization 중이면 기다리도록 규정합니다.

이 때문에 class initialization은 singleton holder 같은 패턴의 안전한 publication 설명에도 연결됩니다.

하지만 initialization 코드 안에서 다른 lock을 잡거나 다른 class의 initialization을 유발하면 복잡한 초기화 의존성과 deadlock 가능성을 만들 수 있습니다. static initializer에 지나치게 무거운 일을 넣지 않는 이유 중 하나입니다.

### 초기화가 실패하면 class는 erroneous state가 될 수 있다

```java
class Broken {
    static final Config CONFIG = load(); // 예외 발생
}
```

Initialization이 비정상 종료하면 JVM은 해당 class/interface를 erroneous state로 표시합니다. 처음 initialization을 시도한 흐름에서는 원인에 따라 `ExceptionInInitializerError` 같은 오류를 볼 수 있고, 이후 다른 사용에서는 initialization을 다시 정상 실행하는 대신 `NoClassDefFoundError`를 관찰할 수 있습니다.

그래서 `NoClassDefFoundError`가 보인다고 항상 "class 파일 자체가 처음부터 없었다"고 결론내리면 안 됩니다. 해당 class가 이전 initialization에서 실패했는지까지 확인해야 합니다.

### 문제를 풀 때 확인할 것

1. 지금 class가 loading만 된 상태인지 initialization까지 끝났는지 구분합니다.
2. verification/preparation은 initialization 전에 끝나야 하지만 resolution은 lazy할 수 있음을 구분합니다.
3. static field 기본값 설정과 개발자 initializer 실행을 나눕니다.
4. symbolic reference resolution이 startup 시 전부 끝난다고 가정하지 않습니다.
5. 어떤 사용이 initialization trigger인지 확인합니다.
6. 초기화 코드에서 예외가 나 class가 erroneous state가 된 적이 있는지 봅니다.
7. 여러 thread의 class initialization이 임의로 두 번 실행된다고 생각하지 않습니다.

### 면접에서 설명한다면

JVM의 class lifecycle은 크게 loading, linking, initialization으로 나눌 수 있습니다. Linking에는 verification, preparation, resolution이 포함되지만 verification과 preparation은 initialization 전에 완료되어야 하는 반면 resolution은 symbolic reference별로 늦게 수행될 수 있습니다. Preparation에서는 static field의 storage와 기본값을 준비하고, source의 static initializer와 static block 효과는 initialization 단계에서 실행됩니다. 따라서 class가 load됐다고 initialization까지 끝났거나 모든 symbolic reference가 이미 resolve됐다고 보면 안 됩니다.
