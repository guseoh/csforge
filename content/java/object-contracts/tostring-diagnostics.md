---
kind: concept
contentKey: java.core.object-contracts.tostring-diagnostics
topicContentKey: java.core.object-contracts
slug: tostring-diagnostics
title: "toString and diagnostics"
summary: "debugging에 유용한 toString과 안정적 직렬화·민감정보 노출을 구분한다"
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html"
    title: "Java SE 25 Object API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 기본 toString 동작 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: method overriding 규칙 확인
---
# toString and diagnostics

## 쉬운 진입

로그에 `Order@6d03e736`만 찍히면 지금 어떤 주문을 보고 있는지 알기 어렵다. 반대로
비밀번호와 token까지 무심코 출력하면 debugging 편의가 보안 사고가 된다. `toString`은
관찰성을 높이되 공개 경계를 신중히 정해야 한다.

## 정확한 메커니즘

`Object.toString()`은 class 이름과 hash 관련 표현을 제공하는 기본 구현이다. class가
override하면 사람이 읽을 수 있는 상태 요약을 만들 수 있다.

```java
@Override
public String toString() {
    return "Order{id=" + id + ", status=" + status + ", itemCount=" + items.size() + "}";
}
```

toString의 반환 문자열은 Java가 JSON, database schema, 로그 보존 형식으로 약속하는 구조가
아니다. 그 목적이 필요하면 별도 serializer/diagnostic DTO를 만들고 field별 masking 정책을
적용한다.

## 실전·면접 연결

로그 호출이 실패 경로에서도 실행될 수 있으므로 toString은 외부 I/O나 복잡한 계산을 피한다.
연관 객체 전체를 재귀적으로 출력하면 성능·순환 참조·PII 문제가 생긴다. 운영 로그에는
stable correlation id와 허용된 요약만 넣고, 디버거용 상세 정보와 구분한다.

## 흔한 오해

- toString을 override하면 object serialization 계약이 생기는 것이 아니다.
- hashCode 값을 그대로 로그에 넣는 것이 안정적인 object identity 표현은 아니다.
- 모든 field를 출력하는 것이 가장 좋은 debugging 정보는 아니다.
