---
kind: concept
contentKey: java.core.object-model.composition-inheritance-polymorphism
topicContentKey: java.core.object-model
slug: composition-inheritance-polymorphism
title: 상속, 합성, 다형성과 동적 디스패치
summary: 재사용과 변형 지점을 상속·합성 중에서 선택하고 런타임 메서드 결정을 이해한다
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 상속과 클래스 멤버 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 메서드 호출의 선택과 실행 확인
---
# 상속, 합성, 다형성

상속은 하위 타입이 상위 타입의 계약을 만족하면서 확장하는 관계입니다. 합성은 한 객체가 다른 객체를 필드로 가지고 협력시키는 관계입니다. “코드를 재사용하고 싶다”는 이유만으로 상속을 선택하면 강한 결합과 취약한 기반 클래스 문제가 생길 수 있습니다.

```java
interface Notifier { void send(String message); }

final class AlertService {
    private final Notifier notifier; // 합성

    AlertService(Notifier notifier) { this.notifier = notifier; }
}
```

다형성은 상위 타입으로 다루면서 실제 객체의 구현을 통해 동작하는 능력입니다. 오버라이드된 인스턴스 메서드는 호출 시점의 실제 객체 타입을 기준으로 선택됩니다(동적 디스패치). 반면 오버로드 선택과 `static` 메서드, 필드 접근은 주로 컴파일 시 선언 타입의 영향을 받습니다.

백엔드에서 외부 전송기, 저장소, 정책처럼 교체 가능한 협력자를 표현할 때 합성이 테스트와 변경에 유리한 경우가 많습니다. 상속은 진짜 “is-a” 관계와 치환 가능한 계약이 있을 때 사용합니다.
