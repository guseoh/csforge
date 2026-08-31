---
kind: concept
contentKey: java.core.design-patterns.decorator-pattern
topicContentKey: java.core.design-patterns
slug: decorator-pattern
title: "Decorator로 책임을 겹쳐 붙이기"
summary: "원래 객체와 같은 계약을 유지하면서 로깅·검증·압축처럼 추가 책임을 합성으로 감싸는 구조를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/FilterInputStream.html"
    title: "Java SE 25 API: FilterInputStream"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java I/O에서 다른 stream을 감싸는 대표 구조 참고
---
# Decorator로 책임을 겹쳐 붙이기

기존 객체의 핵심 동작은 유지하면서 로깅, 압축, 캐싱 같은 기능을 선택적으로 덧붙이고 싶을 수 있습니다. 상속으로 모든 조합을 만들면 클래스 수가 빠르게 늘어납니다.

Decorator는 **원래 객체와 같은 계약을 구현하면서 내부에 같은 계약의 객체를 가지고 호출을 위임**합니다.

```java
interface DataReader {
    byte[] read();
}

class LoggingReader implements DataReader {
    private final DataReader target;

    @Override
    public byte[] read() {
        System.out.println("read start");
        return target.read();
    }
}
```

여러 decorator를 겹칠 수도 있습니다.

```text
호출자
  │
  ▼
LoggingDecorator
  │
  ▼
CachingDecorator
  │
  ▼
RealReader
```

### 조합이 유연해진다

상속으로 `LoggingCachingReader`, `CompressedLoggingReader` 같은 모든 조합을 만들지 않아도 필요에 따라 객체를 감쌀 수 있습니다.

```java
DataReader reader = new LoggingReader(
        new CachingReader(new FileReader(...))
);
```

### 순서가 결과에 영향을 줄 수 있다

Decorator를 여러 개 겹치면 어떤 책임이 먼저 실행되는지가 중요할 수 있습니다. 캐시 바깥에 로깅을 둘 때와 안쪽에 둘 때 측정되는 호출 수가 달라질 수 있습니다.

따라서 조합 가능하다는 이유만 보고 순서를 무시하면 안 됩니다.

### Proxy와 무엇이 다른가

구조만 보면 둘 다 target을 감쌀 수 있습니다. 일반적으로 Decorator는 **기능을 조합해 추가하는 것**에 초점이 있고 Proxy는 대상 접근을 중개하거나 제어하는 역할에 초점이 있습니다. 실제 코드는 둘의 경계가 겹칠 수 있으므로 이름보다 책임을 보는 편이 좋습니다.

Java I/O stream 계층에서 여러 stream을 감싸는 구조를 보면 이런 합성 아이디어를 실제 API에서 확인할 수 있습니다.
