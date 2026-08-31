---
kind: concept
contentKey: java.core.design-patterns.template-method-pattern
topicContentKey: java.core.design-patterns
slug: template-method-pattern
title: "Template Method 패턴과 공통 실행 흐름"
summary: "전체 알고리즘 순서는 상위 타입에 두고 일부 단계만 하위 타입이 바꾸는 구조와 상속 결합의 비용을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8"
    title: "JLS 8.4.8 Inheritance, Overriding, and Hiding"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 메서드 override의 언어 규칙 확인
---
# Template Method 패턴과 공통 실행 흐름

여러 작업이 **전체 처리 순서는 같고 일부 단계만 다를 때** 공통 흐름을 복사해 두면 유지보수가 어려워집니다.

```text
검증 → 변환 → 저장 → 후처리
```

각 구현이 이 순서를 반복한다면 상위 타입이 전체 뼈대를 제공하고 하위 타입이 필요한 단계만 바꾸도록 만들 수 있습니다. 이것을 Template Method 패턴이라고 부릅니다.

```java
abstract class ImportJob {
    final void run() {
        validate();
        transform();
        save();
    }

    abstract void validate();
    abstract void transform();

    void save() {
        // 공통 저장
    }
}
```

`run()`이 알고리즘 순서를 정하고 하위 클래스는 `validate`, `transform`을 구현합니다.

### 장점은 흐름이 한곳에 있다는 것이다

모든 하위 클래스가 “검증 후 변환, 그다음 저장”이라는 순서를 따라야 한다면 상위 타입에서 이를 강제할 수 있습니다. 공통 로깅이나 자원 정리도 한곳에 둘 수 있습니다.

### 단점은 상속 결합이다

하위 클래스는 상위 클래스가 언제 어떤 메서드를 호출하는지 알아야 합니다. 상위 템플릿 순서를 바꾸면 여러 하위 클래스가 영향을 받을 수 있고, 상속 계층이 깊어지면 실제 실행 흐름을 찾기 어려워집니다.

그래서 단순히 중복 코드가 있다는 이유만으로 Template Method를 선택하면 안 됩니다. **하위 타입들이 정말 하나의 공통 알고리즘 계층을 이루는지**가 중요합니다.

### 합성 기반 Strategy와 비교하면

Template Method는 상속을 통해 변경 지점을 제공합니다. Strategy는 별도 협력 객체를 전달해 행동을 교체합니다.

| 관점 | Template Method | Strategy |
|---|---|---|
| 변화 방식 | 상속과 override | 협력 객체 교체 |
| 공통 흐름 | 상위 클래스가 소유 | context가 소유 |
| 런타임 교체 | 일반적으로 덜 유연 | 비교적 쉬움 |
| 결합 | 상위 구현과 강함 | 계약 중심으로 낮추기 쉬움 |

프레임워크 callback 구조에서 Template Method와 비슷한 모습을 만날 수 있지만, 실제 구현이 어떤 패턴인지 이름부터 붙이기보다 호출 흐름을 먼저 확인하는 것이 좋습니다.
