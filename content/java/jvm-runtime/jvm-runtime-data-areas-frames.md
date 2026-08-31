---
kind: concept
contentKey: java.core.jvm-runtime.jvm-runtime-data-areas-frames
topicContentKey: java.core.jvm-runtime
slug: jvm-runtime-data-areas-frames
title: "JVM runtime data areas and frames"
summary: "JVM stack·frame·local variable array·operand stack·heap·method area를 JVMS의 추상 실행 영역으로 이해하고 source 변수와 물리 메모리를 단순 대응시키지 않는다"
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html"
    title: "Java SE 25 JVMS Chapter 2: The Structure of the JVM"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JVM stack·frame·heap·method area·runtime constant pool 추상 영역 확인
---
# JVM은 메서드 호출과 객체를 어떤 실행 영역으로 설명할까

Java 코드를 설명할 때 흔히 "지역 변수는 stack, 객체는 heap"이라는 한 문장으로 끝내곤 합니다. 입문에서는 방향을 잡는 데 도움이 되지만, 이 문장을 물리 메모리 배치 규칙처럼 받아들이면 JIT 최적화나 JVM specification을 잘못 이해하게 됩니다.

JVMS는 실행 중 필요한 구조를 **JVM runtime data areas**라는 추상 모델로 설명합니다. 먼저 그 모델을 이해하고, 실제 HotSpot의 메모리 구현은 별도의 층으로 봐야 합니다.

### 메서드를 호출할 때 thread의 JVM stack에 frame이 생긴다

각 Java thread에는 JVM stack이 있고, method invocation마다 frame이 만들어집니다.

```text
Thread A JVM Stack
┌─────────────────────┐
│ frame: method C     │ <- 현재 실행
├─────────────────────┤
│ frame: method B     │
├─────────────────────┤
│ frame: method A     │
└─────────────────────┘
```

C가 끝나면 C의 frame이 사라지고 B의 실행으로 돌아갑니다.

재귀 호출도 같은 method 이름의 frame이 반복해서 생기는 구조로 이해할 수 있습니다.

### frame 안에는 local variable array와 operand stack이 있다

JVMS frame은 크게 다음 같은 실행 정보를 가집니다.

```text
Frame
├─ local variable array
├─ operand stack
└─ 현재 method 실행에 필요한 연결/복귀 정보
```

local variable array에는 `this`, method parameter, local 값 등이 slot 형태로 들어갈 수 있습니다. bytecode는 값을 operand stack에 올리고 꺼내며 계산하는 stack-based 실행 모델을 사용합니다.

예를 들어:

```java
int c = a + b;
```

의 bytecode 흐름은 개념적으로:

```text
locals에서 a load
locals에서 b load
      │
      ▼
operand stack [a][b]
      │ add
      ▼
      [c]
      │ store
      ▼
locals에 c
```

처럼 이해할 수 있습니다.

### JVM stack은 thread마다, heap은 JVM 전체에서 공유되는 영역이다

JVMS 추상 모델에서 JVM stack은 thread마다 만들어집니다. 반면 heap은 모든 JVM thread가 공유하는 영역입니다.

```text
Thread A -> JVM Stack A ┐
Thread B -> JVM Stack B ├── references ──▶ Heap objects
Thread C -> JVM Stack C ┘
```

그래서 여러 thread가 heap의 같은 객체를 가리키면 shared mutable state 문제가 생길 수 있습니다.

하지만 이것을 "reference 변수 자체는 반드시 물리 OS stack에 있고 객체는 반드시 한 고정 heap 주소에 있다"는 하드웨어 배치 보장으로 확장하면 안 됩니다.

### 객체의 논리적 heap 소속과 실제 최적화 결과를 구분한다

JVMS는 객체와 배열을 heap에 할당하는 추상 모델을 정의합니다. 하지만 JVM implementation은 observable semantics를 지키는 범위에서 escape analysis, scalar replacement 같은 최적화를 할 수 있습니다.

