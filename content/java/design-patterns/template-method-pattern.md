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

여러 작업이 전체 처리 순서는 같고 일부 단계만 다를 때 각 구현이 전체 흐름을 복사하면 중복보다 더 큰 문제가 생깁니다. 한 구현이 검증을 빼먹거나 저장과 후처리 순서를 바꾸면서 **원래 하나여야 했던 알고리즘 계약이 구현마다 달라질 수 있기 때문**입니다.

```text
검증 -> 변환 -> 저장 -> 후처리
```

Template Method 패턴은 이 공통 순서를 상위 타입이 소유하고, 실제로 달라져야 하는 일부 단계만 하위 타입의 override 지점으로 둡니다.

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
        // 기본적으로 아무 일도 하지 않는 hook
    }
}
```

`run()`이 **알고리즘의 골격(template)** 을 결정합니다. `validate()`와 `transform()`은 반드시 구현해야 하는 변형 지점이고, `afterSave()`는 필요한 하위 타입만 override할 수 있는 hook입니다.

### `final` template method는 전체 순서를 계약으로 고정할 수 있다

하위 class가 `run()` 자체를 override할 수 있다면 다음처럼 공통 규칙을 우회할 수 있습니다.

```java
@Override
void run() {
    Object converted = transform();
    save(converted); // validate 생략
}
```

검증 후 저장이라는 순서가 모든 구현에 필수라면 template method를 `final`로 두어 하위 타입이 전체 골격을 바꾸지 못하게 할 수 있습니다.

```text
상위 타입이 고정하는 것
- 어떤 단계가 존재하는가
- 어떤 순서로 실행되는가
- 공통 단계의 기본 구현

하위 타입이 바꾸는 것
- 명시적으로 열린 primitive operation / hook
```

`final`이 Template Method의 문법적 필수 조건은 아니지만, **전체 알고리즘 순서가 invariant라면 그 사실을 코드로 보호하는 수단**이 될 수 있습니다.

### abstract operation과 hook은 계약 강도가 다르다

```java
protected abstract void validate();
```

abstract method는 하위 타입이 구현하지 않으면 concrete class가 될 수 없습니다. 즉 알고리즘 수행에 반드시 필요한 단계입니다.

반면 기본 구현이 있는 hook은 선택적인 확장 지점입니다.

```java
protected void afterSave() {
}
```

hook이 너무 많아지면 상위 class의 실제 실행 순서를 알아야만 하위 class를 안전하게 구현할 수 있습니다.

```text
beforeValidate?
validate
beforeTransform?
transform
afterTransform?
beforeSave?
save
afterSave?
onFailure?
```

이렇게 확장점이 계속 늘어나면 상속 계층이 단순한 공통 알고리즘보다 **숨은 lifecycle framework**처럼 변할 수 있습니다. 하위 class 개발자는 어느 hook이 언제 호출되고 어떤 상태가 준비되어 있는지를 모두 알아야 합니다.

### 하위 class는 method signature뿐 아니라 호출 순서에도 결합된다

다음 하위 class를 보겠습니다.

```java
class CsvImportJob extends ImportJob {
    private ParsedData parsed;

