---
kind: concept
contentKey: java.core.jvm-runtime.jdk-jvm-classfile
topicContentKey: java.core.jvm-runtime
slug: jdk-jvm-classfile
title: "JDK, JVM, and class files"
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
# JDK·JVM·class file은 각각 무엇을 담당할까

Java 코드를 실행할 때 `Hello.java` 파일을 CPU가 그대로 읽는 것은 아닙니다. 먼저 컴파일러가 Java source를 JVM이 이해할 수 있는 class file로 바꾸고, 실행할 때 JVM이 그 class file을 읽어 프로그램을 동작시킵니다.

이 흐름을 이해하면 `JDK`, `JVM`, `bytecode`를 같은 말처럼 섞지 않게 됩니다.

### Java source는 먼저 class file로 컴파일된다

```text
Hello.java
   │
   │ javac
   ▼
Hello.class
   │
   │ JVM에서 load/execute
   ▼
프로그램 실행
```

`javac`는 Java source를 class file 형식으로 컴파일합니다. class file 안에는 메서드의 JVM instruction, constant pool, class·field·method에 대한 정보 등이 들어갈 수 있습니다.

여기서 흔히 bytecode라고 부르는 것은 JVM instruction을 중심으로 한 실행 표현입니다. `.class` 파일 전체가 단순히 instruction 목록 하나만 있는 파일이라는 뜻은 아닙니다.

### JDK는 개발과 실행에 필요한 도구를 포함한 배포물이다

JDK(Java Development Kit)에는 Java 프로그램을 개발하고 실행하는 데 필요한 여러 도구와 구성요소가 들어 있습니다.

대표적으로:

- `javac`: Java source compiler
- `java`: Java application launcher
- `javap`: class file을 사람이 읽기 쉬운 형태로 확인하는 도구
- `jcmd`, `jfr` 등: 실행 중 JVM 진단 도구

가 있습니다.

따라서 "JDK = JVM"이라고 부르면 역할을 너무 크게 줄여 버립니다. JVM은 JDK 안에서 Java class를 실행하는 핵심 runtime 구성요소 중 하나로 이해하는 편이 정확합니다.

### JVM은 class file의 의미를 실행한다

JVM Specification은 class file 형식과 JVM의 추상 실행 모델을 정의합니다. 예를 들어 bytecode instruction이 operand stack을 어떻게 사용하고 메서드 호출이 어떤 의미를 가지는지 같은 계약이 있습니다.

하지만 specification이 특정 CPU에서 반드시 어떤 native instruction을 써야 하는지까지 정하는 것은 아닙니다.

```text
class file bytecode
       │
       ▼
JVM implementation
 ├─ 해석해서 실행할 수 있음
 └─ 실행 중 native code로 컴파일할 수도 있음
       │
       ▼
CPU에서 실제 실행
```

HotSpot 같은 JVM 구현은 interpreter와 JIT compiler를 사용할 수 있습니다. 이 부분은 JVM 구현 전략입니다.

### bytecode와 native machine code를 같은 것으로 부르면 안 된다

`iadd`, `invokevirtual` 같은 JVM instruction은 특정 x86/ARM CPU instruction 그 자체가 아닙니다. JVM이 실행해야 하는 추상 instruction입니다.

실행 중 JVM은 필요에 따라 이를 해석하거나 native machine code로 컴파일할 수 있습니다.

따라서 다음을 구분합니다.

| 대상 | 의미 |
|---|---|
| Java source | 개발자가 작성한 Java 코드 |
| class file | JVM이 읽을 수 있는 binary format |
| bytecode | class file의 Code 영역에 들어가는 JVM instruction 중심 표현 |
| native code | 실제 CPU에서 실행되는 기계어 |

### "Write once, run anywhere"도 class file만으로 설명하면 부족하다

같은 class file을 여러 운영체제에서 실행할 수 있는 이유는 각 환경에 맞는 JVM 구현이 class file의 의미를 실행해 주기 때문입니다.

```text
            same class file
             /      |      \
            /       |       \
       JVM/Windows JVM/Linux JVM/macOS
            │       │        │
            ▼       ▼        ▼
         각 환경에서 실행
```

물론 프로그램이 native library, 파일 경로, OS 전용 기능 등에 의존한다면 애플리케이션 전체가 자동으로 완전히 portable해지는 것은 아닙니다.

### compile-time 오류와 runtime 오류의 위치도 달라진다

`javac`가 source를 검사하는 과정에서 잡는 오류와 JVM이 class를 load/link/execute하면서 발견하는 오류는 발생 시점이 다릅니다.

예를 들어 source type error는 보통 compile 시점에 막히지만, 실행 환경에서 필요한 class가 없거나 binary compatibility가 깨졌다면 runtime에 `ClassNotFoundException`, `NoClassDefFoundError`, `NoSuchMethodError` 같은 문제를 만날 수 있습니다.

그래서 "컴파일이 성공했으니 runtime classpath도 안전하다"고 결론내리면 안 됩니다.

### 문제를 풀 때 확인할 것

1. 지금 이야기하는 단계가 source compile인지 JVM runtime인지 구분합니다.
2. `.class`와 native executable을 같은 것으로 취급하지 않습니다.
3. JDK 도구의 동작, JVM specification, HotSpot 구현을 구분합니다.
4. compile-time 성공이 runtime dependency까지 보장하는지 따로 봅니다.
5. JIT 이야기가 나오면 Java language 보장인지 JVM 구현인지 확인합니다.

### 면접에서 설명한다면

JDK는 Java 개발과 실행에 필요한 compiler·launcher·diagnostic tool 등을 포함한 개발 키트이고, JVM은 class file의 의미를 실행하는 runtime입니다. `javac`가 Java source를 class file의 bytecode로 컴파일하고, JVM은 그 bytecode를 해석하거나 JIT compile하는 등의 방식으로 실행할 수 있습니다. bytecode는 특정 CPU의 native machine code와 같은 것이 아니며, JVM 구현이 각 실행 환경과 연결해 줍니다.