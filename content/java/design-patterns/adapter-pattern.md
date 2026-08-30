---
kind: concept
contentKey: java.core.design-patterns.adapter-pattern
topicContentKey: java.core.design-patterns
slug: adapter-pattern
title: "Adapter 패턴과 외부 API 경계"
summary: "호환되지 않는 인터페이스를 애플리케이션이 원하는 역할로 변환한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4"
    title: "Java Language Specification 8.4장: Methods"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 인터페이스 메서드 구현과 overriding 규칙 확인
  - url: "https://refactoring.guru/design-patterns/adapter"
    title: "Adapter Design Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: target와 adaptee 사이 변환 구조 참고
---
# Adapter 패턴과 외부 API 경계

## 쉬운 진입

내부 코드는 `PaymentGateway.pay(Money)`를 기대하지만 외부 SDK는 `charge(long cents)`만
제공할 수 있다. SDK 호출을 모든 서비스에 흩뜨리지 말고 adapter 하나가 두 언어를 통역하게 한다.

## 정확한 메커니즘

```text
Checkout ──> PaymentGateway (Target)
                    ▲
                    │ implements
             SdkPaymentAdapter ──delegates──> VendorSdk (Adaptee)
```

Adapter는 단위 변환, 예외 변환, 요청 객체 조립처럼 경계에 필요한 변환을 수행하지만
결제 정책 자체를 대신하지 않는다. 객체 adapter는 합성으로 adaptee를 감싸므로 다중 상속이
필요하지 않다.

## 실전·면접 연결

외부 API 교체 시 변경 범위를 adapter로 가둘 수 있고, 테스트에서는 Target의 가짜 구현을
주입할 수 있다. 변환이 너무 커져 도메인 규칙까지 들어가면 anti-corruption layer 또는
별도 application collaborator가 필요한 신호다.

## 흔한 오해

- Adapter는 기능을 새로 설계하는 Decorator가 아니라 인터페이스 호환을 맞추는 구조다.
- 외부 예외를 그대로 노출하면 내부 코드가 vendor API에 결합된다.
- 단순한 메서드 이름 변경에도 무조건 별도 클래스가 필요한 것은 아니다.
