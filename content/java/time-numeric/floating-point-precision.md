---
kind: concept
contentKey: java.core.time-numeric.floating-point-precision
topicContentKey: java.core.time-numeric
slug: floating-point-precision
title: "부동소수점 정밀도와 오차"
summary: "binary floating-point가 일부 10진수를 근사해 저장하는 이유와 비교·금액 계산에서의 영향을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html"
    title: "Java Language Specification 4장: Types, Values, and Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java floating-point type과 값 집합 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Double.html"
    title: "Java SE 25 API: Double"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Double 비교와 NaN·infinity 같은 특수 값 확인
---
# 부동소수점 정밀도와 오차

`double`에 `0.1`을 넣었다고 해서 컴퓨터 내부에 사람이 쓰는 십진수 `0.1`이 그대로 저장된다고 생각하면 여러 계산 결과가 이상하게 보일 수 있습니다. Java의 `float`와 `double`은 **2진수 기반의 부동소수점 표현**을 사용하고, 일부 10진수는 이 방식으로 유한하게 정확히 표현할 수 없습니다.

### 0.1을 정확히 표현하지 못할 수 있는 이유

10진수에서 `1 / 3`을 `0.3333...`처럼 무한히 써야 하는 것과 비슷하게, 2진수에서는 어떤 10진 소수가 끝없이 이어지는 형태가 됩니다. 저장 공간은 유한하므로 가장 가까운 표현 가능한 값으로 저장됩니다.

그래서 다음 결과가 기대와 다를 수 있습니다.

```java
double value = 0.1 + 0.2;
System.out.println(value);        // 보통 0.30000000000000004처럼 보임
System.out.println(value == 0.3); // false
```

이것은 CPU가 무작위로 틀린 계산을 한 것이 아닙니다. **표현 가능한 근사값에 대해 정의된 부동소수점 연산을 수행한 결과**입니다.

```text
10진 입력 0.1
     │
     ▼
가장 가까운 binary floating-point 값
     │
     ├─ 산술 연산
     ▼
다시 표현 가능한 값으로 반올림된 결과
```

한 번의 근사만 보는 것보다 입력 표현과 각 연산 결과가 표현 가능한 값으로 제한된다는 흐름을 이해하는 것이 중요합니다.

### 출력이 0.1로 보인다고 내부 값까지 정확한 것은 아니다

`System.out.println(0.1)`은 사람이 읽을 수 있는 십진 문자열로 변환해 출력합니다. 하지만 출력 문자열과 내부 표현은 구분해야 합니다.

```text
source의 0.1
    │
    ▼
binary floating-point에서 표현 가능한 근사값
    │
    ▼
출력할 때 사람이 읽을 십진 문자열로 변환
```

따라서 formatter로 소수 둘째 자리까지만 출력했다고 계산 정밀도가 회복되는 것도 아닙니다.

### 근사값 비교에는 도메인의 허용 오차가 필요할 수 있다

측정값처럼 작은 오차를 허용할 수 있는 값은 절대 같은지보다 충분히 가까운지를 비교하기도 합니다.

```java
double a = 0.1 + 0.2;
double b = 0.3;
double epsilon = 1e-9;

boolean closeEnough = Math.abs(a - b) < epsilon;
```

하지만 `epsilon`도 아무 숫자나 정하면 되는 것은 아닙니다. 좌표, 물리량, 비율 등 **값의 크기와 업무상 허용 가능한 오차**를 기준으로 정해야 합니다. 값의 크기 범위가 크게 달라지는 계산에서는 고정된 절대 오차 하나만으로 충분한지도 별도로 검토해야 합니다.

`==`가 문법적으로 잘못된 연산은 아닙니다. 정확히 같은 부동소수점 값인지 확인해야 하는 상황도 있습니다. 중요한 것은 내가 비교하려는 값이 근사 계산 결과인지, 정확한 동일성을 요구하는 값인지 구분하는 것입니다.

### NaN과 Infinity도 일반 숫자와 다른 규칙이 있다

