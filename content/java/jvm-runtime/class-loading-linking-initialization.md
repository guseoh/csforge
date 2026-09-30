---
kind: concept
contentKey: java.core.jvm-runtime.class-loading-linking-initialization
topicContentKey: java.core.jvm-runtime
slug: class-loading-linking-initialization
title: "클래스 로딩(Class Loading)·링킹(Linking)·초기화(Initialization)"
summary: "클래스가 실행되기까지 로딩·링킹·초기화가 진행되는 순서와 각 단계의 역할을 이해하고 정적 초기화 시점과 오류를 구분한다"
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-5.html"
    title: "Java SE 25 JVMS Chapter 5: Loading, Linking, and Initializing"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 클래스 생명주기 단계와 초기화 유발 조건 확인
  - url: "https://engineering.linecorp.com/en/blog/line-open-jdk/"
    title: "LINE의 OpenJDK 적용기: 호환성 확인부터 주의 사항까지"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 2
    relationNote: JDK 구현과 실행 환경 차이가 클래스와 런타임 호환성에 미치는 영향 보충
---
# 클래스 로딩(Class Loading)·링킹(Linking)·초기화(Initialization)

Java 클래스를 처음 사용할 때 JVM은 클래스 파일을 읽자마자 정적 초기화 코드를 실행하지 않습니다. JVMS는 클래스를 실행할 준비를 하는 과정을 **로딩(loading), 링킹(linking), 초기화(initialization)**로 나눕니다. 이 구분을 알면 정적 초기화 시점과 `LinkageError`, `NoClassDefFoundError` 같은 문제를 더 정확하게 추적할 수 있습니다.

![클래스 생명주기: 로딩, 링킹, 초기화](/learning/java/class-loading-lifecycle.svg)

### 로딩은 바이너리 표현에서 런타임 클래스를 만든다

로딩 단계에서는 ClassLoader가 바이너리 이름(binary name)에 해당하는 클래스의 바이너리 표현을 찾아 JVM 안에 런타임 클래스를 만듭니다.

```text
com.example.Config (바이너리 이름)
        │
        ▼
   ClassLoader
        │ 클래스 바이트
        ▼
   실행 시점의 Class 객체
```

클래스 바이트를 찾는 위치는 클래스패스, 모듈 경로, 사용자 정의 `ClassLoader` 같은 실행 환경에 따라 달라질 수 있습니다. 중요한 점은 **로딩이 끝났다는 사실과 정적 초기화까지 끝났다는 사실은 다르다**는 것입니다.

### 링킹은 검증, 준비, 해석을 포함한다

링킹은 로드된 클래스를 JVM 실행 환경에 연결하는 단계이며 검증(verification), 준비(preparation), 해석(resolution)으로 나눌 수 있습니다.

```text
로딩
  │
  ▼
링킹
  ├─ 검증
  ├─ 준비
  └─ 해석
  │
  ▼
초기화
```

다만 이 그림을 모든 단계가 항상 한 번에 직선으로 끝나는 실제 시간 순서로 외우면 안 됩니다. JVMS는 **검증과 준비가 초기화 전에 완료되어야 한다고 규정하지만, 해석은 각 심볼릭 참조가 실제로 필요해질 때까지 미룰 수 있도록 허용**합니다.

검증 단계에서는 클래스 파일 구조와 바이트코드가 JVM의 구조·타입 규칙을 만족하는지 확인합니다. 준비 단계에서는 정적 필드에 사용할 런타임 저장 공간을 마련하고 기본값을 설정합니다.

```java
class Config {
    static int port = 8080;
    static String name = loadName();
}
```

준비 단계는 개념적으로 소스에 적힌 초기화식의 결과를 실행하는 단계가 아닙니다.

```text
port -> 0
name -> null
```

`8080`을 대입하거나 `loadName()`을 호출하는 소스 초기화식은 초기화 단계에서 실행됩니다. 컴파일 시점 상수에는 별도 규칙이 있으므로 모든 정적 필드의 처리를 하나로 일반화하지 않습니다.

### 해석은 심볼릭 참조를 런타임 대상에 연결한다

클래스 파일의 상수 풀에는 다른 클래스, 필드, 메서드 등을 가리키는 심볼릭 참조가 들어 있습니다. 해석 단계에서는 이 참조가 가리키는 실제 런타임 클래스·필드·메서드를 결정하고 유효성을 확인합니다.

```text
"com/example/Service.doWork:()V" (심볼릭 참조)
                │
                ▼
        런타임 메서드 참조
```

JVM은 이 작업을 일찍 수행할 수도 있고 실제 참조가 필요해질 때까지 늦출 수도 있습니다. 따라서 잘못된 바이너리 의존성이 애플리케이션 시작 시점이 아니라 특정 코드 경로를 처음 실행할 때 드러날 수도 있습니다.

### 초기화 단계에서 정적 초기화 코드가 실행된다

초기화 단계에서는 클래스 변수의 초기화식과 정적 초기화 블록이 정해진 규칙에 따라 실행됩니다.

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
준비
port = 0
   │
   ▼
초기화
readPort()
   │
validate(port)
```

클래스가 로드되었다고 초기화까지 끝난 것은 아닙니다. 또한 클래스 이름을 어떤 형태로 언급했다고 해서 항상 초기화가 시작되는 것도 아닙니다. `new`, 특정 정적 필드·메서드 사용, 리플렉션 연산 등 초기화를 유발하는 조건은 JLS/JVMS 규칙을 따릅니다.

### JVM은 여러 스레드의 클래스 초기화를 조정한다

여러 스레드가 같은 클래스를 처음 사용하더라도 정적 초기화가 임의로 여러 번 동시에 실행되지는 않습니다. JVM은 클래스·인터페이스의 초기화 상태와 동기화 절차를 정의합니다.

이 성질은 초기화 지연 홀더(initialization-on-demand holder) 패턴처럼 클래스 초기화를 안전한 공개 경계로 사용하는 패턴의 근거가 됩니다. 반대로 정적 초기화 블록에서 다른 잠금을 획득하거나 다른 클래스 초기화를 복잡하게 유발하면 초기화 의존성이 꼬일 수 있으므로 무거운 작업은 신중하게 둡니다.

### 초기화 실패와 클래스 부재를 구분한다

```java
class Broken {
    static final Config CONFIG = load(); // 예외
}
```

초기화가 실패하면 해당 클래스는 정상적으로 초기화되지 못하고 오류 상태(erroneous state)가 될 수 있습니다. 최초 실패에서는 `ExceptionInInitializerError` 같은 오류가 보이고, 이후 같은 클래스를 사용하려는 코드에서는 `NoClassDefFoundError`가 나타날 수 있습니다.

따라서 `NoClassDefFoundError`를 보았다고 항상 "클래스 파일이 없다"고 결론 내리면 안 됩니다. 실제 클래스패스에 클래스가 없는 것인지, 이전 초기화가 실패한 것인지 실행 이력을 함께 확인해야 합니다.

### 정리

클래스 생명주기는 `로딩 → 링킹 → 초기화`로 이해할 수 있지만, 심볼릭 참조의 해석은 필요한 시점까지 지연될 수 있습니다. 준비 단계에서는 정적 저장 공간과 기본값을 마련하고, 개발자가 작성한 초기화식과 정적 초기화 블록은 초기화 단계에서 실행됩니다. 따라서 클래스가 로드됐다는 사실, 모든 심볼릭 참조가 해석됐다는 사실, 정적 초기화가 끝났다는 사실을 같은 상태로 취급하면 안 됩니다.
