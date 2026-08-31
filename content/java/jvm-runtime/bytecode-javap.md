---
kind: concept
contentKey: java.core.jvm-runtime.bytecode-javap
topicContentKey: java.core.jvm-runtime
slug: bytecode-javap
title: "Bytecode and javap"
summary: "javap로 class file을 열어 source가 JVM instruction으로 어떻게 표현되는지 큰 흐름을 읽고 bytecode와 JIT native code를 구분한다"
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
# Bytecode를 왜 직접 볼까

대부분의 Java 개발에서는 bytecode instruction을 외울 필요가 없습니다. 하지만 source만 봐서는 컴파일러가 어떤 호출과 분기를 만들었는지 헷갈릴 때, class file을 직접 보면 **source와 JVM 실행 모델 사이의 중간 표현**을 확인할 수 있습니다.

`javap`는 class file을 사람이 읽을 수 있는 형태로 보여 주는 JDK 도구입니다.

### 가장 먼저 `javap -c`로 메서드의 JVM instruction을 본다

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

실제 출력에서는 `iload`, `iadd`, `ireturn` 같은 JVM instruction 이름이 나타납니다.

중요한 것은 instruction 이름을 암기하는 것이 아니라:

- 어떤 값을 local variable에서 꺼내는지
- operand stack에서 어떤 계산이 일어나는지
- 어떤 method를 호출하는지
- 어디로 branch하는지

를 따라가는 것입니다.

### JVM instruction은 operand stack을 많이 사용한다

JVM의 method frame에는 local variable array와 operand stack이 있습니다.

간단한 덧셈은 다음처럼 이해할 수 있습니다.

```text
locals
[ this ][ a ][ b ]
          │    │
          └────┴── load
                 ▼
operand stack [a][b]
                 │
                iadd
                 ▼
              [a+b]
                 │
               return
```

이 흐름을 알면 왜 bytecode에 load/store와 stack 연산이 자주 보이는지 이해하기 쉽습니다.

### method 호출 instruction을 보면 호출 종류의 힌트를 얻을 수 있다

`javap -c`에서는 method 호출이 어떤 JVM instruction으로 표현됐는지도 확인할 수 있습니다.

예를 들어 instance method, static method, interface method는 서로 다른 호출 instruction이 나타날 수 있습니다. 이것은 Java source의 호출 의미가 class file에서 어떻게 표현되는지 확인하는 데 유용합니다.

다만 `invokevirtual`이 보인다고 runtime이 반드시 "매번 느린 동적 탐색"을 그대로 한다고 생각하면 안 됩니다. HotSpot JIT는 실제 실행 중 profiling을 바탕으로 호출을 최적화할 수 있습니다. **class file bytecode와 최종 native execution 전략은 다른 층**입니다.

### `javap -v`는 class file의 더 많은 정보를 보여 준다

```text
javap -v Example
```

를 사용하면 다음과 같은 정보를 더 볼 수 있습니다.

- class/file version
- access flags
- constant pool
- method descriptor
- Code attribute
- exception table
- line number/debug 정보가 포함된 경우 해당 metadata

constant pool에는 문자열만 있는 것이 아니라 symbolic reference와 여러 상수가 들어갑니다. JVM은 linking 과정에서 이런 symbolic reference를 실제 runtime 구조와 연결할 수 있습니다.

### source 한 줄과 bytecode 한 줄은 일대일이 아니다

다음처럼 생각하면 안 됩니다.

```text
Java source 1줄 = bytecode 1개
```

source expression 하나가 여러 instruction으로 바뀔 수 있고, compiler가 합성 코드나 다른 형태를 만들 수 있습니다. 반대로 source에서 단순해 보이는 construct도 class file에서는 여러 metadata와 instruction으로 표현될 수 있습니다.

컴파일러 버전이나 target release, compiler 구현에 따라 표현이 달라질 여지도 있습니다. 그래서 특정 bytecode 모양을 Java language의 영구적인 syntax 보장처럼 외우지 않습니다.

### bytecode는 JIT가 만든 최종 native code가 아니다

`javap`는 class file을 해석해서 보여 주는 도구입니다. 실행 중 JVM이 profiling을 통해 어떤 method를 JIT compile했고 어떤 machine code를 만들었는지를 직접 보여 주는 도구가 아닙니다.

```text
source
  │ javac
  ▼
class bytecode  <-- javap가 보는 대상
  │
  ▼
JVM runtime
  │ interpreter / JIT
  ▼
native code
```

성능을 분석하려면 JFR, profiler, JIT log, disassembly 같은 다른 evidence가 필요할 수 있습니다.

### 실무에서는 언제 유용한가

Bytecode를 직접 보는 상황은 생각보다 명확합니다.

- lambda/record/try-with-resources 같은 source construct가 어떻게 변환됐는지 확인
- bridge method나 synthetic member 확인
- 실제 compile target과 class file version 확인
- annotation metadata 존재 여부 확인
- proxy/framework 문제에서 method signature와 descriptor 확인
- binary compatibility 오류를 진단할 때 class가 어떤 method를 실제로 갖는지 확인

모든 문제에 `javap`부터 쓰는 것이 아니라 source와 runtime 사이의 경계가 의심될 때 사용합니다.

### 문제를 풀 때 확인할 것

1. `javap`가 source가 아니라 class file을 보는 도구라는 점을 확인합니다.
2. local variable과 operand stack 흐름을 먼저 봅니다.
3. method/field reference와 branch 위치를 찾습니다.
4. debug metadata가 반드시 존재한다고 가정하지 않습니다.
5. bytecode와 JIT native code를 구분합니다.
6. compiler가 만든 구체적인 instruction 배열을 Java language guarantee처럼 말하지 않습니다.

### 면접에서 설명한다면

`javap`는 class file을 역어셈블해 bytecode와 metadata를 확인하는 JDK 도구입니다. `-c`로 method의 JVM instruction을, `-v`로 constant pool과 flags 같은 더 자세한 class file 정보를 볼 수 있습니다. Bytecode는 JVM의 중간 실행 표현이지 CPU native code와 동일하지 않으며, 실제 runtime에서는 JVM이 이를 해석하거나 JIT compile할 수 있습니다.
