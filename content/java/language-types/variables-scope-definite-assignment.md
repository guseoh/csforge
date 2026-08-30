---
kind: concept
contentKey: java.core.language-types.variables-scope-definite-assignment
topicContentKey: java.core.language-types
slug: variables-scope-definite-assignment
title: "변수, scope와 definite assignment"
summary: "필드와 지역 변수의 초기화 규칙 및 변수가 사용 가능한 범위를 구분한다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html"
    title: "Java Language Specification 6장: Names"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: scope와 이름이 유효한 영역 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html"
    title: "Java Language Specification 16장: Definite Assignment"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 지역 변수 definite assignment의 컴파일 규칙 확인
---
# 변수, scope와 definite assignment

## 쉬운 진입

메서드 안에서 선언한 지역 변수는 선언되었다는 이유만으로 어디서나 쓸 수 없다. Java 컴파일러는
실행 경로를 따라갔을 때 값이 반드시 대입되어 있는지 확인한다. 반면 객체의 필드는 객체 생성
과정에서 기본값을 받기 때문에 같은 코드처럼 보여도 규칙이 다르다.

## 정확한 메커니즘

`scope`는 이름을 직접 사용할 수 있는 소스 코드 영역이다. 지역 변수는 선언된 블록 안에서만
이름을 쓸 수 있고, 필드는 멤버 접근 규칙에 따른다. `definite assignment`는 특히 지역 변수와
`final` 변수에서 모든 가능한 흐름이 사용 전에 값을 대입했는지를 컴파일러가 보장하는 규칙이다.

```java
class Sample {
    int field; // 인스턴스 생성 시 int 기본값 0

    void print(boolean enabled) {
        int local;
        if (enabled) {
            local = 1;
        }
        System.out.println(local); // 컴파일 오류: false 경로에서 미대입
    }
}
```

조건문 양쪽에서 대입하거나 선언과 동시에 초기화하면 컴파일러가 모든 경로를 증명할 수 있다.
매개변수는 호출 시 값이 전달되므로 메서드 본문에서 이미 대입된 상태로 시작한다. scope와
수명(lifetime)은 관련 있지만 동일한 말은 아니다. 실제 객체가 언제 회수되는지는 이 규칙만으로
결정되지 않는다.

## 실전·면접 연결

조건 분기에서 지역 변수를 나중에 채우는 코드는 `else` 누락과 초기화 오류를 드러내기 쉽다.
가능하면 유효한 기본값이나 조기 반환을 사용하되, 의미 없는 기본값으로 오류를 숨기지는 않는다.
필드의 기본값에 기대는 코드도 생성 시점에 필요한 상태를 명시적으로 만드는 편이 불변식과 리뷰에
유리하다.

## 흔한 오해

- 지역 변수는 필드처럼 자동으로 `0`, `false`, `null`이 되지 않는다.
- scope가 끝났다고 객체의 메모리가 즉시 해제된다는 뜻은 아니다.
- 컴파일러가 한 실행 경로의 대입을 다른 모든 경로의 대입으로 추론해 주지는 않는다.
