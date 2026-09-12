---
kind: concept
contentKey: java.core.enum-modeling.enum-closed-values-behavior
topicContentKey: java.core.enum-modeling
slug: enum-closed-values-behavior
title: "enum으로 닫힌 값 집합 모델링하기"
summary: "가능한 값이 정해진 상태를 문자열 상수 대신 enum 타입으로 표현하고 값과 관련 행동을 함께 둘 수 있는 이유를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.9"
    title: "JLS 8.9 Enum Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: enum class의 언어 규칙 확인
  - url: "https://techblog.woowahan.com/2527/"
    title: "Java Enum 활용기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 2
    relationNote: 문자열 코드와 관련 행동을 enum으로 응집한 실제 Java 활용 사례를 한국어로 복습
---
# enum으로 닫힌 값 집합 모델링하기

주문 상태가 `READY`, `PAID`, `CANCELLED`처럼 **가능한 값이 미리 정해져 있다면** 단순 문자열보다 enum이 더 분명한 모델이 될 수 있습니다.

```java
String status = "PAYED"; // 오타도 문자열 자체는 허용됨
```

문자열은 어떤 값이 가능한지 타입만 보고 알기 어렵고 오타도 컴파일러가 막지 못합니다.

```java
enum OrderStatus {
    READY,
    PAID,
    CANCELLED
}

OrderStatus status = OrderStatus.PAID;
```

이제 변수에는 `OrderStatus`가 정의한 값만 들어갈 수 있습니다. `PaymentStatus.PAID`처럼 의미가 다른 enum 타입의 값과도 컴파일 시점에 구분됩니다. 문자열 `"PAID"` 하나에 여러 문맥을 겹쳐 넣는 것보다 **값의 문맥 자체를 타입으로 표현**할 수 있는 셈입니다.

### enum은 단순 정수·문자열 상수 묶음보다 강하다

Java enum의 각 상수는 해당 enum 타입의 인스턴스입니다. 그래서 필드, 생성자, 메서드를 가질 수 있습니다.

```java
enum OrderStatus {
    READY(false),
    PAID(true),
    CANCELLED(false);

    private final boolean completedPayment;

    OrderStatus(boolean completedPayment) {
        this.completedPayment = completedPayment;
    }

    boolean completedPayment() {
        return completedPayment;
    }
}
```

상태와 직접 관련된 판단을 enum에 둘 수 있어 호출 코드 곳곳에서 같은 분기를 반복하는 일을 줄일 수 있습니다.

```java
if (status.completedPayment()) {
    // ...
}
```

이때 enum이 효과적인 이유는 단순히 `if` 문 수가 줄어서가 아닙니다. `PAID`라는 값과 “결제가 완료된 상태인가?”라는 지식이 같은 변경 이유를 가진다면 한 타입에 모아 **값과 그 값의 의미를 응집**할 수 있기 때문입니다.

### 각 enum 상수는 공유되는 하나의 상수 객체다

enum 상수에 필드를 둘 수 있다는 사실 때문에 주문별 카운터나 요청별 상태까지 enum 내부에 넣고 싶어질 수 있습니다.

```java
enum Mode {
    STANDARD;

    int uses;

    void used() {
        uses++;
    }
}
```

```java
Mode a = Mode.STANDARD;
Mode b = Mode.STANDARD;

a.used();
b.used();
```

`a`와 `b`가 각각 별도의 `STANDARD` 복사본을 갖는 것이 아닙니다. 둘은 같은 enum 상수를 가리키므로 위의 mutable `uses`도 공유합니다.

```text
상수 Mode.STANDARD
└─ uses = 2
   ▲       ▲
   │       │
   a       b
```

그래서 enum에는 상수별로 변하지 않는 metadata나 공통 정책을 두는 것이 자연스럽고, **주문·사용자·요청마다 독립적으로 변해야 하는 상태는 그 상태를 소유하는 객체에 두는 편이 맞습니다.** mutable enum field가 항상 금지되는 문법 규칙은 아니지만 공유 수명과 동시성 의미를 의도하지 않았다면 쉽게 전역 상태가 됩니다.

### `switch`와 함께 닫힌 집합의 장점을 얻는다

```java
String label = switch (status) {
    case READY -> "대기";
    case PAID -> "결제 완료";
    case CANCELLED -> "취소";
};
```

