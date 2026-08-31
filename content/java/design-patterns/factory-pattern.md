---
kind: concept
contentKey: java.core.design-patterns.factory-pattern
topicContentKey: java.core.design-patterns
slug: factory-pattern
title: "Factory와 객체 생성 책임"
summary: "구체 구현 선택뿐 아니라 dependency 조립·검증·재사용 여부 같은 생성 정책과 객체 수명을 한 경계에 모으고, 사용 책임과 생성 책임을 분리한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.9"
    title: "JLS 15.9 Class Instance Creation Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java 객체 생성 표현식의 언어 규칙 확인
---
# Factory와 객체 생성 책임

객체를 사용하는 코드가 구체 구현 선택과 생성 방법까지 모두 알게 되면 business flow와 construction policy가 섞입니다.

```java
PaymentProcessor processor;

if (type == CARD) {
    processor = new CardProcessor(config.cardUrl(), new CardSigner(...));
} else {
    processor = new BankProcessor(config.bankUrl(), new BankAuthenticator(...));
}

processor.pay(order);
```

이 코드에서 실제 use case가 관심 있는 것은 `processor.pay(order)`입니다. 반면 어떤 구현을 선택하고 어떤 dependency로 조립할지는 별도의 변화 이유를 가질 수 있습니다.

```java
final class PaymentProcessorFactory {
    private final PaymentConfig config;

    PaymentProcessorFactory(PaymentConfig config) {
        this.config = config;
    }

    PaymentProcessor create(PaymentType type) {
        return switch (type) {
            case CARD -> new CardProcessor(
                    config.cardUrl(),
                    new CardSigner(config.cardKey())
            );
            case BANK -> new BankProcessor(
                    config.bankUrl(),
                    new BankAuthenticator(config.bankKey())
            );
        };
    }
}
```

```text
Use case
  │ 어떤 역할이 필요한가
  ▼
PaymentProcessor

Factory
  │ 어떤 구현인가
  │ 어떤 dependency로 조립하는가
  │ 새로 만들까 재사용할까
  ▼
Concrete object
```

Factory의 핵심은 `new`를 다른 파일로 이동하는 것이 아니라 **생성에 관한 결정이 실제 사용 코드와 독립적으로 바뀔 이유가 있을 때 그 결정을 한 경계에 모으는 것**입니다.

### 구현 선택이 반복될 때 생성 정책을 한곳에 모을 수 있다

여러 호출자가 각각 같은 switch를 가지고 있다면 새 타입을 추가할 때 모든 호출자를 수정해야 합니다.

```java
switch (type) {
    case CSV -> new CsvParser();
    case JSON -> new JsonParser();
    case XML -> new XmlParser();
}
```

Factory가 선택을 소유하면 호출자는 `Parser` 역할에만 의존할 수 있습니다.

```java
Parser parser = parserFactory.create(type);
parser.parse(source);
```

이때 단순히 switch가 존재한다는 이유만으로 Factory가 필요한 것은 아닙니다. 한 장소의 짧고 안정적인 switch가 오히려 더 읽기 쉬울 수도 있습니다. Factory의 가치가 커지는 것은 **선택 정책이 여러 곳에 반복되거나 조립 과정 자체가 별도 책임이 될 때**입니다.

### 객체 생성은 class 선택뿐 아니라 수명 정책도 포함한다

문서 parser와 writer를 만든다고 해 보겠습니다. Parser는 immutable하고 상태를 갖지 않아 형식별로 공유할 수 있지만 Writer는 현재 문서의 output buffer를 내부에 보관한다고 가정합니다.

```java
DocumentTools create(Format format) {
    Parser parser = parserCache.get(format); // immutable, shared
    Writer writer = new Writer(format);       // mutable, per document
    return new DocumentTools(parser, writer);
}
```

Factory가 둘 다 무조건 singleton으로 캐시하면 서로 다른 문서의 output이 같은 Writer buffer에 섞일 수 있습니다. `synchronized`를 붙여도 “문서마다 독립된 buffer가 필요하다”는 수명 의미는 해결되지 않습니다.

```text
재사용 가능한가?
  ├─ immutable / stateless -> 공유 가능성을 검토
  └─ request/document별 mutable state -> 독립 instance가 자연스러울 수 있음
```

Factory는 생성 횟수를 줄이는 패턴이 아닙니다. **어떤 state가 누구에게 속하는지에 맞춰 instance 수명을 결정하는 책임**도 가질 수 있습니다.

### Factory는 생성 이후의 business lifecycle까지 소유하지 않는다

```java
Order order = orderFactory.create(...);
order.pay(...);
order.cancel(...);
```

Factory가 `Order`를 유효한 초기 상태로 만드는 데 참여할 수는 있지만 이후 `pay`, `cancel` 같은 domain behavior까지 Factory가 대신 처리하면 객체의 책임이 다시 밖으로 빠져나갈 수 있습니다.

