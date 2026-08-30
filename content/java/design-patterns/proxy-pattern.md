---
kind: concept
contentKey: java.core.design-patterns.proxy-pattern
topicContentKey: java.core.design-patterns
slug: proxy-pattern
title: "Proxy 패턴과 접근 제어"
summary: "대상 객체와 같은 인터페이스 앞에서 지연 로딩·권한·원격 접근을 제어한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/Proxy.html"
    title: "Proxy API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java 동적 proxy의 인터페이스 기반 동작 확인
  - url: "https://refactoring.guru/design-patterns/proxy"
    title: "Proxy Design Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: 실제 대상 접근 전후의 제어 구조 참고
---
# Proxy 패턴과 접근 제어

## 쉬운 진입

권한을 확인한 뒤 실제 파일 저장소에 접근하거나, 처음 요청될 때만 비싼 객체를 만들고 싶다.
클라이언트가 실제 객체인지 proxy인지 몰라도 같은 역할을 호출하게 하면 접근 정책을 한 곳에 둔다.

## 정확한 메커니즘

```text
Client -> DocumentService (interface)
          AuthProxy -> CacheProxy -> RealDocumentService
```

Proxy는 대상과 같은 계약을 제공하고 접근 전후에 권한, 캐시, 지연 생성, 원격 호출 같은
제어를 넣는다. JDK dynamic proxy는 인터페이스 메서드 호출을 `InvocationHandler`로 전달하며,
구체 클래스 proxy가 필요하다는 뜻은 아니다.

## 실전·면접 연결

Proxy와 Decorator는 모두 wrapper지만 의도가 다르다. Proxy의 핵심은 대상 접근 제어이고,
Decorator는 기능을 조합해 계약을 확장하는 데 있다. 트랜잭션/권한 proxy가 예외를 숨기거나
호출 시점을 바꾸면 그 의미를 문서화해야 한다.

## 흔한 오해

- JDK dynamic proxy는 아무 클래스나 상속해 proxy로 만드는 기능이 아니라 인터페이스 기반이다.
- proxy가 있다고 보안이 자동으로 완성되지는 않는다. 실제 대상의 직접 접근 경로도 막아야 한다.
- lazy proxy는 호출 시점에 네트워크/DB 비용이 발생할 수 있다.