가능한 enum 상수가 소스에 정해져 있으므로 컴파일러가 exhaustive한 `switch` expression을 검사하는 데 도움을 줄 수 있습니다. 상태가 임의 문자열이었다면 `"PAID"`, `"paid"`, 오타 등 가능한 입력 집합을 타입만으로 닫을 수 없습니다.

다만 모든 분기를 enum method로 옮겨야 한다는 뜻은 아닙니다. 표현 계층의 label처럼 특정 화면에만 필요한 판단까지 domain enum이 모두 소유하면 오히려 결합이 커질 수 있습니다. **값 자체의 의미에 가까운 행동인지, 특정 사용처의 표현 정책인지**를 나눠 봐야 합니다.

### 외부에서 계속 늘어나는 값은 닫힌 enum과 맞지 않을 수 있다

enum은 소스 코드에 선언된 상수 집합을 런타임에 임의로 확장하는 모델이 아닙니다. 관리자가 운영 화면에서 배송 단계를 자유롭게 추가해야 한다면 새 값마다 배포가 필요한 enum보다 DB entity나 설정 데이터가 더 자연스러울 수 있습니다.

반대로 세금 계산 방식, 고정된 권한 종류처럼 제품 코드와 함께 변경되어야 하고 가능한 값이 의도적으로 닫혀 있다면 enum의 타입 안전성이 큰 장점이 됩니다.

```text
코드와 함께 바뀌는 닫힌 값 집합  → enum 후보
운영 중 데이터로 계속 추가되는 값 → entity/config 후보
```

“값 종류가 몇 개 안 된다”보다 **누가 언제 새 값을 추가할 수 있어야 하는가**가 더 좋은 판단 기준입니다.

### 실무에서는 외부 표현과 enum 자체를 구분한다

API나 DB에 저장되는 값이 enum 상수 이름과 영원히 같아야 하는 것은 아닙니다. 외부 계약이 오래 유지되어야 한다면 별도의 안정된 code를 둘 수도 있습니다.

```java
enum OrderStatus {
    READY("ready"),
    PAID("paid");

    private final String code;

    OrderStatus(String code) {
        this.code = code;
    }
}
```

이렇게 하면 Java 상수 이름을 리팩터링하는 문제와 외부 데이터 계약을 분리할 수 있습니다. `name()`과 `ordinal()`을 persistence나 wire identity로 사용하는 trade-off는 다음 Concept에서 따로 다룹니다.

### 선택 기준

`enum`이 특히 자연스러운 경우는 **값의 후보가 닫혀 있고, 그 값들이 하나의 타입으로 같은 의미 체계에 속할 때**입니다. 여기에 값 자체와 함께 바뀌는 작은 정책이 있다면 필드와 메서드로 응집할 수도 있습니다.

반대로 실행 중 확장되어야 하는 데이터, 사용자별 mutable 상태, 여러 aggregate를 조정하는 큰 비즈니스 흐름까지 enum에 넣는 것은 “enum을 적극 활용한다”와 다른 문제입니다. enum은 닫힌 값의 모델이지 모든 분기를 담는 전역 정책 컨테이너가 아닙니다.

### 면접에서 이렇게 나옵니다

#### Q. 문자열 상수 대신 enum을 쓰는 장점은 무엇인가요?

가능한 값의 집합과 그 문맥을 **하나의 타입으로 제한**할 수 있다는 점이 가장 큽니다. 오타나 서로 다른 의미의 문자열 혼용을 컴파일 단계에서 줄이고, 값 자체에 가까운 metadata나 행동도 함께 둘 수 있습니다.

다만 외부에서 새 값이 런타임에 계속 추가되어야 한다면 소스에 닫힌 enum이 맞지 않을 수 있습니다. 값 집합이 실제로 닫혀 있는지를 먼저 판단해야 합니다.

#### Q. enum 상수에 mutable field를 두면 왜 조심해야 하나요?

각 enum 상수는 호출자마다 새로 만들어지는 객체가 아니라 **공유되는 상수 인스턴스**입니다. 따라서 상수의 mutable field를 바꾸면 그 상수를 참조하는 모든 코드가 같은 상태를 보게 됩니다.

상수별 immutable metadata나 공통 정책은 자연스럽지만, 주문별 횟수처럼 각 객체가 독립적으로 가져야 하는 상태라면 해당 domain 객체가 소유하는 편이 적절합니다.
