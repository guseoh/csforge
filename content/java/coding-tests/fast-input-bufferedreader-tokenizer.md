---
kind: concept
contentKey: java.core.coding-tests.fast-input-bufferedreader-tokenizer
topicContentKey: java.core.coding-tests
slug: fast-input-bufferedreader-tokenizer
title: "Fast input with BufferedReader and tokenization"
summary: "코딩테스트 입력을 줄과 token 단위로 나누어 읽고 숫자 범위·EOF·입력 형식을 안전하게 처리한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/BufferedReader.html"
    title: "Java SE 25 API: BufferedReader"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: readLine과 buffering 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/StringTokenizer.html"
    title: "Java SE 25 API: StringTokenizer"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: delimiter 기반 token 순회 API 확인
---
# BufferedReader 입력과 tokenization

코딩테스트 문제를 틀리는 이유가 알고리즘이 아니라 입력 처리인 경우가 생각보다 많습니다. 입력은 보통 "첫 줄에 N, 다음 줄에 N개의 정수"처럼 명확한 형식을 가지고 있으므로, Java 코드도 **줄을 읽는 단계와 그 줄을 값으로 나누는 단계**를 구분하면 실수가 줄어듭니다.

`BufferedReader`와 `StringTokenizer` 조합은 이 흐름을 간단하게 구현하는 대표적인 방법입니다.

### 먼저 한 줄을 읽고, 그다음 token으로 나눈다

```java
BufferedReader reader = new BufferedReader(
        new InputStreamReader(System.in)
);

int n = Integer.parseInt(reader.readLine());
StringTokenizer st = new StringTokenizer(reader.readLine());

long sum = 0;
for (int i = 0; i < n; i++) {
    sum += Long.parseLong(st.nextToken());
}
```

`readLine()`은 줄 끝 문자를 제외한 문자열을 반환합니다. `StringTokenizer`는 그 문자열을 delimiter 기준으로 나누어 token을 하나씩 제공합니다.

```text
입력 한 줄
"10 20 30"
     │
     ▼
StringTokenizer
     │
     ├─ "10"
     ├─ "20"
     └─ "30"
           │
           ▼
Integer.parseInt / Long.parseLong
```

### token은 아직 숫자가 아니라 문자열이다

`nextToken()`이 돌려주는 값은 `String`입니다. 실제 정수 계산에 사용하려면 숫자 타입으로 변환해야 합니다.

```java
int value = Integer.parseInt(st.nextToken());
long large = Long.parseLong(st.nextToken());
```

문제의 값 범위를 먼저 보고 `int`와 `long`을 결정합니다. 입력 하나는 `int` 범위여도 합계나 곱셈 결과가 `int`를 넘을 수 있습니다.

```java
long sum = 0;
for (int i = 0; i < n; i++) {
    sum += Integer.parseInt(st.nextToken());
}
```

이처럼 **입력 값의 범위와 계산 결과의 범위를 따로 확인**하는 것이 중요합니다.

### 한 줄에 token이 모두 있다는 가정을 확인한다

문제에서 "두 번째 줄에 N개의 정수"라고 보장하면 위 코드가 자연스럽습니다. 하지만 "공백으로 구분된 N개의 정수"라고만 하고 줄 경계를 보장하지 않는 입력이라면 한 줄만 읽은 tokenizer로는 부족할 수 있습니다.

```text
예상
10 20 30 40

실제 입력 형식이 허용할 수 있는 형태
10 20
30 40
```

이런 경우에는 token이 떨어지면 다음 줄을 읽는 helper를 만들거나 byte 기반 scanner를 구현하는 방식 등을 선택할 수 있습니다. 중요한 것은 "빠른 입력은 무조건 특정 템플릿"이 아니라 **문제의 입력 계약에 맞는 파서를 만드는 것**입니다.

### EOF와 빈 줄도 계약을 보고 판단한다

`readLine()`은 EOF에 도달하면 `null`을 반환합니다. 온라인 저지의 정상 입력에서는 문제 설명이 필요한 줄 수를 보장하는 경우가 많아 매번 null 처리를 길게 작성할 필요는 없습니다. 하지만 직접 scanner helper를 만들거나 EOF까지 읽는 문제라면 이 동작을 알아야 합니다.

```java
String line;
while ((line = reader.readLine()) != null) {
    // 처리
}
```

빈 문자열 `""`과 EOF의 `null`은 다른 상태입니다.

### 왜 Scanner보다 BufferedReader를 자주 사용할까

`Scanner`는 사용하기 편하고 token parsing 기능도 제공하지만 더 많은 parsing 기능과 검사 로직을 포함합니다. 입력량이 큰 코딩테스트에서는 `BufferedReader`와 단순 parsing 조합이 더 직접적인 선택이 되는 경우가 많습니다.

다만 이것을 "Scanner는 절대 쓰면 안 된다"는 규칙으로 외울 필요는 없습니다. 입력량이 작고 제한이 넉넉한 문제에서는 가독성이 더 중요할 수 있습니다. 실제 제한과 구현 복잡도를 보고 선택합니다.

### 입력 처리 코드도 문제 풀이 상태의 일부다

다음과 같은 실수를 문제 풀이 전에 확인하면 좋습니다.

- 음수를 받을 수 있는데 숫자 파서를 직접 만들며 `-`를 처리하지 않음
- 값은 int지만 합계는 long이 필요한데 int에 누적
- 한 tokenizer에 다음 줄의 token까지 있다고 가정
- `readLine()` 결과에 불필요한 `trim()`을 적용해 입력 의미를 바꿈
- 공백이 여러 개일 수 있는 형식에서 직접 `split(" ")`를 잘못 사용

`StringTokenizer`는 기본적으로 연속된 whitespace를 구분자로 다루기 때문에 숫자 입력에서 편리합니다.

### 문제를 풀 때 확인할 것

1. 입력이 줄 단위로 무엇을 보장하는지 읽습니다.
2. 각 token을 어떤 숫자 타입으로 변환할지 확인합니다.
3. 계산 결과 범위까지 `int`/`long`을 검토합니다.
4. token 수가 한 줄을 넘을 수 있는지 봅니다.
5. EOF까지 읽는 문제인지 정해진 줄만 읽는 문제인지 구분합니다.

### 면접이나 코드 리뷰에서 설명한다면

`BufferedReader`는 문자 입력을 buffering하고 `readLine()`으로 줄을 읽습니다. `StringTokenizer`는 한 줄을 공백 등의 delimiter로 나누어 token을 순서대로 꺼내는 데 사용할 수 있습니다. 코딩테스트에서는 입력 형식과 값 범위를 먼저 확인하고, token이 여러 줄에 걸칠 수 있는지와 `int`/`long` overflow 가능성까지 함께 보는 것이 중요합니다.
