---
kind: concept
contentKey: java.core.exceptions-resources.checked-unchecked
topicContentKey: java.core.exceptions-resources
slug: checked-unchecked
title: Checked와 unchecked 예외
summary: 컴파일러가 처리 여부를 확인하는 예외와 프로그래밍 오류·실행 실패를 구분한다
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html"
    title: "Java Language Specification 11장: Exceptions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 예외 타입과 검사 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/RuntimeException.html"
    title: RuntimeException API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: unchecked 예외 계층 확인
---
# Checked와 unchecked 예외

`Throwable` 아래에서 `RuntimeException`과 `Error`가 아닌 예외는 checked exception입니다. 메서드가 checked 예외를 던질 수 있으면 호출자에게 `throws`로 선언하거나 `try-catch`로 처리해야 합니다. 컴파일러가 이 경로를 확인하므로 외부 시스템의 예상 가능한 실패를 API에 드러낼 때 유용합니다.

`RuntimeException` 계열은 unchecked 예외입니다. `NullPointerException`, `IllegalArgumentException`처럼 호출 전제 위반이나 프로그래밍 오류를 나타내는 경우가 많고, 모든 호출부에 강제 선언되지 않습니다. 그렇다고 unchecked가 항상 나쁘거나 checked가 항상 옳다는 뜻은 아닙니다.

실패가 복구·재시도 가능한 외부 경계인지, 호출자가 반드시 알아야 하는 계약인지, 단순한 버그인지에 따라 선택합니다. 예외 종류를 문법의 편의만으로 결정하지 말고 시스템의 책임 경계를 반영해야 합니다.
