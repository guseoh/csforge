---
kind: concept
contentKey: java.core.coding-tests.fast-input-bufferedreader-tokenizer
topicContentKey: java.core.coding-tests
slug: fast-input-bufferedreader-tokenizer
title: "Fast input with BufferedReader and tokenization"
summary: "BufferedReader와 tokenization, 숫자 parsing을 사용해 코딩테스트 입력을 안정적이고 효율적으로 읽는다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/BufferedReader.html"
    title: "Java SE 25 API: BufferedReader"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 줄 단위 입력과 buffering 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/StringTokenizer.html"
    title: "Java SE 25 API: StringTokenizer"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: token 분리 API 확인
---
# BufferedReader 입력과 tokenization

## 쉬운 진입

코딩테스트 입력은 보통 공백으로 구분된 숫자와 여러 줄의 명령으로 들어온다. 한 글자씩
읽고 매번 변환하면 구현이 길어지고 호출도 많아진다. BufferedReader로 한 줄을 받은 뒤
StringTokenizer로 token을 꺼내면 입력 형식과 파싱 단계를 분리할 수 있다.

## 정확한 메커니즘

~~~
BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
int n = Integer.parseInt(reader.readLine().trim());
StringTokenizer tokens = new StringTokenizer(reader.readLine());
long sum = 0;
for (int i = 0; i < n; i++) {
    sum += Long.parseLong(tokens.nextToken());
}
~~~

BufferedReader는 문자를 버퍼링하며 readLine()은 줄 끝을 제외한 문자열을 반환한다.
StringTokenizer는 delimiter를 기준으로 token을 순서대로 제공한다. 입력 범위가 int를
넘을 수 있으면 Long.parseLong을 선택하고, 줄마다 token 수가 달라질 수 있으면 한
StringTokenizer를 다음 줄까지 재사용하지 않는다. EOF에 도달하면 readLine()은 null이므로
입력 계약에 맞게 처리해야 한다.

## 실전·면접 연결

속도는 “무조건 특정 클래스가 빠르다”가 아니라 읽기 호출 수, 파싱 비용, 출력량의 합으로
결정된다. 공백이 줄 경계를 가리지 않는 입력이라면 readLine()과 tokenizer의 조합만으로
충분한지 먼저 확인한다. 더 복잡한 입력 스캐너를 직접 만들더라도 숫자 부호와 EOF 규칙을
명시적으로 테스트해야 한다.

## 흔한 오해

- BufferedReader가 숫자를 자동으로 변환하지는 않는다.
- readLine() 하나가 전체 입력을 의미하지 않는다.
- tokenizer의 token이 존재한다고 가정한 뒤 nextToken()을 호출하면 입력 형식이 어긋날 때 예외가 난다.
