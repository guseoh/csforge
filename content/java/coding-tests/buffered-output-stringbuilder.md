---
kind: concept
contentKey: java.core.coding-tests.buffered-output-stringbuilder
topicContentKey: java.core.coding-tests
slug: buffered-output-stringbuilder
title: "Buffered output and StringBuilder"
summary: "반복적인 작은 출력 호출을 피하고 StringBuilder·BufferedWriter 등으로 출력을 모아 처리한다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StringBuilder.html"
    title: "Java SE 25 API: StringBuilder"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: mutable 문자열 조립 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/BufferedWriter.html"
    title: "Java SE 25 API: BufferedWriter"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 문자 출력 buffering과 flush 확인
---
# Buffered output과 StringBuilder

## 쉬운 진입

정답을 반복문 안에서 System.out.println으로 한 줄씩 보내면 결과는 맞아도 작은 출력
호출이 많아질 수 있다. 먼저 StringBuilder에 결과 문자열을 쌓고 마지막에 출력하거나,
BufferedWriter에 모아 쓰면 계산과 외부 출력의 경계를 분명히 할 수 있다.

## 정확한 메커니즘

~~~
StringBuilder result = new StringBuilder();
for (int value : values) {
    result.append(value).append('\n');
}

BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(System.out));
writer.write(result.toString());
writer.flush();
~~~

StringBuilder는 문자열을 mutable sequence로 조립하므로 반복적인 +로 중간 String을 계속
만들 필요를 줄인다. BufferedWriter는 문자를 underlying writer로 보내기 전에 buffer에
보관하며 flush()는 현재 buffer를 다음 계층으로 밀어낸다. flush()가 프로그램 종료나
저장 장치의 영속성을 보장하는 것은 아니다. 제출 코드에서는 출력 순서가 문제의 요구와
같은지, 마지막 줄바꿈이 허용되는지 함께 확인한다.

## 실전·면접 연결

출력량이 작으면 단순한 출력 API도 충분하지만, 큰 결과를 조립할 때는 StringBuilder의
수명과 메모리 사용량을 고려한다. writer를 직접 소유하는 코드라면 정상 종료뿐 아니라
예외 시 close 정책도 정해야 한다. 알고리즘 이론이 아니라 Java의 mutable text와 I/O
buffer 경계를 익히는 것이 핵심이다.

## 흔한 오해

- StringBuilder는 thread-safe한 공유 buffer가 아니다.
- flush()는 writer를 닫지 않으며 데이터의 디스크 영속성도 보장하지 않는다.
- buffer를 크게 잡으면 모든 입력 크기와 실행 환경에서 비례해 빨라진다는 보장은 없다.