```java
orderFactory.cancel(order); // 모든 domain behavior를 factory가 가져가는 구조
```

Factory는 보통 **어떻게 유효한 객체를 얻는가**를 담당하고, 만들어진 객체의 고유한 행동은 그 객체나 해당 use case의 책임으로 남습니다.

### 생성 시 검증과 설정 해석도 Factory가 숨길 수 있다

외부 설정을 읽어 concrete dependency를 조립하는 과정은 호출자가 알 이유가 없을 수 있습니다.

```java
PaymentProcessor create(PaymentType type) {
    URI endpoint = config.endpointFor(type);
    Duration timeout = config.timeoutFor(type);

    if (timeout.isNegative()) {
        throw new IllegalStateException("invalid payment timeout");
    }

    return switch (type) {
        case CARD -> new CardProcessor(endpoint, timeout);
        case BANK -> new BankProcessor(endpoint, timeout);
    };
}
```

다만 “Factory가 있으니 모든 validation을 여기 넣는다”는 뜻은 아닙니다. 객체 자체의 invariant는 객체 생성 API가 지켜야 할 수 있고, business 상태 규칙은 domain이 소유할 수 있습니다. Factory는 **조립 정책에 속하는 검증**만 가져가는 편이 응집됩니다.

### 반환 타입은 호출자가 어느 세부에 의존할지 결정한다

```java
PaymentProcessor create(PaymentType type)
```

Factory가 공통 역할을 반환하면 use case는 `CardProcessor`, `BankProcessor`를 직접 import하지 않아도 됩니다. 새 구현을 추가하거나 선택 방식을 바꿀 때 호출자 변경을 줄일 수 있습니다.

반대로 호출자가 concrete class의 고유 기능을 실제로 필요로 한다면 무조건 가장 넓은 interface로 숨기면 안 됩니다. 숨긴 차이를 결국 `instanceof`와 cast로 되찾는다면 abstraction이 현재 요구를 제대로 표현하지 못하는 것입니다.

### static factory와 별도 Factory는 생성 책임의 범위가 다르다

```java
Money.won(10_000)
```

이런 static factory는 `Money` 자신의 생성 의미와 invariant를 class 안에 표현합니다.

```java
PaymentProcessorFactory.create(type)
```

별도 Factory는 여러 concrete 제품과 설정·dependency를 조립하는 **외부 construction policy**가 독립 책임일 때 더 자연스럽습니다.

둘 중 무엇이 더 “패턴답다”가 중요한 것이 아니라 생성 지식이 어디에 가장 응집되는지가 중요합니다.

### Builder와 Factory도 해결하는 문제가 다르다

Builder는 한 객체의 선택 인자가 많고 단계적 구성 state가 필요한 문제에 강합니다. Factory는 어떤 implementation이나 object graph를 만들지 선택·조립하는 문제에 강합니다.

```java
ReportOptions options = ReportOptions.builder()
        .format(PDF)
        .includeSummary(true)
        .build();

Exporter exporter = exporterFactory.create(options.format());
```

필요하면 함께 쓸 수 있지만 단순한 `new Member(name)`을 `MemberFactory -> MemberBuilder -> Member`처럼 여러 층으로 감싸는 것이 좋은 설계는 아닙니다.

### DI와 Factory는 서로 반대되는 개념이 아니다

DI는 사용하는 객체가 협력자를 직접 만들지 않고 외부에서 받는 구조입니다. 그 외부 조립자 중 하나가 Factory일 수 있습니다.

```text
Factory / composition root
   ├─ Gateway 생성
   ├─ Repository 생성
   └─ Service에 주입
```

즉 Factory가 생성 책임을 모으고, 만들어진 collaborator를 다른 객체에 주입하면 두 개념은 자연스럽게 연결됩니다.

### 불필요한 Factory는 간접 계층만 늘린다

```java
class MemberFactory {
    Member create(String name) {
        return new Member(name);
    }
}
```

구현 선택도 없고, 이름 있는 생성 의미도 없고, 별도 조립 정책도 없다면 `new Member(name)`보다 얻는 것이 거의 없을 수 있습니다. 패턴을 사용했다는 사실 때문에 파일과 탐색 경로만 늘어납니다.

Factory를 판단할 때는 다음 흐름을 직접 추적하면 좋습니다. 어떤 concrete type을 선택하는지, dependency와 config를 누가 조립하는지, 생성된 object가 새 instance인지 공유 instance인지, mutable state의 소유자가 누구인지, 그리고 그 결정이 use case의 핵심 책임과 독립적으로 바뀌는지를 봅니다. 이 질문에 답이 분명할 때 Factory는 단순한 `new` wrapper가 아니라 **객체 생성 정책의 책임 경계**가 됩니다.
