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

같은 `int value`라도 **필드인지, 매개변수인지, 지역 변수인지**에 따라 초기화 규칙과 사용할 수 있는 범위가 달라집니다. 특히 지역 변수는 읽기 전에 값이 확실히 할당되었다는 것을 컴파일러가 확인할 수 있어야 합니다.

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

| 종류 | 어디에 속하는가 | 초기값 | 사용할 수 있는 대표 범위 |
| --- | --- | --- | --- |
| 인스턴스 필드 | 객체 상태 | 타입 기본값 | 객체의 멤버로 접근 가능한 범위 |
| static 필드 | 클래스 상태 | 타입 기본값 | 클래스의 멤버로 접근 가능한 범위 |
| 매개변수 | 메서드 호출 | 호출 시 전달된 값 | 해당 메서드 본문 |
| 지역 변수 | 현재 실행 블록 | 자동 기본값 없음 | 선언된 블록의 유효 범위 |

필드는 객체나 클래스 상태의 일부이므로 초기화 과정에서 `0`, `false`, `null` 같은 타입 기본값을 받습니다. 반면 지역 변수는 선언만 했다고 기본값이 생기지 않습니다.

```java
void print() {
    int count;
    System.out.println(count); // 컴파일 오류
}
```

## 확정 할당은 제어 흐름으로 판단한다

Java는 지역 변수를 읽는 지점에 도달하는 모든 가능한 실행 경로에서 값이 할당되었는지를 정해진 흐름 분석 규칙으로 확인합니다. 이것이 **확정 할당(definite assignment)** 입니다.

```java
int result;
if (score >= 60) {
    result = 1;
} else {
    result = 0;
}
System.out.println(result); // 컴파일 가능
```

두 분기 모두 `println`에 도달하기 전에 `result`를 할당하므로 사용할 수 있습니다.

```text
            score >= 60 ?
              /      \
           yes        no
            |          |
       result=1    result=0
              \      /
            println(result)
```

반대로 한 경로에서 할당이 빠지면 사용할 수 없습니다.

```java
int result;
if (score >= 60) {
    result = 1;
}
System.out.println(result); // 컴파일 오류
```

여기서 중요한 점은 컴파일러가 프로그램을 실제로 실행해 값을 예측하는 것이 아니라, **Java 언어가 정한 보수적인 흐름 분석 규칙**에 따라 할당 여부를 증명한다는 것입니다.

예를 들어 다음 두 조건은 사람이 보면 서로 반대처럼 보이지만, 두 개의 독립된 `if` 문으로 작성하면 확정 할당 규칙이 이를 하나의 `if-else` 분기처럼 결합해 주지 않습니다.

```java
int value;
boolean ready = args.length > 0;

if (ready) {
    value = 10;
}
if (!ready) {
    value = 20;
}

System.out.println(value); // 컴파일 오류
```

값이 반드시 정해진다는 구조를 표현하려면 다음처럼 하나의 분기로 작성할 수 있습니다.

```java
int value;
if (ready) {
    value = 10;
} else {
    value = 20;
}
System.out.println(value); // 컴파일 가능
```

## 범위는 이름을 사용할 수 있는 영역이다

```java
if (ready) {
    int value = 10;
    System.out.println(value);
}

// System.out.println(value); // value의 범위 밖
```

변수의 **범위(scope)** 는 그 이름을 코드 어디에서 사용할 수 있는지를 말합니다. 변수의 범위와 객체의 수명은 같은 개념이 아닙니다. 참조형 지역 변수가 범위를 벗어나도 다른 참조가 같은 객체를 가리키고 있다면 그 객체가 즉시 사라지는 것은 아닙니다. 객체의 생존 여부는 JVM의 GC 도달 가능성과 별개의 문제입니다.

## 같은 이름이어도 같은 변수라는 뜻은 아니다

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

두 `value`는 이름만 같고 서로 다른 변수입니다. 호출 시 `10`이라는 값이 매개변수에 복사됩니다. 이 차이는 다음 Concept인 Java의 값 전달 규칙을 이해할 때 다시 사용됩니다.

`final` 지역 변수 역시 흐름 분석을 받습니다.

```java
final int statusCode;
if (ok) {
    statusCode = 200;
} else {
    statusCode = 400;
}
System.out.println(statusCode);
```

각 실행 경로에서 값이 한 번 정해지고 다시 대입되지 않으므로 허용됩니다. `final`은 선언과 동시에 반드시 값을 넣으라는 뜻이 아니라, 언어가 허용하는 초기화 지점에서 값이 정해진 뒤 다시 대입되지 않도록 제한합니다.

코드를 읽을 때는 먼저 **변수의 종류 → 현재 범위 안인지 → 지역 변수라면 이 지점까지 모든 경로에서 할당되었는지**를 순서대로 확인하면 됩니다.
