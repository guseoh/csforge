---
kind: concept
contentKey: java.core.language-types.stringbuilder-mutable-text
topicContentKey: java.core.language-types
slug: stringbuilder-mutable-text
title: "StringBuilder와 반복 문자열 조립"
summary: "String의 불변성과 StringBuilder의 가변 문자 시퀀스를 비교하고 반복 조립에서 적절한 사용 범위를 판단한다"
level: 1
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StringBuilder.html"
    title: "Java SE 25 API: StringBuilder"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: StringBuilder가 가변 문자 시퀀스라는 API 계약 확인
---
# StringBuilder와 반복 문자열 조립

`String`은 불변 객체이기 때문에 문자열 내용을 직접 바꾸지 않습니다. 간단한 문자열 몇 개를 `+`로 연결하는 코드는 읽기 쉽고 충분히 좋은 경우가 많지만, 반복문에서 문자열을 계속 누적해야 한다면 **하나의 가변 문자 저장 공간을 이용해 조립하는 방식**이 더 자연스러울 수 있습니다. 그 역할을 하는 대표적인 타입이 `StringBuilder`입니다.

### 왜 반복 `+`가 문제가 될 수 있을까

```java
String result = "";
for (int i = 0; i < 10_000; i++) {
    result = result + i + ',';
}
```

`String`은 불변이므로 `result`의 기존 문자열 내용을 제자리에서 늘리는 방식으로 생각하면 안 됩니다. 문자열 연결 표현식은 컴파일러와 런타임이 최적화할 수 있지만, 반복적으로 이전 결과에 새 내용을 붙이는 패턴에서는 중간 문자열과 복사 비용이 커질 수 있습니다.

따라서 “`+`는 무조건 느리다”가 아니라 **반복적으로 누적하는 구조인지**가 중요한 판단 기준입니다.

### StringBuilder는 내용을 계속 추가할 수 있다

```java
StringBuilder builder = new StringBuilder();
for (int i = 0; i < 10_000; i++) {
    builder.append(i).append(',');
}
String result = builder.toString();
```

`StringBuilder`는 가변적인 문자 시퀀스를 제공합니다. `append`를 호출할 때마다 같은 builder에 내용을 쌓고, 마지막에 `toString()`으로 `String` 결과를 얻습니다.

개념적으로는 다음 흐름입니다.

```text
StringBuilder
"" → "0," → "0,1," → "0,1,2," → ...
                                  │
                                  └─ 마지막에 toString()
```

내부 저장 공간의 정확한 크기 증가 방식 같은 세부는 JDK 구현에 속합니다. 학습의 핵심은 **StringBuilder가 변경 가능한 문자 시퀀스를 제공해 반복 조립을 표현한다**는 API 계약입니다.

### 그렇다고 모든 문자열 연결을 바꿀 필요는 없다

```java
String message = "member=" + memberId + ", status=" + status;
```

이 정도의 한 번짜리 표현은 `+`가 훨씬 읽기 쉽습니다. Java 컴파일러와 런타임도 문자열 연결을 최적화할 수 있으므로, 단순 연결까지 무조건 수동 `StringBuilder`로 바꾸는 것은 불필요합니다.

`StringBuilder`가 특히 적합한 경우는 다음과 같습니다.

- 반복문에서 결과를 계속 누적할 때
- 조건에 따라 여러 조각을 순서대로 붙일 때
- 코딩테스트에서 많은 출력 문자열을 한 번에 만들 때

### thread-safe한 문자열 조립과는 별도 문제다

`StringBuilder`는 여러 스레드가 동시에 같은 인스턴스를 변경하도록 설계된 동기화 타입이 아닙니다. 일반적으로 메서드 내부의 지역 변수처럼 한 실행 흐름에서만 사용하면 문제가 없습니다.

여러 스레드가 같은 가변 문자열 객체를 공유해야 한다면 동시성 자체를 다시 설계해야 합니다. 단순히 `StringBuffer`로 바꾸는 것이 전체 작업의 원자성이나 올바른 설계를 자동으로 보장하지는 않습니다.

### 실무에서의 판단 기준

문자열 성능 문제를 볼 때는 문법만 보고 판단하지 않습니다. 반복 횟수, 생성되는 데이터 크기, 실제 프로파일링 결과를 함께 봅니다. 일반 비즈니스 코드의 짧은 문자열은 가독성을 우선하고, 대량 조립이 명확한 곳에서 `StringBuilder`를 선택하면 됩니다.

문제를 풀 때는 `StringBuilder`의 `append`가 원본 builder를 변경한다는 점과 `String` 메서드가 새 문자열을 반환하는 경우가 많다는 차이를 구분하면 됩니다.
