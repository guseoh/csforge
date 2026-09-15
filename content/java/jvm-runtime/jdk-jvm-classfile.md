---
kind: concept
contentKey: java.core.jvm-runtime.jdk-jvm-classfile
topicContentKey: java.core.jvm-runtime
slug: jdk-jvm-classfile
title: "JDK·JVM·Class File의 경계"
summary: "Java source가 javac를 거쳐 class file이 되고 JVM이 이를 실행하는 흐름을 이해하며 JDK·JVM·bytecode·native code의 역할을 구분한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/"
    title: "Java SE 25 JVM Specification"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JVM과 class file specification의 범위 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html"
    title: "The javac Command"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Java source compile 단계 확인
---
# JDK·JVM·Class File의 경계

Java source를 CPU가 그대로 실행하는 것은 아닙니다. 일반적인 실행 흐름은 **source를 class file로 컴파일하고, JVM이 class file의 의미를 실행하는 것**입니다.

![Java source에서 JVM 실행까지의 경계](/learning/java/java-execution-boundary.svg)

```text
Java source (.java)
      │ javac
      ▼
class file (.class)
      │ JVM load / link / execute
      ▼
JVM implementation
      │ interpreter / JIT 등의 실행 전략
      ▼
native machine code / CPU 실행
```

### JDK는 JVM보다 넓은 개발·실행 도구 모음이다

JDK(Java Development Kit)에는 JVM뿐 아니라 Java 프로그램을 만들고 진단하는 여러 도구가 포함됩니다.

- `javac`: Java source compiler
- `java`: Java application launcher
- `javap`: class file을 분석하는 도구
- `jcmd`, `jfr` 등: 실행 중 JVM 진단 도구

따라서 `JDK = JVM`이라고 부르면 역할을 섞게 됩니다. JVM은 class file을 실행하는 runtime의 핵심 구성요소이고, JDK는 그 JVM과 compiler·tool을 포함한 더 넓은 배포물입니다.

### class file은 bytecode만 들어 있는 파일이 아니다

`javac`는 Java source를 JVM class file 형식으로 만듭니다. Class file에는 method의 JVM instruction뿐 아니라 constant pool, field/method 정보, attribute 등 실행과 linking에 필요한 구조가 들어갑니다.

흔히 **bytecode**라고 부르는 것은 이 class file 안의 JVM instruction 중심 표현입니다. `.class` 전체를 단순 instruction 배열 하나로 이해하면 부족합니다.

### JVM specification과 HotSpot 구현을 구분한다

JVMS는 class file 형식, runtime data area, JVM instruction의 의미 같은 **추상 실행 계약**을 정의합니다. 특정 CPU에서 어떤 native instruction을 사용해야 하는지나 어떤 JIT compiler 전략을 써야 하는지까지 규정하지는 않습니다.

HotSpot 같은 JVM 구현은 bytecode를 interpreter로 실행하거나 실행 중 profiling을 바탕으로 native code로 JIT compile할 수 있습니다.

```text
JVMS
- class file과 JVM instruction의 의미
- JVM의 추상 실행 모델

HotSpot
- interpreter
- JIT compiler
- GC collector
- 구체적인 runtime 최적화
```

그래서 `iadd`, `invokevirtual` 같은 JVM instruction은 x86·ARM machine instruction과 같은 것이 아닙니다.

### compile 성공과 runtime 성공도 다른 경계다

Source type error는 보통 `javac` 단계에서 막히지만, 실행 환경의 classpath/module path나 binary compatibility 문제는 runtime에 나타날 수 있습니다.

예를 들어 필요한 class가 없거나 호출하려는 method가 runtime class에 없다면 `ClassNotFoundException`, `NoClassDefFoundError`, `NoSuchMethodError` 같은 서로 다른 실패를 만날 수 있습니다.

```text
compile-time
Java source가 language/type 규칙을 만족하는가?

runtime
필요한 class를 실제로 load/link할 수 있는가?
실행 중 참조하는 field/method가 존재하는가?
```

따라서 "컴파일됐으니 runtime dependency도 안전하다"고 결론내리면 안 됩니다.

이 Concept에서 가장 중요한 것은 네 층을 섞지 않는 것입니다. **Java source**, **class file/bytecode**, **JVM specification**, **HotSpot과 실제 CPU 실행**을 차례로 구분하면 이후 class loading, JIT, GC 설명도 어느 계층의 보장인지 정확하게 읽을 수 있습니다.
