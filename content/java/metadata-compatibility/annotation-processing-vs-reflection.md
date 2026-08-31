---
kind: concept
contentKey: java.core.metadata-compatibility.annotation-processing-vs-reflection
topicContentKey: java.core.metadata-compatibility
slug: annotation-processing-vs-reflection
title: "Annotation processing versus reflection"
summary: "compile-time annotation processing/code generation과 runtime reflection을 실행 시점과 결과물 관점에서 구분한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.compiler/javax/annotation/processing/package-summary.html"
    title: "Java SE 25 API: javax.annotation.processing"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: compile-time annotation processing API 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/package-summary.html"
    title: "Java SE 25 API: java.lang.reflect"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: runtime reflection phase와 결과 확인
---
# Annotation processing과 reflection

## 쉬운 진입

annotation을 읽는 시점은 두 가지로 나뉜다. compiler가 source를 처리하는 동안 새
source/class를 생성하는 annotation processing과, 프로그램이 실행된 뒤 loaded class의
metadata를 읽는 reflection이다. 같은 annotation을 보더라도 phase와 산출물이 다르다.

## 정확한 메커니즘

~~~
source + annotation
        |
        +-- compiler phase: processor -> generated source/class
        |
        +-- runtime phase: loaded Class -> reflection inspection
~~~

annotation processor는 compile round에서 source model과 annotation mirror를 보고
검증·code generation을 수행한다. 결과는 build artifact가 되어 runtime에 별도
reflection이 없어도 호출될 수 있다. reflection은 이미 로드된 Class, Method, Field를
조회하고 실행 중 조건에 따라 동작하므로 startup 비용과 access/type safety trade-off가
있다.

SOURCE retention은 compile-time processor에는 의미가 있을 수 있지만 runtime reflection
대상은 아니다. 반대로 runtime framework가 읽을 metadata와 compile-time generator가
만드는 generated type을 같은 lifecycle로 착각하지 않는다. 어떤 도구가 processor인지
reflection인지보다 실제 phase와 생성된 artifact를 확인한다.

## 흔한 오해

- annotation processor가 runtime에 항상 실행되는 것은 아니다.
- reflection이 compile-time code generation을 대신해 이미 생성된 class를 만들어 주는 API는 아니다.
- RUNTIME retention이라고 annotation processor가 반드시 필요한 것은 아니다.
