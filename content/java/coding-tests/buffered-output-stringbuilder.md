---
kind: concept
contentKey: java.core.coding-tests.buffered-output-stringbuilder
topicContentKey: java.core.coding-tests
slug: buffered-output-stringbuilder
title: "Buffered output and StringBuilder"
summary: "반복적인 정답 출력을 메모리에서 조립하거나 buffering해 작은 출력 호출을 줄이는 방법을 익힌다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StringBuilder.html"
    title: "Java SE 25 API: StringBuilder"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: mutable character sequence와 append API 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/BufferedWriter.html"
    title: "Java SE 25 API: BufferedWriter"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: output buffering과 flush 계약 확인
---
# Buffered output과 StringBuilder

정답을 수십만 줄 출력하는 문제에서 반복문마다 `System.out.println()`을 호출하면 계산 자체보다 출력 호출이 더 큰 비용이 될 수 있습니다. 코딩테스트에서는 보통 **계산 결과를 먼저 모아 두고 큰 단위로 출력**하는 방식을 자주 사용합니다.

### StringBuilder는 문자열 조립과 출력 시점을 분리한다

```java
StringBuilder result = new StringBuilder();

for (int value : values) {
    result.append(value).append('\n');
}

System.out.print(result);
```

반복문 안에서는 메모리의 mutable character sequence에 결과를 추가하고, 실제 표준 출력은 마지막에 한 번 수행합니다.

```text
계산 1 -> append
계산 2 -> append
계산 3 -> append
          │
          ▼
   StringBuilder
          │
          ▼
     마지막 출력
```

이 구조는 "정답 계산"과 "외부 I/O"를 나누어 생각하기도 쉽습니다.

### 문자열 `+`와 StringBuilder는 사용 위치를 구분한다

단순한 한 문장의 문자열 연결은 compiler가 적절히 최적화할 수 있어 무조건 StringBuilder를 직접 써야 하는 것은 아닙니다.

하지만 반복 횟수에 따라 계속 결과가 커지는 코드에서는 새 문자열 결과를 계속 만드는 방식보다 하나의 mutable builder에 추가하는 의도가 분명합니다.

```java
StringBuilder result = new StringBuilder();
for (int i = 0; i < n; i++) {
    result.append(answer[i]).append('\n');
}
```

StringBuilder의 세부 용량 증가 전략을 외우는 것이 이 Concept의 목표는 아닙니다. **반복적으로 텍스트를 조립하는 작업을 mutable buffer 하나에 모은다**는 사용 관점을 익히면 충분합니다.

### BufferedWriter는 출력 계층 자체를 buffer한다

```java
BufferedWriter writer = new BufferedWriter(
        new OutputStreamWriter(System.out)
);

for (int value : values) {
    writer.write(Integer.toString(value));
    writer.newLine();
}
writer.flush();
```

`BufferedWriter`는 writer 내부 buffer에 문자를 모아 underlying output으로 전달합니다. StringBuilder와 역할이 완전히 같은 것은 아닙니다.

- `StringBuilder`: 애플리케이션에서 하나의 문자열을 조립
- `BufferedWriter`: output writer 앞에서 작은 write 호출을 buffering

문제 규모와 구현 스타일에 따라 둘 중 하나 또는 둘을 함께 사용할 수 있습니다.

### 전체 결과를 StringBuilder 하나에 담는 것도 메모리를 쓴다

결과가 매우 크다면 모든 출력을 StringBuilder 하나에 끝까지 모으는 방법도 메모리를 많이 사용할 수 있습니다. 그런 경우 BufferedWriter에 일정하게 쓰는 방식이 더 자연스러울 수 있습니다.

따라서 "출력이 많으면 무조건 StringBuilder 하나"가 아니라 **출력 호출 수와 메모리 사용을 함께 봅니다.**

### `flush()`와 `close()`를 구분한다

`flush()`는 BufferedWriter에 남은 데이터를 다음 출력 계층으로 전달합니다. writer를 닫는 동작은 아닙니다.

온라인 저지에서 `System.out`을 직접 감싼 writer를 사용할 때는 보통 제출 마지막에 flush를 수행합니다. 라이브러리/애플리케이션 코드에서는 내가 underlying stream의 lifecycle을 소유하는지까지 확인해야 합니다.

### 출력 형식 오류도 자주 발생한다

성능보다 먼저 정답 형식을 맞춰야 합니다.

- 각 값 뒤의 줄바꿈
- 값 사이 공백
- 마지막 줄바꿈 허용 여부
- 여러 test case 사이의 구분

온라인 저지는 마지막 공백·줄바꿈을 허용하는 경우가 많지만 문제 계약을 확인해야 합니다. 결과를 builder로 모으면 실제 문자열을 테스트하기 쉬운 장점도 있습니다.

### 문제를 풀 때 확인할 것

1. 출력량이 얼마나 큰지 봅니다.
2. 반복문마다 외부 출력 호출을 하고 있는지 확인합니다.
3. StringBuilder로 전체 결과를 모아도 메모리가 적절한지 판단합니다.
4. BufferedWriter를 쓴다면 마지막 flush를 확인합니다.
5. 출력 성능보다 먼저 문제의 공백·줄바꿈 형식을 맞춥니다.

### 자주 헷갈리는 부분

- StringBuilder는 여러 thread가 공유하는 thread-safe buffer가 아닙니다.
- `flush()`는 writer를 닫지 않습니다.
- StringBuilder를 사용한다고 I/O 자체가 사라지는 것은 아닙니다.
- 모든 결과를 한 builder에 저장하는 것도 메모리를 사용합니다.

### 면접에서 설명한다면

코딩테스트의 대량 출력에서는 반복적인 작은 출력 호출을 줄이기 위해 StringBuilder로 결과를 조립한 뒤 한 번에 출력하거나 BufferedWriter로 출력 자체를 buffering할 수 있습니다. StringBuilder는 문자열 조립용 mutable sequence이고 BufferedWriter는 I/O 계층의 buffer라는 역할 차이가 있으며, 출력량이 매우 크면 메모리 사용도 함께 고려해야 합니다.
