---
kind: concept
contentKey: java.core.jvm-runtime.runtime-memory-reachability-gc
topicContentKey: java.core.jvm-runtime
slug: runtime-memory-reachability-gc
title: JVM 메모리 영역과 도달 가능성
summary: 스택·힙 folklore를 넘어 실행 데이터와 GC 판단을 올바르게 설명한다
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html"
    title: "Java Virtual Machine Specification 2장: The Structure of the JVM"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: run-time data areas의 추상 구조 확인
  - url: "https://docs.oracle.com/en/java/javase/25/gctuning/"
    title: Java Platform, Standard Edition Garbage Collection Tuning Guide
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: GC 동작과 튜닝 개념 확인
---
# 메모리 영역과 GC

JVM 명세는 각 스레드의 PC register와 JVM stack, 모든 스레드가 공유하는 heap과 method area 같은 런타임 데이터 영역을 정의합니다. JVM stack에는 프레임과 지역 변수·피연산자 스택 같은 실행 정보가 있고, heap에는 객체와 배열이 저장됩니다. 이는 JVM의 추상 구조이지 모든 구현의 물리 메모리 배치를 그대로 설명하는 그림은 아닙니다.

GC는 객체가 더 이상 GC roots에서 도달할 수 없는지 등을 바탕으로 회수 가능한 객체를 판단합니다. 지역 변수의 소스 코드 스코프가 끝났다는 사실만으로 즉시 회수되는 것은 아니며, 다른 필드·스레드·정적 참조가 남아 있으면 도달 가능합니다. 반대로 논리적으로 더 이상 필요하지 않아도 참조를 오래 보관하면 메모리 사용이 커질 수 있습니다.

GC는 자원 관리의 대체물이 아닙니다. 파일 descriptor, socket, DB connection은 Java heap 객체와 별도의 외부 자원이므로 명시적 close와 소유권 계약이 필요합니다.
