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

> **이 노트에서 잡을 것** — 같은 `int value`라도 **필드인지, 매개변수인지, 지역 변수인지**에 따라 초기화와 사용 가능 범위가 달라집니다. 특히 지역 변수는 읽기 전에 모든 가능한 실행 경로에서 값이 할당되었다는 것을 컴파일러가 확인할 수 있어야 합니다.

## 먼저 변수의 종류부터 구분하기

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

| 종류 | 어디에 속하는가 | 초기값 | 대표 수명/범위 |
| --- | --- | --- | --- |
| 인스턴스 필드 | 객체 상태 | 타입 기본값 | 객체와 함께 존재 |
| static 필드 | 클래스 상태 | 타입 기본값 | 클래스 초기화 이후 |
| 매개변수 | 메서드 호출 | 호출자가 넘긴 값 | 메서드 실행 범위 |
| 지역 변수 | 현재 실행 블록 | 자동 기본값 없음 | 선언된 블록 범위 |

필드는 객체나 클래스 상태의 일부이므로 초기화 과정에서 `0`, `false`, `null` 같은 타입 기본값을 받습니다. 반면 지역 변수는 자동으로 기본값을 채우지 않습니다.

```java
void print() {
    int count;
    System.out.println(count); // 컴파일 오류
}
```

## 확정 할당은 “실제로 값이 들어갈 것 같다”가 아니다

Java 컴파일러는 지역 변수를 읽는 지점까지 오는 **모든 허용된 제어 흐름**에서 값이 할당되었는지 검사합니다. 이를 definite assignment, 즉 확정 할당 규칙이라고 합니다.

```java
int result;
if (score >= 60) {
    result = 1;
} else {
    result = 0;
}
System.out.println(result); // 허용
```

흐름으로 보면 두 경로 모두 `println`에 도달하기 전에 `result`를 정합니다.

```text
            score >= 60 ?
              /      \
           yes        no
            |          |
       result=1    result=0
              \      /
            println(result)
```

반대로 다음 코드는 `score < 60` 경로에서 값이 없습니다.

```java
int result;
if (score >= 60) {
    result = 1;
}
System.out.println(result); // 컴파일 오류
```

컴파일러가 런타임 값을 예측하는 것이 아니라 **언어가 정한 흐름 분석 규칙**으로 안전한 사용을 확인한다는 점이 중요합니다.

## scope는 “이 이름을 어디에서 쓸 수 있는가”다

```java
if (ready) {
    int value = 10;
    System.out.println(value);
}

// System.out.println(value); // scope 밖
```

`value`라는 이름은 `if` 블록 안에서만 사용할 수 있습니다. scope와 객체 수명은 같은 개념이 아닙니다. 참조형 지역 변수가 scope를 벗어났다고 해서 그 변수가 가리키던 객체가 즉시 사라진다고 단정할 수도 없습니다. 객체의 생존 여부는 다른 참조와 GC reachability 문제입니다.

## 같은 이름이어도 같은 변수가 아니다

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

두 `value`는 이름만 같고 서로 다른 변수입니다. 호출 시 `10`이라는 값이 매개변수로 복사됩니다. 이 예제는 다음 Concept인 pass-by-value와 바로 연결됩니다.

## `final` 지역 변수도 흐름 분석을 받는다

```java
final int statusCode;
if (ok) {
    statusCode = 200;
} else {
    statusCode = 400;
}
System.out.println(statusCode);
```

각 실행 경로에서 정확히 한 번 값이 정해지므로 허용됩니다. `final`은 “선언과 동시에 반드시 대입”이라는 규칙이 아니라, 해당 변수에 대해 언어가 허용하는 범위 안에서 **한 번 정해진 뒤 재대입되지 않도록** 제한합니다.

## 코드를 읽을 때의 체크 순서

변수 문제가 나오면 다음 순서로 보면 빠릅니다.

1. 이 이름은 필드, 매개변수, 지역 변수 중 무엇인가?
2. 현재 코드 위치가 그 변수의 scope 안인가?
3. 지역 변수라면 이 지점까지 오는 모든 경로에서 값이 할당되었는가?
4. 같은 이름의 다른 변수를 보고 있지는 않은가?

## 스스로 확인하기

다음 코드는 컴파일될까요?

```java
int value;
boolean ready = args.length > 0;
if (ready) {
    value = 10;
}
if (!ready) {
    value = 20;
}
System.out.println(value);
```

사람이 보기에는 둘 중 하나의 `if`가 실행될 것 같지만, **컴파일러의 definite assignment 규칙이 두 독립된 `if`를 어떻게 분석하는지**를 기준으로 판단해 보세요. 이 질문은 “실행 결과를 예상하는 것”과 “언어가 정적으로 보장하는 것”을 구분하는 연습입니다.
