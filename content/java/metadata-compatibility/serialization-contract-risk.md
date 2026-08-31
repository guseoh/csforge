---
kind: concept
contentKey: java.core.metadata-compatibility.serialization-contract-risk
topicContentKey: java.core.metadata-compatibility
slug: serialization-contract-risk
title: "Serialization contract risk"
summary: "Java native serialization이 객체 graph를 byte stream으로 저장하는 계약이라는 점과 transient·serialVersionUID·신뢰하지 않는 역직렬화의 위험을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/Serializable.html"
    title: "Java SE 25 API: Serializable"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Serializable marker와 compatibility 개요 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/specs/serialization/index.html"
    title: "Java Object Serialization Specification"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: object stream format·version·security contract 확인
---
# Java 객체를 그대로 저장하면 왜 장기 계약이 생길까

`Serializable`을 구현하면 Java 객체 graph를 object stream 형태로 기록하고 나중에 다시 객체로 복원할 수 있습니다. 겉으로는 편리하지만, 이는 단순히 "객체를 byte[]로 바꾸는 기능"이 아니라 **class 구조와 object state를 stream 형식에 연결하는 장기 계약**을 만듭니다.

그래서 native Java serialization은 새 backend API의 일반 데이터 포맷으로 가볍게 선택하기보다 호환성과 보안 위험을 먼저 이해해야 합니다.

### Serializable은 marker interface다

```java
final class Session implements Serializable {
    private static final long serialVersionUID = 1L;

    private String userId;
    private transient Connection connection;
}
```

`Serializable`에는 직접 구현해야 할 일반 method가 없습니다. Class가 Java serialization protocol에 참여할 수 있음을 표시하는 marker interface입니다.

하지만 root 객체 하나만 Serializable이면 graph 전체가 무조건 성공하는 것은 아닙니다.

```text
Session
 ├─ userId: String          -> serializable
 └─ profile: CustomProfile  -> 이 field도 serialization 가능해야 함
```

기본 serialization 대상에 포함되는 참조가 serializable하지 않으면 runtime에 실패할 수 있습니다.

### `transient`는 "저장하지 않을 field"를 표시한다

```java
private transient Connection connection;
```

`transient` field는 기본 serialization에서 제외됩니다.

Deserialization 후에는 stream에서 복원된 값이 없으므로 field type의 기본값 상태를 만나게 됩니다.

```text
reference type -> null
int            -> 0
boolean        -> false
```

따라서 `transient`를 단순히 "민감 정보 숨기기" 키워드라고 이해하면 부족합니다. 복원 후 어떤 값을 다시 만들어야 하는지 object invariant와 함께 봐야 합니다.

예를 들어 DB connection이나 thread pool 같은 runtime resource를 serialized state로 저장하는 것은 자연스럽지 않습니다. 복원 후 새 runtime dependency를 연결하는 별도 lifecycle이 필요합니다.

### `serialVersionUID`는 class와 stream의 호환성 판단에 사용된다

```java
private static final long serialVersionUID = 1L;
```

Serializable class에는 serialization version을 식별하는 `serialVersionUID`가 있습니다.

명시하지 않으면 class 구조를 바탕으로 계산된 값이 사용될 수 있는데, class 변경에 따라 값이 달라져 예전 stream을 읽지 못할 수 있습니다.

그래서 장기 저장/호환성이 필요하다면 version을 명시적으로 관리하는 편이 의도를 분명히 할 수 있습니다.

하지만:

> `serialVersionUID`를 1L로 고정하면 어떤 class 변경도 모두 compatible하다.

는 뜻이 아닙니다.

Field 추가/삭제, type 변경, class hierarchy 변경, custom read/write logic 등 실제 serialization compatibility 규칙을 함께 봐야 합니다.

### Stream은 class 구조와 강하게 결합된다

REST API에서 JSON DTO를 사용할 때는 외부 contract를 field 이름과 schema 중심으로 비교적 명시적으로 설계할 수 있습니다.

Native Java serialization은 Java class 구조와 긴밀하게 연결됩니다.

```text
Java class v1
     │
     ▼
serialized bytes
     │
시간 경과
     │
     ▼
Java class v2
```

v2가 예전 bytes를 읽어야 한다면 binary/serialization compatibility 문제가 생깁니다.

이 때문에 DB나 message broker에 수년간 저장되는 장기 canonical format으로 Java native serialization을 선택하면 class refactoring이 곧 data migration 문제로 이어질 수 있습니다.

### Deserialization은 단순 data parsing보다 더 위험한 신뢰 경계다

