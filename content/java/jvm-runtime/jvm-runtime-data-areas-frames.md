---
kind: concept
contentKey: java.core.jvm-runtime.jvm-runtime-data-areas-frames
topicContentKey: java.core.jvm-runtime
slug: jvm-runtime-data-areas-frames
title: "JVM 런타임 데이터 영역(Runtime Data Area)과 프레임(Frame)"
summary: "JVM 스택·프레임·지역 변수 배열·피연산자 스택·힙·메서드 영역을 JVMS가 정의하는 추상 실행 모델로 이해하고 소스 변수와 물리 메모리를 단순 대응시키지 않는다"
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
# JVM 런타임 데이터 영역(Runtime Data Area)과 프레임(Frame)

"지역 변수는 스택, 객체는 힙에 있다"는 설명은 입문 단계의 방향을 잡는 데 도움이 되지만, 이를 물리 메모리 배치 규칙으로 받아들이면 부정확합니다. JVMS는 실행에 필요한 구조를 **런타임 데이터 영역이라는 추상 모델**로 정의하며, HotSpot에서 실제로 배치하고 최적화하는 방식은 구현에 맡깁니다.

![JVM 런타임 데이터 영역: 스레드별 스택과 공유 영역](/learning/java/jvm-runtime-data-areas.svg)

### 각 스레드에는 JVM 스택이 있고 메서드 호출마다 프레임이 생긴다

메서드를 호출할 때마다 현재 스레드의 JVM 스택에 프레임이 만들어집니다.

```text
스레드 A의 JVM 스택
┌─────────────────────┐
│ 프레임: 메서드 C     │ <- 현재 실행
├─────────────────────┤
│ 프레임: 메서드 B     │
├─────────────────────┤
│ 프레임: 메서드 A     │
└─────────────────────┘
```

C가 정상적으로 끝나거나 예외로 종료되면 해당 프레임은 호출에서 빠지고, 호출자인 B의 실행으로 돌아갑니다. 재귀 호출에서는 같은 메서드에 대한 프레임이 여러 개 쌓일 수 있습니다.

### 프레임에는 지역 변수 배열과 피연산자 스택이 있다

JVMS의 프레임에는 현재 메서드 실행에 필요한 지역 변수 배열과 피연산자 스택 등이 있습니다.

```java
int c = a + b;
```

개념적인 bytecode 실행은 다음처럼 볼 수 있습니다.

```text
지역 변수 배열에서 a를 읽음
지역 변수 배열에서 b를 읽음
        │
        ▼
피연산자 스택 [a][b]
        │ 더하기
        ▼
        [c]
        │ 저장
        ▼
지역 변수 배열에 c를 저장
```

소스 변수 이름과 JVM 슬롯이 항상 일대일로 남아 있는 것은 아닙니다. 디버그 정보가 없거나 JIT 최적화가 적용되면 소스 수준의 정보와 실제 실행 표현이 더 달라질 수 있습니다.

### JVM 스택은 스레드별이고 힙과 메서드 영역은 공유된다

JVMS의 추상 모델에서 JVM 스택은 스레드마다 별도로 생성됩니다. 반면 힙과 메서드 영역은 JVM의 모든 스레드가 공유합니다.

```text
스레드 A -> JVM 스택 A ┐
스레드 B -> JVM 스택 B ├── 참조 ──▶ 힙 객체
스레드 C -> JVM 스택 C ┘

                    └── 공유 메서드 영역
```

힙은 클래스 인스턴스와 배열이 할당되는 논리적 영역이며 GC의 자동 메모리 관리 대상입니다. 메서드 영역에는 클래스 수준 구조와 런타임 상수 풀 등이 포함됩니다.

### JVMS의 메서드 영역과 HotSpot의 Metaspace는 다른 개념이다

JVMS의 **메서드 영역(method area)**은 논리적인 런타임 영역입니다. HotSpot의 **Metaspace**는 클래스 메타데이터를 네이티브 메모리에서 관리하는 구체적인 구현입니다.

```text
JVMS 명세
메서드 영역

HotSpot 구현
Metaspace 등에서 클래스 메타데이터 관리
```

따라서 `method area = metaspace`라고 두 용어를 같은 개념처럼 쓰면 명세와 구현을 혼동하게 됩니다.

### 힙에 객체를 둔다는 추상 모델과 실제 할당 최적화를 구분한다

JVMS는 객체와 배열을 힙에서 관리하는 추상 모델을 정의합니다. JVM 구현은 관찰 가능한 동작을 보존하면서 escape analysis나 scalar replacement 같은 최적화를 적용할 수 있습니다.

소스에 `new Point()`가 보인다는 이유만으로 성능 분석에서 "독립된 힙 객체가 반드시 하나 할당됐다"고 결론 내리면 안 됩니다.

### 오류 이름은 실제로 부족한 런타임 자원을 기준으로 해석한다

재귀 호출이 깊어지면 프레임이 계속 쌓여 `StackOverflowError`가 발생할 수 있습니다. 반면 `OutOfMemoryError`가 항상 Java 힙 부족을 뜻하는 것은 아닙니다. 힙, 클래스 메타데이터, 네이티브 메모리, 스레드 자원 등 실제로 부족한 곳에 따라 원인이 달라집니다.

JVM 메모리 문제를 볼 때는 소스 변수의 종류를 특정 물리 주소와 일대일로 대응시키지 말고, **JVMS의 추상 영역 → 현재 JVM 구현 → 실제 진단 근거** 순서로 확인하세요. 이 층위를 지키는 것이 JVM 메모리 모델을 이해하는 핵심입니다.
