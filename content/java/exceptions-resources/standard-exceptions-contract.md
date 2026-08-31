---
kind: concept
contentKey: java.core.exceptions-resources.standard-exceptions-contract
topicContentKey: java.core.exceptions-resources
slug: standard-exceptions-contract
title: "Standard exceptions and contracts"
summary: "메서드 계약 위반에 맞는 표준 예외를 선택한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/IllegalArgumentException.html"
    title: "Java SE 25 API: IllegalArgumentException"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 인자 값 계약 위반의 표준 예외 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/NoSuchElementException.html"
    title: "Java SE 25 API: NoSuchElementException"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 요청한 원소가 없을 때의 표준 예외 확인
---
# Standard exceptions and contracts

## 쉬운 진입

예외 이름은 디버깅 메시지이면서 호출자가 무엇을 고쳐야 하는지 알려 주는 계약이다. 음수
범위가 금지된 인자에는 `IllegalArgumentException`, null이 허용되지 않는 필수 참조에는
`NullPointerException`, 존재하지 않는 원소 조회에는 `NoSuchElementException`처럼 원인을
표현하는 표준 타입을 먼저 검토한다.

## 정확한 메커니즘

표준 예외는 Java API가 널리 공유하는 의미를 가진다. `IndexOutOfBoundsException`은 인덱스
범위, `IllegalStateException`은 현재 객체 상태에서 호출할 수 없음을 나타낸다. 예외 선택은
인자의 값 문제인지, 호출 순서·객체 상태 문제인지, 외부 자원 실패인지 분리해 판단한다.

## 실전·면접 연결

새 custom exception은 표준 타입만으로 호출 계약을 표현하기 어려울 때 의미 있는 경계를
만든다. 단순히 모든 오류를 `RuntimeException`으로 감싸면 catch 정책이 흐려진다. public API의
문서와 테스트는 어떤 입력이 어떤 계약 위반인지 함께 보여 줘야 한다.

## 흔한 오해

- `NullPointerException`은 언제나 JVM이 우연히 던지는 오류가 아니다. 필수 null 인자 계약을 명시하는 데 사용할 수도 있다.
- `IllegalStateException`은 잘못된 인자 값의 일반 이름이 아니다.
- 표준 예외를 선택한다고 입력 검증이나 상태 검증이 자동으로 수행되지는 않는다.
