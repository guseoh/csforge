---
kind: concept
contentKey: java.core.jvm-runtime.bytecode-javap
topicContentKey: java.core.jvm-runtime
slug: bytecode-javap
title: "바이트코드와 javap로 실행 흔적 읽기"
summary: "javap로 class 파일을 살펴 Java 소스가 JVM 명령어로 표현되는 큰 흐름을 읽고, 바이트코드와 JIT가 만드는 네이티브 코드를 구분한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/specs/man/javap.html"
    title: "The javap Command"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: class disassembly와 -c/-v 옵션 확인
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html"
    title: "Java SE 25 JVMS Chapter 4: The class File Format"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Code·constant pool 등 class file 구조 확인
---
# 바이트코드와 javap로 실행 흔적 읽기

대부분의 Java 개발자는 바이트코드 명령을 외울 필요가 없습니다. 다만 소스 코드만으로 컴파일러가 만든 호출과 분기를 파악하기 어려울 때 클래스 파일을 직접 보면 **소스 코드와 JVM 실행 모델 사이의 중간 표현**을 확인할 수 있습니다.

`javap`는 클래스 파일을 사람이 읽을 수 있는 형태로 보여 주는 JDK 도구입니다.

### 먼저 `javap -c`로 메서드의 JVM 명령을 확인한다

예를 들어 다음 메서드가 있습니다.

```java
public int add(int a, int b) {
    return a + b;
}
```

컴파일한 뒤:

```text
javac Example.java
javap -c Example
```

를 실행하면 개념적으로 다음과 같은 흐름을 볼 수 있습니다.

```text
load a
load b
integer add
return
```

실제 출력에서는 `iload`, `iadd`, `ireturn` 같은 JVM 명령 이름이 나타납니다.

중요한 것은 명령 이름을 암기하는 것이 아니라:

- 어떤 값을 지역 변수에서 꺼내는지
- 피연산자 스택에서 어떤 계산이 일어나는지
- 어떤 메서드를 호출하는지
- 어느 위치로 분기하는지

를 따라가면 됩니다.

### JVM 명령은 피연산자 스택을 많이 사용한다

JVM 메서드 프레임에는 지역 변수 배열(local variable array)과 피연산자 스택(operand stack)이 있습니다.

간단한 덧셈은 다음처럼 이해할 수 있습니다.

```text
지역 변수
[ this ][ a ][ b ]
          │    │
          └────┴── load
                 ▼
피연산자 스택 [a][b]
                 │
                iadd
                 ▼
              [a+b]
                 │
               return
```

이 흐름을 알면 바이트코드에서 load/store와 스택 연산이 자주 보이는 이유를 이해하기 쉽습니다.

### 메서드 호출 명령에서 호출 종류를 추측할 수 있다

`javap -c`에서는 메서드 호출이 어떤 JVM 명령으로 표현됐는지도 확인할 수 있습니다.

예를 들어 인스턴스 메서드, 정적 메서드, 인터페이스 메서드에는 서로 다른 호출 명령이 나타날 수 있습니다. 이를 통해 Java 소스의 호출 의미가 클래스 파일에 어떻게 표현되는지 확인할 수 있습니다.

다만 `invokevirtual`이 보인다고 실행 시점에 매번 느린 동적 탐색을 한다고 생각하면 안 됩니다. HotSpot JIT는 실제 실행 중 프로파일링 정보를 바탕으로 호출을 최적화할 수 있습니다. **클래스 파일의 바이트코드와 최종 네이티브 코드 실행 방식은 서로 다른 계층**입니다.

### `javap -v`는 클래스 파일의 상세 정보를 더 보여 준다

```text
javap -v Example
```

를 사용하면 다음과 같은 정보를 더 볼 수 있습니다.

- 클래스 파일 버전
- 접근 플래그
- 상수 풀
- 메서드 디스크립터
- `Code` 속성
- 예외 table
- 포함된 경우 줄 번호·디버그 메타데이터

상수 풀에는 문자열뿐 아니라 심볼릭 참조(symbolic reference)와 여러 상수가 들어갑니다. JVM은 링킹 과정에서 이 참조를 실제 실행 구조와 연결할 수 있습니다.

### 소스 코드 한 줄과 바이트코드 한 줄은 일대일로 대응하지 않는다

다음처럼 생각하면 안 됩니다.

```text
Java source 1줄 = bytecode 1개
```

소스 코드의 한 표현식이 여러 명령으로 바뀔 수 있고 컴파일러가 합성 코드나 다른 형태를 만들 수도 있습니다. 반대로 소스에서는 단순해 보이는 구문도 클래스 파일에서는 여러 메타데이터와 명령으로 표현될 수 있습니다.

컴파일러 버전, 대상 Java 릴리스, 컴파일러 구현에 따라 표현이 달라질 수 있습니다. 따라서 특정 바이트코드 모양을 Java 언어의 영구적인 문법 보장처럼 외우지 않습니다.

### 바이트코드는 JIT가 만든 최종 네이티브 코드가 아니다

`javap`는 클래스 파일을 해석해 보여 주는 도구입니다. 실행 중 JVM이 프로파일링을 통해 어떤 메서드를 JIT 컴파일했고 어떤 기계어를 만들었는지 직접 보여 주지는 않습니다.

```text
소스 코드
  │ javac
  ▼
클래스 파일의 바이트코드  <-- javap가 보는 대상
  │
  ▼
JVM 실행 시점
  │ 인터프리터(interpreter) / JIT
  ▼
네이티브 코드
```

성능을 분석하려면 JFR, profiler, JIT log, disassembly 같은 다른 근거가 필요할 수 있습니다.

### 실무에서는 언제 유용한가

Bytecode를 직접 보는 상황은 생각보다 명확합니다.

- lambda/record/try-with-resources 같은 소스 construct가 어떻게 변환됐는지 확인
- bridge 메서드나 synthetic 멤버 확인
- 실제 컴파일 대상과 클래스 파일 version 확인
- annotation 메타데이터 존재 여부 확인
- 프록시·프레임워크 문제에서 메서드 시그니처와 디스크립터 확인
- 바이너리 호환성 오류를 진단할 때 클래스 파일이 어떤 메서드를 실제로 포함하는지 확인

모든 문제에 `javap`부터 쓰는 것이 아니라 소스와 런타임 사이의 경계가 의심될 때 사용합니다.

### 문제를 풀 때 확인할 것

1. `javap`가 소스가 아니라 클래스 파일을 보는 도구라는 점을 확인합니다.
2. 지역 변수와 피연산자 스택 흐름을 먼저 봅니다.
3. 메서드/필드 참조와 branch 위치를 찾습니다.
4. debug 메타데이터가 반드시 존재한다고 가정하지 않습니다.
5. 바이트코드와 JIT 네이티브 코드를 구분합니다.
6. 컴파일러가 만든 구체적인 명령 배열을 Java 언어 guarantee처럼 말하지 않습니다.

### 학습 후 스스로 설명해 보기

`javap`는 클래스 파일을 역어셈블해 바이트코드와 메타데이터를 확인하는 JDK 도구입니다. `-c`는 메서드의 JVM 명령을, `-v`는 상수 풀과 접근 플래그 등 더 상세한 클래스 파일 정보를 보여 줍니다. 바이트코드는 JVM의 중간 실행 표현이지 CPU 네이티브 코드와 같지 않습니다. 실제 실행에서는 JVM이 바이트코드를 해석하거나 JIT 컴파일할 수 있습니다.
