---
kind: concept
contentKey: java.core.language-types.variables-scope-definite-assignment
topicContentKey: java.core.language-types
slug: variables-scope-definite-assignment
title: "변수, 범위와 확정 할당"
summary: "필드·지역 변수·매개변수의 차이와 변수를 사용할 수 있는 범위, 지역 변수의 확정 할당 규칙을 이해한다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12"
    title: "JLS 4.12 Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 변수 종류와 초기값 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html"
    title: "JLS 16 Definite Assignment"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 지역 변수를 사용하기 전 값이 확실히 할당되어야 하는 규칙 확인
---
# 변수, 범위와 확정 할당

Java에서는 모두 `int age`처럼 보이는 변수라도 **어디에 선언되었는지에 따라 초기화 규칙과 사용할 수 있는 범위가 다릅니다.** 특히 필드는 기본값을 받지만 지역 변수는 그렇지 않다는 차이를 정확히 알아야 합니다.

### 같은 타입이라도 변수의 종류가 다르다

```java
class Member {
    int age;                    // 인스턴스 필드
    static int totalCount;      // static 필드

    void update(int newAge) {   // 매개변수
        int oldAge = age;       // 지역 변수
        age = newAge;
    }
}
```

`age`와 `totalCount`는 객체 또는 클래스의 상태를 이루는 **필드**입니다. `newAge`는 메서드를 호출할 때 전달받는 **매개변수**, `oldAge`는 메서드 실행 중에만 사용하는 **지역 변수**입니다.

필드는 객체나 클래스가 만들어질 때 타입에 맞는 기본값을 받습니다. 숫자 타입은 `0`, `boolean`은 `false`, 참조 타입은 `null`입니다.

반면 지역 변수는 자동으로 기본값을 넣어 주지 않습니다.

```java
void print() {
    int count;
    System.out.println(count); // 컴파일 오류
}
```

### 왜 지역 변수는 자동 초기화하지 않을까

지역 변수는 개발자가 지금 실행 경로에서 어떤 값을 사용하려는지 코드로 분명하게 만들 수 있습니다. Java 컴파일러는 지역 변수를 읽는 지점에 도달했을 때 **그 전에 값이 반드시 할당되었다고 확신할 수 있는지** 검사합니다. 이것을 **확정 할당(definite assignment)** 규칙이라고 합니다.

```java
int result;
if (score >= 60) {
    result = 1;
} else {
    result = 0;
}
System.out.println(result); // 모든 경로에서 값이 정해지므로 허용
```

반대로 다음 코드는 `score < 60`일 때 `result`에 값이 없을 수 있습니다.

```java
int result;
if (score >= 60) {
    result = 1;
}
System.out.println(result); // 컴파일 오류
```

중요한 점은 컴파일러가 실제 실행 결과를 미리 알아맞히는 것이 아니라 **언어가 정한 흐름 분석 규칙으로 모든 가능한 경로를 검사한다**는 것입니다.

### 범위는 변수가 보이는 영역이다

변수의 **범위(scope)** 는 소스 코드에서 그 이름을 사용할 수 있는 영역입니다.

```java
if (ready) {
    int value = 10;
    System.out.println(value);
}

// System.out.println(value); // 범위를 벗어나서 사용할 수 없음
```

범위를 작게 유지하면 변수의 의미를 추적하기 쉬워집니다. 메서드 전체에서 필요하지 않은 값을 메서드 시작 부분에 미리 선언하기보다 실제 사용하는 곳 가까이 두는 편이 읽기 좋습니다.

### 같은 이름을 사용해도 같은 변수는 아니다

매개변수나 지역 변수는 다른 메서드의 같은 이름 변수와 별개입니다.

```java
static void mainLogic() {
    int value = 10;
    change(value);
    System.out.println(value); // 10
}

static void change(int value) {
    value = 20;
}
```

두 `value`는 서로 다른 변수입니다. `change`의 매개변수에 `10`이라는 값이 복사되고, 그 매개변수에 `20`을 다시 넣은 것이므로 호출한 쪽의 지역 변수는 바뀌지 않습니다.

### 문제를 풀 때 확인할 순서

변수 관련 코드에서는 다음 세 가지를 먼저 확인합니다.

1. 필드인가, 매개변수인가, 지역 변수인가?
2. 지금 위치에서 그 이름을 사용할 수 있는 범위인가?
3. 지역 변수라면 이 실행 경로에서 사용 전에 값이 반드시 할당되는가?

특히 `if`, `switch`, 반복문이 섞이면 “내가 보기에는 값이 들어갈 것 같다”보다 **모든 가능한 경로에서 확정적으로 할당되는가**를 따져야 합니다.
