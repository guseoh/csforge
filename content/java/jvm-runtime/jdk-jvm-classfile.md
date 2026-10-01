---
kind: concept
contentKey: java.core.jvm-runtime.jdk-jvm-classfile
topicContentKey: java.core.jvm-runtime
slug: jdk-jvm-classfile
title: "JDK·JVM·클래스 파일의 경계"
summary: "Java 소스가 javac를 거쳐 클래스 파일이 되고 JVM이 이를 실행하는 흐름을 이해하며 JDK·JVM·바이트코드·네이티브 코드의 역할을 구분한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/"
    title: "Java SE 25 JVM Specification"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JVM과 클래스 파일 명세의 범위 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html"
    title: "The javac Command"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Java 소스 컴파일 단계 확인
---
# JDK·JVM·클래스 파일의 경계

CPU가 Java 소스 코드를 그대로 실행하는 것은 아닙니다. 일반적인 실행 흐름은 **소스 코드를 클래스 파일로 컴파일하고, JVM이 클래스 파일의 의미를 실행하는 것**입니다.

![Java 소스에서 JVM 실행까지의 경계](/learning/java/java-execution-boundary.svg)

```text
Java 소스(.java)
      │ javac
      ▼
클래스 파일(.class)
      │ JVM 로딩·링킹·실행
      ▼
JVM 구현
      │ 인터프리터(interpreter)·JIT 등의 실행 전략
      ▼
네이티브 기계어 / CPU 실행
```

### JDK는 JVM보다 넓은 개발·실행 도구 모음이다

JDK(Java Development Kit)에는 JVM뿐 아니라 Java 프로그램을 만들고 진단하는 여러 도구가 포함됩니다.

- `javac`: Java 소스 컴파일러
- `java`: Java 애플리케이션 실행 도구
- `javap`: 클래스 파일 분석 도구
- `jcmd`, `jfr` 등: 실행 중 JVM 진단 도구

따라서 `JDK = JVM`이라고 하면 두 역할을 혼동합니다. JVM은 클래스 파일을 실행하는 런타임의 핵심 구성 요소이고, JDK는 JVM과 컴파일러·도구를 포함하는 더 넓은 배포 패키지입니다.

### 클래스 파일에는 바이트코드 외의 정보도 들어 있다

`javac`는 Java 소스 코드를 JVM 클래스 파일 형식으로 변환합니다. 클래스 파일에는 메서드의 JVM 명령뿐 아니라 상수 풀, 필드·메서드 정보, 속성(attribute) 등 실행과 링킹에 필요한 구조가 들어갑니다.

흔히 **바이트코드(bytecode)**라고 부르는 것은 클래스 파일 안의 JVM 명령 중심 표현입니다. `.class` 파일 전체를 단순한 명령 배열로만 이해해서는 부족합니다.

### JVM 명세와 HotSpot 구현을 구분한다

JVMS는 클래스 파일 형식, 런타임 데이터 영역(runtime data area), JVM 명령의 의미 같은 **추상 실행 계약**을 정의합니다. 특정 CPU에서 어떤 네이티브 명령을 써야 하는지, 어떤 JIT 컴파일 전략을 따라야 하는지까지 규정하지는 않습니다.

HotSpot 같은 JVM 구현은 바이트코드를 인터프리터로 실행하거나 실행 중 프로파일링 정보를 바탕으로 네이티브 코드로 JIT 컴파일할 수 있습니다.

```text
JVMS
- 클래스 파일과 JVM 명령의 의미
- JVM의 추상 실행 모델

HotSpot
- 인터프리터
- JIT 컴파일러
- GC 컬렉터
- 구체적인 런타임 최적화
```

그래서 `iadd`, `invokevirtual` 같은 JVM 명령은 x86·ARM 기계어 명령과 같은 것이 아닙니다.

### 컴파일 성공과 실행 시점의 성공은 별개다

소스 수준의 타입 오류는 보통 `javac` 단계에서 막히지만, 실행 환경의 클래스패스·모듈 경로나 바이너리 호환성 문제는 실행 시점에 나타날 수 있습니다.

예를 들어 필요한 클래스가 없거나 호출하려는 메서드가 런타임 클래스에 없다면 `ClassNotFoundException`, `NoClassDefFoundError`, `NoSuchMethodError` 같은 서로 다른 실패를 만날 수 있습니다.

```text
컴파일 시점
Java 소스 코드가 언어·타입 규칙을 만족하는가?

실행 시점
필요한 클래스를 실제로 로드·링크할 수 있는가?
참조하는 필드·메서드가 존재하는가?
```

따라서 "컴파일됐으니 런타임 의존성도 안전하다"고 결론내리면 안 됩니다.

이 Concept에서 가장 중요한 것은 네 계층을 혼동하지 않는 것입니다. **Java 소스 코드**, **클래스 파일·바이트코드**, **JVM 명세**, **HotSpot과 실제 CPU 실행**을 차례로 구분하면 클래스 로딩, JIT, GC 설명에서도 어느 계층이 보장하는 내용인지 정확하게 파악할 수 있습니다.
