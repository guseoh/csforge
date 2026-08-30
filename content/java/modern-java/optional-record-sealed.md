---
kind: concept
contentKey: java.core.modern-java.optional-record-sealed
topicContentKey: java.core.modern-java
slug: optional-record-sealed
title: Optional, record, sealed type의 쓰임
summary: 부재 표현·데이터 운반·닫힌 타입 계층에 현대 Java 타입을 목적에 맞게 적용한다
level: 3
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Optional.html"
    title: Optional API
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 값 부재를 표현하는 반환 타입 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Record.html"
    title: Record API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: record의 데이터 중심 의미 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: record와 sealed class 선언 규칙 확인
---
# Optional, record, sealed type

`Optional<T>`는 값이 없을 수 있다는 사실을 주로 메서드 반환 경계에서 표현하는 값 타입입니다. 호출자에게 `null` 가능성을 드러내고 `map`, `orElseGet`, `orElseThrow` 같은 흐름을 사용할 수 있습니다. 엔티티 필드나 모든 매개변수를 무조건 Optional로 감싸면 직렬화·JPA·호출 코드가 오히려 복잡해질 수 있습니다.

`record`는 데이터 운반을 위한 컴포넌트와 `equals`, `hashCode`, `toString` 등을 간결하게 선언하는 클래스 형태입니다. 모든 도메인 객체가 record가 되는 것은 아니며, identity와 복잡한 lifecycle이 필요한 엔티티에는 일반 클래스가 더 적합할 수 있습니다.

`sealed` class/interface는 허용된 직접 하위 타입을 제한합니다. 닫힌 대안 집합을 모델링하면 컴파일러가 누락된 분기를 찾는 데 도움이 되지만, 런타임 플러그인처럼 확장이 계약의 핵심인 영역에는 맞지 않습니다. 세 기능은 모두 “최신 문법이므로 사용”하는 게 아니라 부재·데이터·타입 집합이라는 문제에 대응합니다.
