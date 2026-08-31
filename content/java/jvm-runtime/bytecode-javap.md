---
kind: concept
contentKey: java.core.jvm-runtime.bytecode-javap
topicContentKey: java.core.jvm-runtime
slug: bytecode-javap
title: "Bytecode and javap"
summary: "간단한 javap 출력과 bytecode를 읽어 source construct가 JVM instruction과 어떻게 연결되는지 이해하되 instruction set 암기를 목표로 하지 않는다"
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
# Bytecode와 javap

## 쉬운 진입

“이 source가 runtime에서 무엇을 하는가?”가 헷갈릴 때 class file을 직접 열어 보면
method와 field 참조, branch, local variable 흐름을 확인할 수 있다. javap는 class를
사람이 읽을 수 있는 형태로 출력하는 진단 도구다.

## 정확한 메커니즘

~~~
public int add(int a, int b) {
    return a + b;
}
~~~

위 class를 javac로 만든 뒤 javap -c Example을 실행하면 add method의 Code attribute와
정수 load/add/return에 대응하는 JVM instruction을 볼 수 있다. javap -v는 constant
pool과 flags 같은 더 많은 class file 정보를 출력한다. 출력은 javac 옵션, debug
attribute, compiler version에 따라 달라질 수 있으므로 특정 instruction 번호를 Java
language의 장기 보장으로 암기하지 않는다.

bytecode를 읽을 때는 먼저 “어떤 method/field를 호출하는가”, “값이 operand stack을
어떻게 거치는가”, “예외/branch가 어디로 가는가”를 찾는다. javap는 실행 프로파일이나
현재 HotSpot의 JIT native code를 직접 보여 주는 도구가 아니다.

## 흔한 오해

- javap 출력의 instruction 순서가 source 줄과 항상 일대일 대응하지 않는다.
- bytecode를 읽는 것만으로 JIT가 생성한 최종 native code를 확정할 수 없다.
- 모든 class file이 소스 파일의 line/debug metadata를 반드시 포함하는 것은 아니다.
