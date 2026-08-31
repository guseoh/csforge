---
kind: concept
contentKey: java.core.jvm-runtime.jvm-runtime-data-areas-frames
topicContentKey: java.core.jvm-runtime
slug: jvm-runtime-data-areas-frames
title: "JVM runtime data areas and frames"
summary: "JVM stack, frame, local variable array, operand stack, heap, method area, runtime constant pool을 JVMS의 abstract data area로 이해한다"
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html"
    title: "Java SE 25 JVMS Chapter 2: The Structure of the JVM"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: stack·heap·method area·runtime constant pool 추상 영역 확인
---
# JVM runtime data areas와 frame

## 쉬운 진입

method를 호출하면 현재 실행 context가 필요하고, 새 method가 끝나면 caller로 돌아갈
정보가 필요하다. JVMS는 이를 frame과 JVM stack으로 설명하고, 객체와 class-level
구조를 heap·method area 같은 runtime data area로 구분한다.

## 정확한 메커니즘

~~~
각 thread: JVM stack -> [frame: locals, operand stack, return info]
공유 영역: heap, method area, runtime constant pool
~~~

frame은 method invocation마다 만들어지고 해당 method가 완료되면 사라진다. local
variable array에는 매개변수와 지역 값이, operand stack에는 bytecode 계산의 중간 값이
놓인다. 객체는 heap에 생성되고 class의 runtime constant pool은 method area의 논리적
구조와 연결된다.

이 이름들은 JVMS의 abstract runtime data areas다. 특정 Java local variable이 반드시
OS stack의 한 주소에 존재한다거나, JIT가 그것을 항상 heap/stack 한 곳에 남긴다고
말할 수 없다. HotSpot은 escape analysis와 최적화로 관찰 가능한 구현을 바꿀 수 있다.
StackOverflowError, OutOfMemoryError 같은 증상을 이해할 때도 먼저 추상 영역과 실제
JVM diagnostic를 분리한다.

## 흔한 오해

- 모든 Java 객체가 JVM stack에 저장된다고 할 수 없다.
- local variable이라는 source 개념이 특정 물리 메모리 영역을 보장하지 않는다.
- method area와 Java source의 static field 저장 위치를 단순히 일대일 대응시키지 않는다.
