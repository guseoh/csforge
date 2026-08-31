---
kind: concept
contentKey: java.core.jvm-runtime.class-loading-linking-initialization
topicContentKey: java.core.jvm-runtime
slug: class-loading-linking-initialization
title: "Class loading, linking, and initialization"
summary: "loading, verification, preparation, resolution, initialization 단계를 구분하고 specification boundary에 맞게 class lifecycle을 설명한다"
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-5.html"
    title: "Java SE 25 JVMS Chapter 5: Loading, Linking, and Initializing"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: class lifecycle 단계와 initialization trigger 확인
---
# Class loading·linking·initialization

## 쉬운 진입

class를 처음 보았을 때 JVM은 단순히 파일을 읽고 static block을 바로 실행하는 것이
아니다. type을 찾는 loading, 구조를 확인하는 verification, runtime 구조를 준비하는
preparation, 필요한 참조를 해석하는 resolution, static 초기화인 initialization을
구분해야 한다.

## 정확한 메커니즘

~~~
loading -> linking
             -> verification
             -> preparation (static field의 기본값)
             -> resolution (필요 시 지연 가능)
         -> initialization (<clinit> 의미의 초기화 동작)
~~~

preparation은 static field를 위한 메모리와 기본값을 준비하는 단계다. static field
initializer와 static block이 실행되어 개발자가 쓴 초기화 코드가 효과를 내는 것은
initialization 단계다. constant variable처럼 초기화 trigger가 다른 경우가 있으므로
“class literal을 언급하면 항상 모든 static code가 즉시 실행된다”라고 일반화하지 않는다.

JVMS는 loading/linking의 시점과 구현 세부에 선택 여지를 둔다. initialization은
thread-safe하게 조정되며, 초기화 중 예외가 발생하면 후속 사용에서
NoClassDefFoundError 같은 결과를 관찰할 수 있다. 정확한 trigger와 오류는 해당 JVMS
조항과 Java source construct를 함께 읽는다.

## 흔한 오해

- preparation이 개발자의 static block을 실행하는 단계가 아니다.
- class file을 찾았다고 initialization이 끝난 것은 아니다.
- resolution이 모든 symbolic reference에 대해 항상 eager하게 수행된다고 보장되지 않는다.
