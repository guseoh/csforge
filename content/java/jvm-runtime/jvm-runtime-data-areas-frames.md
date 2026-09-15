---
kind: concept
contentKey: java.core.jvm-runtime.jvm-runtime-data-areas-frames
topicContentKey: java.core.jvm-runtime
slug: jvm-runtime-data-areas-frames
title: "JVM Runtime Data Area와 Frame"
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
  - url: "https://d2.naver.com/helloworld/329631"
    title: "네이버 D2: Java Reference와 GC"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 2
    relationNote: Java 객체와 참조가 runtime memory model에서 어떻게 연결되는지 보충
---
# JVM Runtime Data Area와 Frame

"지역 변수는 stack, 객체는 heap"이라는 설명은 입문용 방향으로는 도움이 되지만 물리 메모리 배치 규칙으로 받아들이면 부정확해집니다. JVMS는 실행 중 필요한 구조를 **runtime data area라는 추상 모델**로 정의하고, 실제 HotSpot의 배치와 최적화는 구현에 맡깁니다.

![JVM Runtime Data Area의 thread별 stack과 공유 영역](/learning/java/jvm-runtime-data-areas.svg)

### 각 thread에는 JVM stack이 있고 호출마다 frame이 생긴다

Method invocation마다 현재 thread의 JVM stack에 frame이 만들어집니다.

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

C가 정상 또는 비정상 종료되면 C의 frame은 현재 invocation에서 더 이상 사용되지 않고 caller인 B의 실행으로 돌아갑니다. 재귀 호출은 같은 method에 대한 frame이 여러 개 중첩되는 구조로 이해할 수 있습니다.

### Frame의 핵심은 local variable array와 operand stack이다

JVMS frame에는 현재 method 실행에 필요한 local variable array와 operand stack 등이 있습니다.

```java
int c = a + b;
```

개념적인 bytecode 실행은 다음처럼 볼 수 있습니다.

```text
local variable array에서 a load
local variable array에서 b load
        │
        ▼
operand stack [a][b]
        │ add
        ▼
        [c]
        │ store
        ▼
local variable array에 c
```

Source variable 이름과 JVM slot이 항상 1:1로 남아 있는 것은 아니며 debug metadata가 없거나 JIT 최적화가 적용되면 source 수준 정보와 실제 실행 표현은 더 달라질 수 있습니다.

### JVM stack은 thread별이고 heap·method area는 공유 영역이다

JVMS 추상 모델에서 JVM stack은 thread마다 private하게 생성됩니다. 반면 heap과 method area는 JVM의 모든 thread가 공유합니다.

```text
Thread A -> JVM Stack A ┐
Thread B -> JVM Stack B ├── references ──▶ Heap objects
Thread C -> JVM Stack C ┘

                    └── shared Method Area
```

Heap은 class instance와 array가 할당되는 논리적 영역이고 GC의 automatic storage management 대상입니다. Method area에는 class 수준 구조와 runtime constant pool 등이 연결됩니다.

### Method area와 HotSpot Metaspace는 같은 specification 용어가 아니다

JVMS의 **method area**는 논리적 runtime 영역입니다. HotSpot의 **Metaspace**는 class metadata를 native memory에서 관리하는 구체 구현입니다.

```text
JVMS contract
Method Area

HotSpot implementation
Metaspace 등으로 class metadata 관리
```

따라서 `method area = metaspace`라고 완전히 같은 개념처럼 말하면 specification과 구현을 섞게 됩니다.

### 객체가 heap에 있다는 의미와 실제 allocation 최적화도 구분한다

JVMS는 객체와 배열을 heap에서 관리하는 추상 모델을 제공합니다. 하지만 JVM implementation은 observable behavior를 보존하면서 escape analysis나 scalar replacement 같은 최적화를 적용할 수 있습니다.

Source에 `new Point()`가 보인다고 해서 성능 분석에서 "실제 독립 heap object가 반드시 하나 할당됐다"고 바로 결론내리면 안 됩니다.

### 오류 이름도 실제 부족한 runtime resource를 기준으로 읽는다

깊은 재귀는 frame이 계속 쌓이며 `StackOverflowError`로 이어질 수 있습니다. 반면 `OutOfMemoryError`는 Java heap만의 오류 이름이 아닙니다. Heap, class metadata, native thread/resource 등 서로 다른 부족 상황에서 원인이 달라질 수 있습니다.

JVM 메모리 문제를 볼 때는 source 변수 종류를 특정 물리 주소에 일대일 대응하지 말고, **JVMS의 추상 영역 → 현재 JVM 구현 → 실제 진단 evidence** 순서로 확인하세요. 이 층위를 지키는 것이 JVM memory model 학습의 핵심입니다.
