---
kind: concept
contentKey: java.core.object-model.encapsulation-invariants
topicContentKey: java.core.object-model
slug: encapsulation-invariants
title: "Encapsulation과 invariants"
summary: "상태 변경 규칙을 객체 안에 두고 유효한 상태만 공개하는 이유를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html"
    title: "Java Language Specification 6장: Names"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: member accessibility와 이름 접근 범위 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: field/method와 access control 선언 확인
---
# Encapsulation과 invariants

## 쉬운 진입

잔액이 음수가 되면 안 되는 계좌를 모든 호출자가 직접 수정하게 만들면, 누군가 규칙을 빼먹을
때마다 잘못된 상태가 생긴다. 캡슐화는 데이터를 숨기는 장식이 아니라 “어떤 상태 변경이 허용되는가”
라는 규칙을 객체가 책임지게 하는 방법이다.

## 정확한 메커니즘

```java
final class Account {
    private long balance;

    Account(long initial) {
        if (initial < 0) throw new IllegalArgumentException("negative balance");
        balance = initial;
    }

    void withdraw(long amount) {
        if (amount <= 0 || amount > balance) throw new IllegalArgumentException("invalid withdrawal");
        balance -= amount;
    }

    long balance() { return balance; }
}
```

`private` field와 의미 있는 `withdraw` 메서드는 상태와 invariant를 한 경계에 모은다. `setBalance`
같은 generic setter를 열면 호출자가 음수 검사, 권한, 이력 기록 같은 조건을 조합해야 한다.
캡슐화는 모든 field를 무조건 숨긴다는 뜻이 아니라, 외부에 공개할 계약과 내부 표현을 분리하는
것이다.

## 실전·면접 연결

application service가 객체 field를 여러 번 조립하기보다 `open`, `publish`, `withdraw`처럼
의도가 드러나는 행동을 호출한다. 이 방식은 테스트에서 invariant를 한 곳에 확인하게 하고,
내부 저장 표현을 바꿔도 호출자 계약을 덜 흔든다. access modifier가 보호하는 것은 Java 코드의
접근이며 OS 수준 보안 경계가 아니다.

## 흔한 오해

- getter와 private field만 있으면 자동으로 좋은 캡슐화가 되는 것은 아니다.
- encapsulation은 변경을 모두 금지하는 immutability와 다르다.
- setter를 줄이는 목적은 코드 길이가 아니라 invariant의 책임 위치를 명확하게 하는 데 있다.
