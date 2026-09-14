---
kind: concept
contentKey: java.core.design-patterns.decorator-pattern
topicContentKey: java.core.design-patterns
slug: decorator-pattern
title: "Decorator로 책임을 겹쳐 붙이기"
summary: "같은 계약을 유지한 wrapper를 합성해 부가 책임을 조합하고, wrapper 순서·예외·상태가 실제 호출 의미를 어떻게 바꾸는지 추적한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/FilterInputStream.html"
    title: "Java SE 25 API: FilterInputStream"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java I/O에서 다른 stream을 감싸는 대표적인 합성 구조 참고
---
# Decorator로 책임을 겹쳐 붙이기

기존 객체의 핵심 역할은 유지하면서 로깅, 측정, 압축처럼 **선택적인 책임을 조합해서 추가**하고 싶을 수 있습니다. 기능 조합마다 하위 클래스를 만들면 조합 수가 빠르게 늘어납니다.

Decorator는 **원본과 같은 계약을 구현하는 wrapper가 같은 계약의 다른 객체를 감싸는 구조**로 이 문제를 해결합니다.

```java
interface DataReader {
    byte[] read();
}

final class LoggingReader implements DataReader {
    private final DataReader delegate;

    LoggingReader(DataReader delegate) {
        this.delegate = delegate;
    }

    @Override
    public byte[] read() {
        System.out.println("read start");
        try {
            return delegate.read();
        } finally {
            System.out.println("read end");
        }
    }
}
```

호출자는 계속 `DataReader`를 사용하고 wrapper는 여러 겹 조합할 수 있습니다.

```java
DataReader reader = new LoggingReader(
        new CachingReader(
                new FileDataReader(path)
        )
);
```

```text
Client
  │
  ▼
LoggingReader
  │
  ▼
CachingReader
  │
  ▼
FileDataReader
```

## 같은 계약을 유지하기 때문에 조합할 수 있다

Decorator 자신도 `DataReader`이고 내부의 delegate도 `DataReader`입니다. 그래서 원본 대신 Decorator를 사용할 수 있고, Decorator 위에 다시 다른 Decorator를 감쌀 수 있습니다.

다만 같은 인터페이스를 구현한다는 사실만으로 행동 계약이 자동으로 지켜지는 것은 아닙니다. Decorator가 반환값이나 예외 의미를 바꾼다면 그 변화가 원래 계약과 양립하는지 확인해야 합니다.

## wrapper 순서는 실제 의미를 바꿀 수 있다

다음 두 조합은 같은 두 Decorator를 사용하지만 호출 범위가 다릅니다.

```java
new MetricsReader(new RetryReader(target));
```

```java
new RetryReader(new MetricsReader(target));
```

첫 번째는 바깥 Metrics가 논리적인 호출 한 번을 측정하고 내부에서 Retry가 여러 번 시도할 수 있습니다. 두 번째는 각 재시도마다 Metrics를 다시 통과할 수 있습니다.

```text
Metrics(Retry(target))
→ 요청 1회 측정, 내부 시도 여러 번 가능

Retry(Metrics(target))
→ 각 시도가 측정 대상이 될 수 있음
```

즉 “조합할 수 있다”는 말이 “순서가 중요하지 않다”는 뜻은 아닙니다. 어떤 wrapper가 어느 호출 범위를 감싸는지를 추적해야 합니다.

## 추가 책임이 상태를 가지면 그 수명도 본다

캐시나 카운터처럼 Decorator가 가변 상태를 가진다면 여러 호출자가 같은 Decorator를 공유할 때 그 상태도 공유됩니다. 패턴 자체가 thread-safety를 보장하지 않으므로 **추가한 책임이 어떤 상태를 가지고 누가 공유하는지**를 별도로 설계해야 합니다.

Java I/O의 `FilterInputStream` 계열처럼 다른 스트림을 감싸는 API에서도 비슷한 합성 구조를 볼 수 있습니다.

Decorator와 Proxy는 클래스 구조가 닮았지만 목적이 다릅니다. Decorator는 **기능을 조합해 덧붙이는 것**이 중심이고, Proxy는 **실제 대상에 접근하는 시점이나 조건을 중개하는 것**이 중심입니다. 구조보다 wrapper가 존재하는 이유를 보면 구분하기 쉽습니다.
