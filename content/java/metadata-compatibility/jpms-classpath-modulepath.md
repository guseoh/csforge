---
kind: concept
contentKey: java.core.metadata-compatibility.jpms-classpath-modulepath
topicContentKey: java.core.metadata-compatibility
slug: jpms-classpath-modulepath
title: "JPMS, classpath, and module path"
summary: "classpath와 module path의 차이, named/unnamed module, requires/exports의 기본 의미를 이해하고 Java module system이 접근성과 dependency를 어떻게 명시하는지 설명한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html"
    title: "Java SE 25 JLS Chapter 7: Packages and Modules"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: module declaration과 package/module 관계 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Module.html"
    title: "Java SE 25 API: Module"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: named·unnamed module runtime metadata 확인
---
# JPMS·classpath·module path

## 쉬운 진입

classpath는 class와 jar를 찾는 전통적인 검색 경계이고, module path는 module-info.class가
선언한 module 이름과 dependency를 함께 사용한다. JPMS는 “어떤 package를 외부에
export하는가”를 dependency와 accessibility의 일부로 명시한다.

## 정확한 메커니즘

~~~
module app {
    requires library;
}

module library {
    exports com.example.api;
}
~~~

named module은 module-info.java로 name, requires, exports 등을 선언한다. requires는
module dependency를 표현하고 exports는 다른 module이 접근 가능한 package 경계를
표현한다. module path에 없는 일반 classpath class는 unnamed module에 속할 수 있으며,
named module과 동일한 강한 명시 경계를 갖는다고 가정하지 않는다.

public class라도 package가 export되지 않거나 module readability/access 규칙이 맞지
않으면 다른 module에서 접근할 수 없다. reflection의 setAccessible도 JPMS의 access
boundary와 독립된 만능 우회가 아니다. 모든 jar를 module-info로 즉시 바꾸는 것보다
현재 dependency graph와 migration 목표에 맞춰 classpath/module path를 선택한다.

## 흔한 오해

- public class라는 이유만으로 모든 module에서 접근 가능한 것은 아니다.
- classpath와 module path는 단순히 directory 이름만 다른 동일한 resolution model이 아니다.
- requires가 package를 외부에 공개하는 exports까지 대신하지 않는다.
