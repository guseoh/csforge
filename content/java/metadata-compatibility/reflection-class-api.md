---
kind: concept
contentKey: java.core.metadata-compatibility.reflection-class-api
topicContentKey: java.core.metadata-compatibility
slug: reflection-class-api
title: "Reflection and Class API"
summary: "Class와 reflection API로 runtime type, method, field, constructor를 조사하고 access·type safety·performance 경계를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/package-summary.html"
    title: "Java SE 25 API: java.lang.reflect"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: runtime metadata inspection과 access 경계 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Class.html"
    title: "Java SE 25 API: Class"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: runtime type와 member 조회 API 확인
---
# Reflection과 Class API

## 쉬운 진입

일반 코드는 컴파일할 때 호출할 method와 field를 정하지만, plugin·serializer·도구는
실행 중 Class를 보고 member를 찾을 수 있어야 한다. Reflection은 loaded class의
method·field·constructor metadata를 조사하고 필요하면 그 대상을 호출한다.

## 정확한 메커니즘

~~~
Class<?> type = User.class;
Method method = type.getDeclaredMethod("name");
method.setAccessible(true); // access boundary를 무시할 수 있는지는 runtime/module 정책에 따름
Object value = method.invoke(user);
~~~

getMethods와 getDeclaredMethods처럼 상속 포함 여부가 다른 API를 구분하고, invoke의
반환값은 Object이므로 필요한 타입 검증과 예외 처리를 호출자가 맡는다. reflection은
항상 private을 무조건 뚫는 마법이 아니다. Java access check와 JPMS strong encapsulation
경계에서 접근이 거부될 수 있고, setAccessible의 성공 여부와 오류는 현재 runtime
조건을 반영한다.

일반 정적 호출보다 type safety와 최적화 예측이 약하고 이름 문자열 변경에 취약할 수
있다. 따라서 application startup에서 metadata를 검증하고, 안정적인 interface나
method handle/code generation으로 반복 호출 경계를 줄이는 trade-off를 고려한다.
reflection이 캡슐화를 항상 파괴한다고 말하기보다 명시적 runtime access boundary로
이해한다.

## 흔한 오해

- getDeclaredMethod는 상위 class의 method까지 자동으로 모두 반환하지 않는다.
- reflection 호출이 compile-time 타입 검사를 일반 호출과 같은 수준으로 제공하지 않는다.
- setAccessible(true)가 모든 module/access 경계를 언제나 무시하게 해 주지 않는다.
