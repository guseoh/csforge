---
kind: concept
contentKey: java.core.coding-tests.fast-input-bufferedreader-tokenizer
topicContentKey: java.core.coding-tests
slug: fast-input-bufferedreader-tokenizer
title: "BufferedReader 입력과 토큰화"
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
    relationNote: delimiter 기반 token 순회 API와 legacy 성격 확인
---
# BufferedReader 입력과 토큰화

코딩테스트에서는 알고리즘이 맞아도 입력 형식을 잘못 읽으면 바로 오답이 됩니다. 입력 처리는 **한 줄을 읽는 단계와 그 줄을 값 단위로 나누는 단계**를 분리해서 생각하면 실수가 줄어듭니다.

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

`readLine()`은 한 줄을 문자열로 읽고, `StringTokenizer`는 그 문자열 안의 token을 순서대로 제공합니다.

```text
"10 20 30"
     │
     ▼
StringTokenizer
 ├─ "10"
 ├─ "20"
 └─ "30"
```

### token은 문자열이므로 숫자 범위를 따로 결정한다

```java
int value = Integer.parseInt(st.nextToken());
long large = Long.parseLong(st.nextToken());
```

문제의 입력 범위뿐 아니라 **계산 결과의 범위**도 확인해야 합니다. 각 입력값은 `int`여도 N개를 더하거나 곱한 결과는 `long`이 필요할 수 있습니다.

```java
long sum = 0;
for (int i = 0; i < n; i++) {
    sum += Integer.parseInt(st.nextToken());
}
```

### 한 줄에 필요한 token이 모두 있다는 보장을 확인한다

문제에서 "두 번째 줄에 N개의 정수"라고 명시했다면 tokenizer 하나로 읽을 수 있습니다. 하지만 단순히 공백으로 구분된 N개 값이라고만 보장하고 줄 경계를 보장하지 않는다면 token이 다음 줄로 이어질 수 있습니다.

```text
10 20
30 40
```

이런 입력에서는 tokenizer가 비었을 때 다음 줄을 읽는 helper나 별도 scanner를 사용해야 합니다. **입력 템플릿보다 문제의 실제 입력 계약이 우선**입니다.

### EOF와 빈 줄은 다르다

`readLine()`은 EOF에서 `null`을 반환합니다. 빈 줄은 `""`입니다.

```java
String line;
while ((line = reader.readLine()) != null) {
    // EOF까지 처리
}
```

온라인 저지가 필요한 줄 수를 정확히 보장하는 문제라면 매번 복잡한 EOF 처리를 넣을 필요는 없지만, EOF까지 읽는 문제에서는 이 차이를 알아야 합니다.

### StringTokenizer는 코딩테스트의 단순 입력에 실용적인 도구다

`StringTokenizer`는 범용 최신 parser로 모든 외부 형식을 처리하기 위한 API는 아닙니다. 하지만 공백으로 구분된 정수처럼 **문법이 단순하고 고정된 온라인 저지 입력**에서는 짧고 직접적입니다.

CSV quoting이나 escape처럼 별도 문법이 있는 실제 파일을 같은 방식으로 처리한다고 일반화하면 안 됩니다.

코딩테스트 입력 코드를 작성할 때는 먼저 줄 구조를 확인하고, 각 token과 계산 결과에 필요한 숫자 타입을 정하세요. 그리고 한 줄 범위를 넘어갈 가능성과 EOF 처리 여부만 확인하면 대부분의 입력 실수를 피할 수 있습니다.