예를 들어 source에 `new Point(...)`가 있다고 해서 HotSpot이 모든 실행에서 실제 독립 heap allocation을 반드시 하나 생성해야 한다고 성능 분석을 시작하면 안 됩니다.

```text
Java/JVMS 의미: 객체 생성의 프로그램 의미
HotSpot 최적화: observable behavior를 보존하면서 allocation을 최적화할 수 있음
```

언어 의미와 구현 최적화를 분리합니다.

### method area와 runtime constant pool도 JVM의 논리적 영역이다

Method area는 JVM이 class 수준 구조를 관리하는 공유 영역으로 정의됩니다. class의 field/method 정보, runtime constant pool 등과 연결됩니다.

각 class/interface에는 class file의 constant pool에서 만들어지는 runtime constant pool이 있습니다. bytecode의 symbolic method/field reference가 runtime에 연결될 때 중요한 역할을 합니다.

여기서 "method area = metaspace"라고 완전히 같은 개념으로 말하면 층위를 섞게 됩니다.

- **method area**: JVMS의 논리적 runtime 영역
- **Metaspace**: HotSpot이 class metadata를 관리하는 구현 방식/영역 이름

으로 구분합니다.

### PC register와 native method stack도 모델에 포함된다

각 JVM thread에는 현재 실행 중인 JVM instruction과 관련된 `pc` register가 정의됩니다. Native method 실행을 위한 stack 지원도 JVM 구현과 연결될 수 있습니다.

백엔드 개발자가 이 세부를 모두 외울 필요는 없지만, "JVM runtime memory = heap + Java stack 두 개뿐"이라고 설명하지 않기 위해 알아둘 가치가 있습니다.

### StackOverflowError와 OutOfMemoryError를 단순 공식으로 외우지 않는다

재귀 호출이 계속되면 frame이 쌓여 `StackOverflowError`를 만날 수 있습니다.

```java
void recurse() {
    recurse();
}
```

반면 heap allocation을 계속 유지하면 heap 관련 `OutOfMemoryError`가 발생할 수 있습니다.

하지만 `OutOfMemoryError`는 heap 하나만의 오류 이름이 아닙니다. metaspace/native/thread creation 등 다른 자원 부족에서도 서로 다른 메시지와 원인을 만날 수 있습니다.

그래서 실제 장애에서는 error message, heap 사용량, thread 수, native memory evidence를 함께 봅니다.

### source의 변수 종류와 JVM 물리 영역을 일대일로 대응하지 않는다

다음 식의 암기는 피합니다.

```text
local variable = 무조건 OS stack
static variable = 무조건 method area 한 장소
object = 항상 움직이지 않는 heap 주소
```

JLS/JVMS의 source/runtime 의미와 HotSpot 내부 배치를 분리해야 합니다. 특히 GC는 객체를 이동시킬 수 있고 JIT는 변수를 register에 두거나 없앨 수도 있습니다.

### 문제를 풀 때 확인할 것

1. method 호출마다 frame이 생긴다는 실행 모델을 그립니다.
2. local variable array와 operand stack의 역할을 구분합니다.
3. JVM stack이 thread별인지, heap/method area가 공유되는지 봅니다.
4. method area와 HotSpot metaspace를 같은 specification 용어로 쓰지 않습니다.
5. source 변수 종류를 특정 물리 주소와 일대일 대응시키지 않습니다.
6. OOM이 보이면 heap만 보지 말고 실제 오류 영역을 확인합니다.

### 면접에서 설명한다면

JVMS에서는 각 thread가 JVM stack을 가지고 method 호출마다 frame이 생성됩니다. Frame에는 local variable array와 operand stack 등이 있어 bytecode 실행 상태를 담습니다. Heap과 method area는 thread들이 공유하는 논리적 runtime 영역입니다. 다만 이들은 specification의 추상 모델이므로 source local variable을 항상 특정 OS stack 주소에 둔다거나 method area를 HotSpot metaspace와 완전히 같은 개념이라고 설명하면 안 됩니다.