---
kind: concept
contentKey: java.core.language-types.variables-scope-lifetime
topicContentKey: java.core.language-types
slug: variables-scope-lifetime
title: 변수, 스코프, 수명과 definite assignment
summary: 지역 변수·필드·매개변수의 사용 범위와 초기화 규칙을 구분한다
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html"
    title: "Java Language Specification 6장: Names, Scopes, and Declarations"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 이름의 스코프와 선언 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html"
    title: "Java Language Specification 16장: Definite Assignment"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 지역 변수의 definite assignment 규칙 확인
---
# 변수, 스코프, 수명

스코프(scope)는 이름을 소스 코드에서 어디까지 사용할 수 있는지를 말합니다. 블록 안에서 선언한 지역 변수는 그 블록 안에서만 이름으로 참조할 수 있고, 메서드 매개변수는 메서드 본문과 중첩 블록에서 사용할 수 있습니다. 필드는 객체의 상태로서 선언된 접근 제한자와 객체 참조를 통해 접근 가능한 범위가 결정됩니다.

```java
void printTwice(boolean enabled) {
    if (enabled) {
        int count = 2;
        System.out.println(count);
    }
    // count는 이 지점의 스코프에 없다.
}
```

## 초기화와 수명은 다른 문제다

지역 변수는 컴파일러가 모든 실행 경로에서 값이 먼저 할당되었음을 증명해야 사용할 수 있습니다. 다음 코드는 `enabled`가 거짓일 때 `count`가 초기화되지 않으므로 컴파일되지 않습니다.

```java
int count;
if (enabled) {
    count = 2;
}
System.out.println(count); // definite assignment 위반
```

반면 필드는 선언 시점의 기본값을 가집니다. 참조 필드는 `null`, 숫자형 필드는 0, `boolean` 필드는 `false`입니다. 이것은 지역 변수에 자동으로 적용되는 규칙이 아닙니다.

수명(lifetime)은 값이나 객체가 논리적으로 존재하는 기간입니다. 지역 변수의 스코프와 객체의 수명, 실제 메모리 영역은 같은 개념이 아닙니다. 객체는 더 이상 도달할 수 없을 때 GC 대상이 되고, 컴파일러가 변수의 실제 저장 위치를 최적화할 수도 있습니다.