가장 중요한 보안 포인트입니다.

신뢰하지 않는 사용자가 만든 byte stream을 `ObjectInputStream`으로 그대로 읽는 것은 위험할 수 있습니다. Deserialization 과정에서는 stream이 가리키는 class를 resolve하고 object graph를 복원하며 class별 serialization hook이 실행될 여지가 있습니다.

```text
untrusted bytes
      │
      ▼
ObjectInputStream
      │ class resolution
      │ object graph reconstruction
      ▼
runtime objects / code paths
```

과거 Java ecosystem의 여러 deserialization 취약점은 공격자가 예상하지 않은 class graph와 code path를 이용할 수 있다는 점에서 발생했습니다.

그래서 외부 사용자 입력, HTTP body, 신뢰하지 않는 message를 Java native deserialization로 직접 처리하는 것은 피하는 것이 기본적인 보안 판단입니다.

### ObjectInputFilter가 있다고 아무 stream이나 안전해지는 것은 아니다

Java에는 deserialization filter를 사용해 허용 class, graph 크기 같은 제한을 둘 수 있는 API가 있습니다. Legacy serialization을 반드시 받아야 하는 경우 방어층으로 사용할 수 있습니다.

하지만 filter를 추가했다고:

> 이제 모든 untrusted object stream을 안전하게 받을 수 있다.

라고 결론내리면 안 됩니다.

가능하면 입력 schema가 명확한 JSON/CBOR/Protocol Buffers 같은 데이터 포맷과 명시적인 DTO validation을 사용하고, Java object graph 자체를 외부 protocol로 노출하지 않는 것이 더 단순한 trust boundary가 됩니다.

### Serialization과 일반 JSON serialization을 같은 것으로 부르지 않는다

Spring/Jackson에서 "serialization"이라는 단어도 사용합니다.

```text
Jackson JSON serialization
Java object -> JSON text/data

Java native serialization
Serializable object graph -> Java Object Stream format
```

둘 다 객체를 외부 표현으로 바꾸지만 포맷, compatibility, security model이 다릅니다.

`Serializable`을 구현하지 않았다고 Jackson이 JSON을 만들 수 없는 것도 아니고, Jackson JSON DTO를 쓴다고 Java native deserialization 위험을 그대로 가진다는 뜻도 아닙니다.

### `writeObject/readObject`로 custom behavior를 넣으면 계약이 더 복잡해진다

Serializable class는 custom `writeObject`, `readObject` 같은 hook으로 기본 동작을 바꿀 수 있습니다.

이 경우:

- class invariant를 복원하는가
- validation이 필요한가
- stream version을 어떻게 처리하는가
- 예외 발생 시 partially initialized object가 문제되지 않는가

를 함께 봐야 합니다.

Custom serialization은 강력하지만 유지보수 계약도 커집니다.

### 실무에서 native serialization을 만날 수 있는 곳

새 시스템에서 직접 선택하지 않더라도 다음과 같은 legacy/infra 경계에서 만날 수 있습니다.

- 오래된 HTTP/session clustering 설정
- legacy cache/session persistence
- RMI/old Java integration
- 저장된 binary artifact
- third-party library 내부

이때 "이미 쓰이고 있으니 안전하다"보다 data source를 누가 제어하는지와 class version compatibility를 먼저 확인합니다.

### 문제를 풀 때 확인할 것

1. `Serializable` root가 참조하는 전체 graph도 serialization 가능한지 봅니다.
2. `transient` field가 복원 후 어떤 값이 되는지 확인합니다.
3. `serialVersionUID`가 모든 schema 변경을 자동 해결한다고 생각하지 않습니다.
4. Stored stream이 얼마나 오래 살아야 하는지 봅니다.
5. Deserialization input을 누가 만들 수 있는지 trust boundary를 확인합니다.
6. Java native serialization과 JSON serialization을 구분합니다.
7. Untrusted bytes에는 명시적인 data schema/safer format을 우선 검토합니다.

### 면접에서 설명한다면

`Serializable`은 Java object stream serialization에 참여한다는 marker interface입니다. 기본 대상에서 제외할 field는 `transient`로 표시할 수 있고, `serialVersionUID`는 serialized form과 class version compatibility 판단에 영향을 줍니다. 하지만 native serialization은 Java class 구조와 강하게 결합되고, 특히 신뢰하지 않는 byte stream의 deserialization은 object graph 복원 과정에서 보안 위험이 크기 때문에 외부 입력 포맷으로는 신중하게 다뤄야 합니다.
