---
kind: concept
contentKey: java.core.exceptions-resources.autocloseable-resource-ownership
topicContentKey: java.core.exceptions-resources
slug: autocloseable-resource-ownership
title: "AutoCloseable과 자원 소유권"
summary: "자원을 획득한 코드와 빌려 쓰는 코드, framework가 관리하는 자원의 책임을 구분해 올바른 위치에서 close한다"
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/AutoCloseable.html"
    title: "Java SE 25 API: AutoCloseable"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: AutoCloseable close 계약 확인
---
# AutoCloseable과 자원 소유권

`AutoCloseable` 객체를 봤다고 무조건 현재 메서드에서 `close()`해야 하는 것은 아닙니다. 반대로 “프레임워크가 알아서 한다”는 이유로 직접 연 자원을 닫지 않아도 되는 것도 아닙니다. 핵심은 **이 자원의 생명주기를 누가 소유하는가**입니다.

### 직접 열었다면 보통 같은 범위에서 정리한다

```java
try (InputStream in = Files.newInputStream(path)) {
    return in.readAllBytes();
}
```

현재 메서드가 stream을 직접 획득했고 밖으로 넘기지 않는다면 같은 범위에서 닫는 것이 자연스럽습니다.

### 빌린 자원을 마음대로 닫으면 호출자를 깨뜨릴 수 있다

```java
void write(OutputStream out) throws IOException {
    out.write(data);
    // out.close(); // 이 메서드가 소유자가 아니라면 위험
}
```

호출자가 여러 데이터를 이어 쓰기 위해 `OutputStream`을 전달했다면 내부 메서드가 닫아 버리는 순간 이후 작업이 실패합니다. 이 경우 API 계약에 “이 메서드가 닫는가, 호출자가 닫는가”가 분명해야 합니다.

### framework가 관리하는 자원은 framework 계약을 따른다

Spring의 transaction-bound connection이나 container가 관리하는 stream처럼 외부 framework가 생명주기를 관리하는 자원도 있습니다. 이런 경우 일반 Java 규칙만 보고 직접 close하면 관리 체계를 깨뜨릴 수 있습니다.

```text
직접 획득
코드 ── open ──> resource
코드 <─ close ──┘

빌린 자원
owner ── open ──> resource
             ▲
             └─ borrower는 사용만
owner <─ close ──┘
```

### 반환값으로 자원을 넘기면 책임도 함께 넘긴다

```java
InputStream openFile(Path path) throws IOException {
    return Files.newInputStream(path);
}
```

이 메서드는 stream을 닫지 않고 반환합니다. 대신 호출자가 사용 후 닫아야 한다는 계약이 필요합니다. 문서, 타입, 사용 예시에서 ownership이 드러나야 누수가 줄어듭니다.

### 자원은 메모리 객체만의 문제가 아니다

열린 파일 descriptor, socket, DB connection 같은 외부 자원은 GC가 언젠가 객체를 회수할 것이라고 기대해서 관리하면 안 됩니다. 필요 시점이 끝났을 때 명시적으로 release해야 시스템 자원이 고갈되지 않습니다.

### 문제를 풀 때 확인할 것

1. 누가 자원을 열었는가?
2. 자원을 다른 코드에 넘겼다면 ownership도 넘겼는가?
3. framework가 관리하는 자원인가?
4. 예외가 발생해도 close 경로가 보장되는가?

`AutoCloseable`을 외우는 것보다 **소유권과 생명주기**를 추적하는 것이 실제 백엔드 코드에서 더 중요합니다.
