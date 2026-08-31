---
kind: concept
contentKey: java.core.jvm-runtime.classloader-delegation-type-identity
topicContentKey: java.core.jvm-runtime
slug: classloader-delegation-type-identity
title: "ClassLoader delegation and type identity"
summary: "defining ClassLoader와 delegation을 이해하고 같은 binary name이라도 다른 loader가 정의하면 다른 runtime type이 될 수 있음을 설명한다"
level: 3
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ClassLoader.html"
    title: "Java SE 25 API: ClassLoader"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: loading·parent delegation·defining loader 확인
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-5.html#jvms-5.3"
    title: "Java SE 25 JVMS: Creation and Loading"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: binary name과 defining loader의 type identity 확인
---
# ClassLoader delegation과 runtime type identity

## 쉬운 진입

plugin jar에 com.example.Service라는 class가 있고 애플리케이션에도 같은 binary name이
있을 수 있다. 이름 문자열만 같다고 JVM이 같은 type으로 취급하지 않는다. 어떤
ClassLoader가 실제로 class를 정의했는지가 runtime identity의 일부다.

## 정확한 메커니즘

~~~
request ClassLoader
        |
        +-- parent에게 먼저 load 요청하는 delegation
        |
        +-- 찾지 못하면 자신의 namespace에서 define
~~~

ClassLoader의 loadClass와 parent 관계는 이미 로드된 class 재사용과 namespace 경계를
만든다. 동일한 binary name을 서로 다른 defining loader가 정의하면 두 Class 객체는
서로 다른 runtime type이므로, 한 loader가 만든 객체를 다른 loader의 타입으로 cast할
때 ClassCastException이 발생할 수 있다. parent delegation은 platform class의 중복
정의를 줄이는 일반적인 구조지만, custom loader의 구체적인 순서는 그 구현과 계약을
확인한다.

Class의 getClassLoader와 loader equality를 진단에 활용할 수 있다. context class loader,
module layer, plugin lifecycle은 애플리케이션/JPMS 설계와 연결되지만, “같은 이름이면
항상 같은 class”라는 결론은 Java runtime model에 맞지 않는다.

## 흔한 오해

- package와 binary name만 같다고 Class identity가 같아지지 않는다.
- ClassLoader가 모든 class를 반드시 bootstrap loader 하나에 위임한다는 뜻은 아니다.
- Class 객체의 이름을 비교하는 것과 runtime cast 가능성을 확인하는 것은 같은 검사가 아니다.
