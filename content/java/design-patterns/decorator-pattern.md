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

기존 객체의 핵심 역할은 유지하면서 로깅, 압축, 캐시, 측정처럼 선택적인 책임을 덧붙이고 싶을 수 있습니다. 상속으로 모든 조합을 만들면 기능 축이 늘어날수록 class 조합도 빠르게 늘어납니다.

```text
FileReader
LoggingFileReader
CachingFileReader
LoggingCachingFileReader
CompressedLoggingCachingFileReader
...
```

Decorator는 이 조합 문제를 **같은 계약을 구현하는 wrapper가 다른 같은 계약의 객체를 감싸는 구조**로 해결합니다.

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

호출자는 `DataReader`만 알고 있고 wrapper를 여러 겹 조합할 수 있습니다.

```java
DataReader reader = new LoggingReader(
        new CachingReader(
                new FileDataReader(path)
        )
);
```

```text
Client
  │ read()
  ▼
LoggingReader
  │ read()
  ▼
CachingReader
  │ read()
  ▼
FileDataReader
```

### “같은 interface”가 중요한 이유는 대체 가능한 조합에 있다

Decorator가 원본과 같은 계약을 제공하면 호출자는 원본인지 wrapper인지 구분하지 않고 사용할 수 있습니다. 그리고 wrapper 자신도 `DataReader`를 받으므로 다른 Decorator를 다시 감쌀 수 있습니다.

이 구조는 상속보다 **합성(composition)** 에 가깝습니다. 각 책임은 독립 object가 되고 실행 시 원하는 조합을 만들 수 있습니다.

하지만 같은 interface를 구현했다는 사실만으로 계약이 자동으로 유지되지는 않습니다.

```java
final class UppercaseReader implements TextReader {
    private final TextReader delegate;

    @Override
    public String read() {
        return "FIXED";
    }
}
```

이 wrapper가 “delegate가 읽은 text를 대문자로 바꾼다”고 약속했다면 원본을 전혀 사용하지 않고 고정 값을 반환하는 구현은 같은 interface를 구현해도 의미 계약을 깨뜨립니다. **구조적 대체 가능성과 행동 계약은 별개**입니다.

### wrapper 순서는 실제 실행 범위를 바꾼다

Decorator의 가장 중요한 reasoning 포인트 중 하나는 중첩 순서입니다. 다음 두 조합은 타입만 보면 모두 `DataReader`지만 의미가 다를 수 있습니다.

```java
new MetricsReader(
    new RetryReader(target)
);
```

```java
new RetryReader(
    new MetricsReader(target)
);
```

`RetryReader`가 실패 시 target을 한 번 더 호출하고 `MetricsReader`가 delegate 호출 직전에 count를 1 증가시킨다고 해 보겠습니다.

첫 번째 조합에서는 Metrics가 바깥에 있으므로 **논리적인 client 요청 한 번**을 측정하고 내부 Retry가 target을 두 번 시도할 수 있습니다.

```text
Client
 -> Metrics +1
    -> Retry
       -> target 실패
       -> target 성공
```

두 번째 조합에서는 Retry가 바깥에 있으므로 각 시도마다 Metrics를 다시 통과합니다.

```text
Client
 -> Retry
    -> Metrics +1 -> target 실패
    -> Metrics +1 -> target 성공
```

같은 두 Decorator를 썼는데도 metric은 1과 2로 달라집니다. 그래서 “조합 가능하다”는 말은 “순서가 중요하지 않다”는 뜻이 아닙니다. **각 wrapper가 어느 호출 범위를 감싸는지**를 직접 추적해야 합니다.

### 호출 전·후·예외 경로를 함께 봐야 한다

Decorator는 단순히 delegate 호출 전에 한 줄 추가하는 패턴이 아닙니다. 부가 책임은 다음 세 위치 중 어디에 들어가는지에 따라 의미가 달라집니다.

```java
before();
try {
    R result = delegate.call();
    afterSuccess(result);
    return result;
} catch (RuntimeException e) {
    afterFailure(e);
    throw e;
} finally {
    always();
}
```

예를 들어 stopwatch를 성공 경로에만 멈추면 예외 발생 호출의 시간이 누락될 수 있습니다. cache decorator가 실패도 cache하면 다음 호출의 의미가 달라질 수 있습니다. transaction처럼 보이는 wrapper가 예외를 삼켜 버리면 바깥 wrapper가 실패를 인지하지 못할 수도 있습니다.

따라서 각 Decorator가 **반환값, exception, side effect를 어떻게 보존하거나 변경하는지** 명확해야 합니다.

### Decorator가 state를 가지면 공유 수명도 고려해야 한다

```java
class CachingReader implements DataReader {
    private final DataReader delegate;
    private byte[] cached;
}
```

이 객체를 여러 호출자가 공유하면 `cached`도 공유 상태입니다. 이것이 의도한 cache라면 괜찮을 수 있지만, 요청별 데이터가 섞이면 문제입니다. Counter나 retry 횟수 같은 mutable state가 있는 Decorator를 singleton처럼 공유하면 thread-safety도 별도로 고려해야 합니다.

Decorator 패턴 자체는 thread-safe를 보장하지 않습니다. **wrapper가 추가한 책임이 어떤 state를 소유하는지**를 확인해야 합니다.

### Java I/O는 wrapper 합성의 대표적인 예를 보여 준다

`FilterInputStream` 계열처럼 다른 stream을 감싸는 API에서는 buffering, data 변환 같은 기능을 조합하는 구조를 볼 수 있습니다. 중요한 것은 모든 Java I/O class를 GoF Decorator 이름으로 분류하는 것이 아니라, 실제로 **같은 stream 역할을 유지하면서 다른 stream에 위임하고 책임을 추가하는 구조**를 읽는 것입니다.

### Proxy와 구조는 비슷하지만 설계 의도가 다르다

Decorator와 Proxy 모두 같은 계약을 구현하고 target/delegate를 가질 수 있습니다.

```text
Client -> Wrapper -> Target
```

일반적으로 Decorator는 **기능을 조합해 추가하는 것**이 중심이고 Proxy는 **실제 대상에 접근하는 시점이나 조건을 중개·제어하는 것**이 중심입니다.

예를 들어 `CompressionReader`, `MetricsReader`는 기능 조합에 가깝고, 권한 검사 후에만 실제 repository를 호출하거나 실제 객체 생성을 늦추는 wrapper는 Proxy 의도가 더 강합니다. 실제 코드에서는 둘이 겹칠 수 있으므로 class 이름보다 **왜 wrapper가 존재하는가**를 봐야 합니다.

### 독립적인 변화 축이 있을 때 합성의 가치가 커진다

로깅과 압축이 서로 독립적으로 켜지고 꺼질 수 있다면 Decorator 조합은 자연스럽습니다. 반대로 항상 함께 실행되는 두 줄짜리 고정 로직을 각각 interface와 Decorator class로 분리하면 구조만 복잡해질 수 있습니다.

Decorator를 선택할 때는 다음을 묻는 편이 좋습니다. 원래 component의 역할은 그대로 유지되는가, 추가 책임이 독립적으로 조합될 필요가 있는가, wrapper 순서가 결과나 측정 범위를 어떻게 바꾸는가, 그리고 추가한 state와 exception 정책이 기존 계약을 깨뜨리지 않는가를 확인합니다.

패턴의 장점은 wrapper class를 많이 만드는 데 있지 않습니다. **호출 흐름의 한 층씩 책임을 분리하면서도 client가 같은 역할을 계속 사용할 수 있게 하는 것**이 핵심입니다.