    @Override
    protected void validate() {
        // source validation
    }

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

`afterSave()`는 `transform()`이 먼저 실행되어 `parsed`가 채워진다는 사실에 의존합니다. 상위 class가 나중에 hook 순서를 바꾸면 compile은 되더라도 runtime 의미가 깨질 수 있습니다.

이것이 Template Method의 중요한 비용입니다. 하위 타입은 상위 타입의 공개 API만이 아니라 **상위 알고리즘의 내부 호출 protocol**에 결합됩니다. protected field나 여러 hook을 많이 공유할수록 이 결합은 더 강해집니다.

### 예외가 발생하면 이후 단계가 어디까지 실행되는지 명확해야 한다

```java
final void run() {
    validate();
    Object converted = transform();
    save(converted);
    afterSave();
}
```

`transform()`에서 예외가 발생하면 `save()`와 `afterSave()`는 실행되지 않습니다. 이것이 원하는 계약인지 확인해야 합니다.

자원 정리가 반드시 필요하다면 정상 경로 마지막에 단순히 두면 안 될 수 있습니다.

```java
final void run() {
    acquire();
    try {
        validate();
        Object converted = transform();
        save(converted);
    } finally {
        release();
    }
}
```

상위 template이 자원 lifecycle을 소유한다면 성공과 실패 모두에서 정리가 실행되도록 골격에 포함할 수 있습니다. 반대로 하위 hook마다 자원 획득·정리를 맡기면 어떤 예외 경로에서 누가 정리해야 하는지 불분명해질 수 있습니다.

Template Method를 읽을 때는 정상 순서만 보지 말고 **각 단계가 실패했을 때 다음 단계와 cleanup이 어떻게 되는지**도 call sequence로 추적해야 합니다.

### 독립적인 변화 축을 모두 subclass로 표현하면 조합 수가 곱으로 늘어난다

Export 과정이 다음 순서를 가진다고 해 봅시다.

```text
validate -> transform -> write
```

그리고 transform 내부에는 서로 독립적인 두 선택이 있습니다.

```text
compression: NONE / GZIP
	encryption: NONE / AES
```

이를 subclass만으로 표현하면 조합 class가 생깁니다.

```text
PlainExport
GzipExport
AesExport
GzipAesExport
```

압축이 세 종류, 암호화가 세 종류가 되면 조합은 최대 9개가 됩니다. 두 정책은 서로 독립적으로 변하는데 상속 계층 하나에 곱해서 표현한 것입니다.

공통 알고리즘 순서는 Template Method가 계속 소유하되, 독립 변동 축은 collaborator로 합성할 수 있습니다.

```java
abstract class ExportJob {
    private final Compressor compressor;
    private final Encryptor encryptor;

    ExportJob(Compressor compressor, Encryptor encryptor) {
        this.compressor = compressor;
        this.encryptor = encryptor;
    }

    final byte[] run(Source source) {
        validate(source);
        byte[] raw = transform(source);
        byte[] compressed = compressor.compress(raw);
        return encryptor.encrypt(compressed);
    }

    protected abstract void validate(Source source);
    protected abstract byte[] transform(Source source);
}
```

```text
고정 흐름          : Template Method
독립 압축 정책     : composition / Strategy
독립 암호화 정책   : composition / Strategy
```

이렇게 하면 공통 실행 순서를 포기하지 않으면서도 독립적인 변화 축을 subclass 조합으로 폭증시키지 않을 수 있습니다.

### Strategy와의 차이는 변화 지점을 연결하는 방식에 있다

Template Method와 Strategy는 둘 다 변하는 부분과 공통 부분을 분리하지만 구조가 다릅니다.

| 관점         | Template Method            | Strategy                 |
| ------------ | -------------------------- | ------------------------ |
| 변화 방식    | 상속과 override            | collaborator 합성        |
| 공통 흐름    | 상위 class가 소유          | context가 소유           |
| 변형 선택    | 보통 concrete subtype 선택 | strategy instance 선택   |
| runtime 교체 | 상대적으로 제한적          | 비교적 자연스러움        |
| 결합         | 상위 호출 protocol에 결합  | strategy contract에 결합 |

두 패턴은 경쟁 관계만 있는 것이 아닙니다. 앞의 Export 예처럼 **큰 고정 골격은 Template Method, 그 안의 독립 정책은 Strategy**로 조합할 수 있습니다.

### 상속이 자연스러운 하나의 알고리즘 계열인지 먼저 확인한다

다음 두 작업에 일부 코드 중복이 있다고 해서 곧바로 같은 abstract superclass에 넣는 것은 위험할 수 있습니다.

```text
CustomerCsvImport
NightlyDatabaseBackup
```

둘 다 `validate -> write` 비슷한 두 단계가 있다고 해도 domain 의미와 lifecycle이 전혀 다르면 억지 상속 계층이 됩니다. 공통 helper method나 collaborator extraction이 더 적절할 수 있습니다.

Template Method의 전제는 단순한 코드 중복이 아니라 **여러 subtype이 같은 알고리즘 골격을 공유하고 일부 단계만 다르게 수행한다는 안정된 관계**입니다.

### protected state 공유가 많아질수록 하위 타입의 자율성은 줄어든다

```java
abstract class Job {
    protected Connection connection;
    protected Result result;
    protected boolean validated;
}
```

하위 class가 상위 field를 직접 읽고 수정하기 시작하면 어떤 단계에서 어떤 state가 유효한지 추적하기 어려워집니다. 상위 class invariant도 여러 subclass에 분산됩니다.

가능하면 변형 method에 필요한 값을 인자로 전달하고 결과를 반환하는 식으로 coupling을 줄일 수 있습니다.

```java
protected abstract Parsed transform(Source source);
```

모든 protected field가 나쁜 것은 아니지만, Template Method가 커질수록 **상속을 통한 암묵적 공유 state**가 얼마나 늘어나는지 확인해야 합니다.

### 단순 중복 제거라면 더 작은 방법이 낫다

두 class에 같은 logging 두 줄이 있다는 이유로 abstract base class를 만들 필요는 없습니다. helper method, 작은 collaborator, utility가 더 직접적일 수 있습니다.

Template Method가 특히 유용한 상황은 다음과 같습니다. 전체 순서를 모든 구현에서 지켜야 하고, 그 순서 자체가 중요한 contract이며, subtype마다 달라지는 단계가 명확하고 안정적일 때입니다. 반대로 변동 축이 서로 독립적이거나 runtime 조합이 많고, hook과 protected state가 계속 늘어난다면 composition 쪽이 더 유연할 수 있습니다.

패턴을 검토할 때는 class diagram보다 **실제 `run()` 한 번의 실행 흐름**을 따라가는 것이 좋습니다. 어느 단계가 상위에서 고정되고, 어느 단계가 override되며, 각 단계 실패 시 무엇이 실행되지 않고 무엇은 반드시 cleanup되는지, 하위 type이 상위의 어떤 호출 순서를 암묵적으로 가정하는지, 그리고 새로운 독립 variation이 추가될 때 subclass 수가 곱으로 늘어나지 않는지를 확인합니다. Template Method의 목적은 상속 자체가 아니라 **공통 알고리즘의 순서를 한곳에서 보호하면서 필요한 변형점만 의도적으로 여는 것**입니다.