부동소수점에는 일반적인 유한 숫자 외에 `NaN`, 양·음의 infinity 같은 특수 값도 있습니다. 특히 primitive `double`의 NaN 비교는 직관과 다를 수 있습니다.

```java
double value = Double.NaN;
System.out.println(value == value); // false
```

따라서 외부 수치 데이터를 처리하거나 계산 결과가 유효한 범위인지 확인할 때는 `Double.isNaN`, `Double.isFinite` 같은 API가 필요한지 검토합니다. primitive 연산자의 규칙과 wrapper `Double`의 `equals` 같은 객체 계약은 같은 질문이 아니므로 문제를 풀 때 어떤 비교를 사용했는지도 함께 봐야 합니다.

### 금액처럼 정확한 십진 의미가 필요한 값에는 주의한다

정산 금액이 `100.10`처럼 **십진 규칙 자체가 업무 계약**이라면 binary floating-point의 근사 표현은 불필요한 위험을 만들 수 있습니다.

대표적인 대안은 다음과 같습니다.

- 최소 화폐 단위를 정수로 저장: 예를 들어 원 단위 정수 금액처럼 domain에서 소수 단위를 정수 minor unit으로 표현할 수 있는 경우
- `BigDecimal`로 decimal 값과 반올림 정책을 명시

어떤 방법이 맞는지는 통화, 소수 단위, 반올림 규칙에 따라 결정해야 합니다. 정수 방식을 선택하더라도 overflow 범위와 통화 단위 정책은 별도로 남습니다.

### 문제를 풀 때 확인할 것

1. `double` 계산이 정확한 십진 계산이라고 가정하지 않습니다.
2. 여러 연산을 거치면서 근사 오차가 어떻게 영향을 줄 수 있는지 봅니다.
3. `==` 비교가 정말 원하는 의미인지 확인합니다.
4. NaN과 infinity 가능성을 확인합니다.
5. 금액처럼 decimal exactness가 필요한 도메인인지 구분합니다.

### 자주 헷갈리는 부분

- `double`이 근사값을 사용한다는 말은 결과가 무작위라는 뜻이 아닙니다.
- 모든 `double` 값이 부정확한 것도 아닙니다. 2진수로 정확히 표현 가능한 값도 있습니다.
- 화면에서 반올림해 출력하는 것과 내부 계산의 정밀도는 다른 문제입니다.
- `==`를 무조건 금지하는 규칙보다 비교하려는 값의 의미가 중요합니다.

### 학습 후 스스로 설명해 보기

Java의 `double`은 binary floating-point 표현을 사용하기 때문에 일부 십진 소수를 정확히 표현하지 못하고 근사값을 저장합니다. 그래서 `0.1 + 0.2 == 0.3` 같은 비교가 기대와 달라질 수 있습니다. 측정값은 도메인에 맞는 허용 오차를 고려하고, 금액처럼 정확한 십진 의미가 필요하면 정수 minor unit이나 `BigDecimal` 같은 모델을 검토해야 합니다.

### 면접에서 이렇게 나옵니다

#### Q. 왜 `0.1 + 0.2 == 0.3`이 false가 될 수 있나요?

`double`은 10진 소수를 그대로 저장하는 타입이 아니라 제한된 비트의 binary floating-point 값으로 표현합니다. `0.1`, `0.2`, `0.3` 중 일부는 정확한 2진 유한소수로 표현되지 않아 서로 다른 근사·연산 결과가 만들어질 수 있으므로 십진 문자열의 모양만 보고 exact equality를 가정하면 안 됩니다.

#### Q. 그러면 `double` 비교에서는 항상 epsilon을 쓰면 되나요?

그렇지 않습니다. 허용 오차는 측정값의 단위와 값의 크기, 도메인이 허용하는 오차에 맞아야 하고 정확한 bit-level 동일성이 필요한 경우도 있습니다. 금액처럼 십진 exactness 자체가 계약이면 tolerance보다 정수 minor unit이나 `BigDecimal`처럼 값 모델을 바꾸는 편이 더 적절할 수 있습니다.
