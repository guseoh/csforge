---
kind: concept
contentKey: java.core.object-contracts.tostring-diagnostics
topicContentKey: java.core.object-contracts
slug: tostring-diagnostics
title: "toString과 진단용 표현"
summary: "toString을 디버깅에 유용한 사람이 읽는 표현으로 사용하되 직렬화 포맷이나 민감정보 안전성을 자동으로 기대하지 않는다"
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#toString()"
    title: "Java SE 25 API: Object.toString"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Object.toString 기본 계약 확인
---
# toString과 진단용 표현

객체를 로그나 디버거에서 볼 때 `ClassName@...` 같은 값만 나오면 현재 상태를 파악하기 어렵습니다. `toString()`을 의미 있게 구현하면 **사람이 객체 상태를 빠르게 이해하는 진단 도구**가 될 수 있습니다.

```java
class Order {
    private long id;
    private Status status;

    @Override
    public String toString() {
        return "Order{id=" + id + ", status=" + status + '}';
    }
}
```

이제 로그나 디버깅 중에 객체의 핵심 상태를 확인하기 쉬워집니다.

### toString은 안정적인 데이터 포맷이 아니다

가장 흔한 오해는 `toString()` 결과를 JSON이나 CSV처럼 **외부 계약으로 사용해도 되는 포맷**으로 보는 것입니다.

```java
String saved = order.toString();
```

나중에 필드 이름이나 출력 형태를 바꾸면 이 문자열을 읽는 코드가 깨질 수 있습니다. `Object.toString`은 안정적인 직렬화 형식을 약속하지 않습니다. 외부 저장·통신 포맷이 필요하면 그 목적에 맞는 직렬화 계약을 별도로 설계해야 합니다.

### 민감정보를 그대로 넣으면 안 된다

```java
@Override
public String toString() {
    return "Member{email=" + email + ", password=" + password + '}';
}
```

이 객체가 예외 메시지나 로그에 출력되면 비밀번호·토큰·개인정보가 기록될 수 있습니다. `toString`을 편리하게 만들려다가 보안 사고 원인을 만들 수 있습니다.

따라서 진단에 필요한 핵심 정보만 넣고, secret이나 민감한 개인정보는 제외하거나 별도 마스킹 정책을 적용해야 합니다.

### 로그 비용도 생각한다

큰 컬렉션이나 연관 객체 전체를 `toString()`에 포함하면 로그 한 줄이 매우 커질 수 있고, 서로를 참조하는 객체 구조에서는 순환 호출 문제가 생길 수도 있습니다.

도메인 엔티티의 모든 필드를 기계적으로 출력하기보다 **문제를 식별하는 데 필요한 최소한의 상태**를 선택하는 편이 좋습니다.

### 실무에서의 역할

`toString`은 개발 중 디버깅, 테스트 실패 메시지, 간단한 로그에서 유용합니다. 하지만 다음 용도를 대신하지는 않습니다.

- API 응답 JSON
- DB 저장 포맷
- 감사 로그의 정형 스키마
- 민감정보 마스킹 정책

문제에서 “toString을 override하면 객체를 직렬화할 수 있다” 같은 선택지가 나오면 틀린 설명입니다. **사람이 읽기 좋은 표현과 시스템 간 계약 포맷을 구분**해야 합니다.
