---
kind: concept
contentKey: java.core.jvm-runtime.jdk-jvm-classfile
topicContentKey: java.core.jvm-runtime
slug: jdk-jvm-classfile
title: "JDK, JVM, and class files"
summary: "JDK, JVM, class file을 구분하고 source→javac→bytecode→JVM runtime 흐름을 설명한다"
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
    relationNote: source compile 단계 확인
---
# JDK·JVM·class file

## 쉬운 진입

Java source가 바로 CPU가 실행하는 기계어가 되는 것은 아니다. javac가 source를 class
file 형식의 bytecode로 바꾸고, JVM이 그 class file을 읽어 프로그램을 실행한다.
JDK는 컴파일러·실행기·진단 도구와 Java 플랫폼 개발 구성요소를 포함하는 배포물이다.

## 정확한 메커니즘

~~~
Hello.java --javac--> Hello.class --JVM--> 실행
                             |
                    bytecode + metadata
~~~

class file은 JVM이 이해하는 binary format이며 method의 code, constant pool, type
metadata 등을 포함한다. JVM specification은 class file과 실행 모델의 추상 계약을
정의하고, 특정 JVM은 bytecode를 해석하거나 native code로 JIT compile할 수 있다.
따라서 bytecode와 native machine code를 같은 것으로 부르지 않는다.

JDK의 java launcher가 JVM을 시작하고 class path/module path에서 class를 찾게 하지만,
어떤 class loader와 JIT가 사용되는지는 실행 환경 설정과 JVM implementation의 영역이다.
Java language 보장, JVMS 보장, JDK 도구의 동작을 한 문장으로 섞지 않으면 오류를
진단하기 쉽다.

## 흔한 오해

- JDK는 JVM과 같은 하나의 실행 엔진만을 뜻하지 않는다.
- .class 파일은 모든 OS의 native executable이 아니다.
- javac가 모든 method를 실행 전에 native machine code로 완전히 번역한다고 보장되지 않는다.
