---
kind: concept
contentKey: java.core.design-patterns.template-method-pattern
topicContentKey: java.core.design-patterns
slug: template-method-pattern
title: "Template Method 패턴과 공통 실행 흐름"
summary: "공통 알고리즘의 순서와 변형 지점을 상위 타입에 명시하고, hook·예외·자원 정리·상속 결합·독립 변동 축의 조합 폭증까지 고려해 적용 여부를 판단한다"
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

여러 작업이 **전체 처리 순서는 같고 일부 단계만 다를 때** 각 구현이 전체 흐름을 복사하면 순서 규칙까지 중복될 수 있습니다.

```text
검증 → 변환 → 저장 → 후처리
```

Template Method 패턴은 이 공통 순서를 상위 타입이 소유하고, 달라져야 하는 일부 단계만 하위 타입의 override 지점으로 둡니다.

```java
abstract class ImportJob {
    final void run() {
        validate();
        Object converted = transform();
        save(converted);
        afterSave();
    }

    protected abstract void validate();
    protected abstract Object transform();

    protected void save(Object converted) {
        // 공통 저장
    }

    protected void afterSave() {
        // 선택적인 hook
    }
}
```

`run()`이 알고리즘의 골격을 정합니다. `validate()`와 `transform()`은 반드시 구현해야 하는 단계이고 `afterSave()`는 필요한 하위 타입만 재정의할 수 있는 hook입니다.

## 고정해야 하는 순서는 상위 타입이 보호할 수 있다

검증 후 저장이라는 순서가 모든 구현의 규칙이라면 template method를 `final`로 두어 하위 클래스가 전체 순서를 우회하지 못하게 할 수 있습니다.

```text
상위 타입
- 실행 단계와 순서
- 공통 구현

하위 타입
- 명시적으로 열린 변형 단계
```

`final`이 패턴의 필수 문법은 아니지만, 알고리즘 순서가 불변 조건이라면 이를 코드로 보호하는 수단이 됩니다.

## hook이 많아질수록 상속 결합도 커진다

하위 클래스는 단순히 메서드 시그니처뿐 아니라 **상위 클래스가 어떤 순서로 hook을 호출하는지**에도 의존할 수 있습니다.

```java
class CsvImportJob extends ImportJob {
    private ParsedData parsed;

    @Override
    protected Object transform() {
        parsed = parseCsv();
        return parsed;
    }

    @Override
    protected void afterSave() {
        audit(parsed);
    }
}
```

`afterSave()`는 `transform()`이 먼저 실행되어 `parsed`가 준비된다는 사실을 알고 있습니다. hook과 `protected` 상태가 계속 늘어나면 하위 타입이 상위 클래스의 내부 실행 규약에 강하게 묶입니다.

그래서 Template Method의 장점과 비용은 함께 봐야 합니다. **공통 순서를 한곳에 모을 수 있지만, 변형 지점이 많아질수록 상속 계층의 결합도도 커집니다.**

## 독립적인 변화 축은 합성이 더 자연스러울 수 있다

압축 방식과 암호화 방식처럼 서로 독립적으로 조합되는 정책까지 모두 하위 클래스로 표현하면 조합 수가 빠르게 늘 수 있습니다.

```text
공통 실행 순서       → Template Method 후보
독립적으로 교체할 정책 → Strategy/합성 후보
```

따라서 “공통 코드가 있다”는 이유만으로 Template Method를 적용하기보다 **정말 하나의 알고리즘 골격을 공유하는 하위 타입 관계인지**를 먼저 확인해야 합니다. 단순한 중복이라면 작은 helper나 협력 객체가 더 직접적일 수 있습니다.

Template Method는 공통 알고리즘의 순서 자체가 중요한 계약이고, 하위 타입마다 달라지는 단계가 명확하고 안정적일 때 가장 이해하기 쉽습니다.
