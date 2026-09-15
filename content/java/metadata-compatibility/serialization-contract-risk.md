---
kind: concept
contentKey: java.core.metadata-compatibility.serialization-contract-risk
topicContentKey: java.core.metadata-compatibility
slug: serialization-contract-risk
title: "Serialization이 만드는 장기 계약"
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
  - url: "https://techblog.woowahan.com/2550/"
    title: "자바 직렬화, 그것이 알고싶다. 훑어보기편"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: native serialization을 장기 데이터 계약과 운영 위험 관점에서 보충
---
# Serialization이 만드는 장기 계약

`Serializable`을 구현하면 Java object graph를 object stream으로 기록하고 나중에 다시 객체로 복원할 수 있습니다. 편리해 보이지만 이는 단순히 객체를 `byte[]`로 바꾸는 기능이 아니라 **Java class 구조와 저장된 binary data 사이에 장기 compatibility 계약을 만드는 기능**입니다.

### `Serializable`은 serialization 참여를 표시하는 marker interface다

```java
final class Session implements Serializable {
    private static final long serialVersionUID = 1L;

    private String userId;
    private transient Connection connection;
}
```

`Serializable` 자체에는 구현해야 할 일반 method가 없습니다. Class가 Java Object Serialization protocol에 참여할 수 있음을 표시합니다.

다만 root 객체만 Serializable이라고 object graph 전체가 항상 성공하는 것은 아닙니다. 기본 serialization 대상에 포함된 field가 가리키는 객체 역시 serialization 가능한 형태여야 합니다.

### `transient`는 기본 serialized state에서 제외한다

```java
private transient Connection connection;
```

`transient` field는 기본 serialization 대상에서 제외됩니다. 따라서 deserialization 후에는 stream에서 복원된 값이 없고 해당 type의 기본값 상태가 됩니다.

이것을 "민감한 field를 숨기는 키워드" 정도로 이해하면 부족합니다. DB connection, thread pool 같은 runtime resource는 애초에 저장된 object state와 같은 lifecycle을 가지지 않으므로 복원 후 어떻게 다시 연결할지를 별도로 설계해야 합니다.

### `serialVersionUID`는 모든 변경을 호환되게 만드는 스위치가 아니다

```java
private static final long serialVersionUID = 1L;
```

`serialVersionUID`는 serialized form과 현재 class의 version compatibility 판단에 사용됩니다. 명시하지 않으면 class 구조를 바탕으로 계산된 값이 사용될 수 있어 작은 class 변경도 예전 stream과의 호환성에 영향을 줄 수 있습니다.

그러나 값을 계속 `1L`로 고정한다고 어떤 구조 변경도 안전해지는 것은 아닙니다. Field type, hierarchy, custom serialization logic 등 실제 serialized form과 복원 invariant가 compatible해야 합니다.

### Native serialization은 Java class 구조와 강하게 결합된다

```text
Java class v1
      │
      ▼
serialized stream
      │ 저장
      ▼
Java class v2
      │
      ▼
예전 stream 복원 가능?
```

수년간 DB나 broker에 저장되는 format으로 native serialization을 쓰면 class refactoring이 곧 data compatibility와 migration 문제로 이어질 수 있습니다.

그래서 새 backend의 외부 API나 장기 canonical data에는 schema를 더 명시적으로 관리할 수 있는 format을 우선 검토하는 편이 보통 더 안전합니다.

### 신뢰하지 않는 deserialization은 보안 경계다

Java 25 `ObjectInputStream` API는 **untrusted data deserialization이 본질적으로 위험하므로 피해야 한다**고 명시합니다.

```text
untrusted bytes
      │
      ▼
ObjectInputStream
      │
class resolution
object graph reconstruction
      │
      ▼
runtime objects / code paths
```

역직렬화는 단순 문자열 parsing이 아니라 class resolution과 object graph 복원을 수행합니다. 예상하지 않은 class graph와 serialization hook이 실행 경로에 참여할 수 있기 때문에 외부 사용자 입력이나 신뢰하지 않는 message를 native Java deserialization로 직접 받는 설계는 피하는 것이 기본입니다.

### Serialization filter는 방어층이지 신뢰 경계를 없애지 않는다

Java는 `ObjectInputFilter` 등을 통해 허용 class나 graph 규모를 제한할 수 있습니다. Legacy object stream을 반드시 처리해야 하는 경우 유용한 방어층입니다.

하지만 filter가 있다고 arbitrary untrusted stream을 일반 입력 포맷처럼 받아도 된다는 뜻은 아닙니다. 가능하면 허용 schema가 명확한 데이터 포맷과 DTO validation을 사용해 **받을 수 있는 데이터 형태 자체를 좁히는 것**이 더 단순한 경계입니다.

### Java native serialization과 JSON serialization은 다른 계약이다

```text
Jackson JSON
Java object -> JSON document

Java native serialization
Serializable object graph -> Object Stream
```

둘 다 serialization이라는 단어를 쓰지만 포맷, class coupling, compatibility, security model이 다릅니다. `Serializable`을 구현하지 않아도 Jackson으로 JSON을 만들 수 있고, JSON DTO를 사용한다고 native object deserialization의 위험을 그대로 가지는 것도 아닙니다.

### 정리

Java native serialization은 `Serializable` object graph를 Object Stream에 저장하는 protocol이며 class 구조와 장기 compatibility 계약을 만듭니다. `transient`는 기본 serialized state에서 field를 제외하고, `serialVersionUID`는 compatibility 판단에 참여하지만 모든 class 변경을 자동으로 안전하게 만들지는 않습니다. 특히 신뢰하지 않는 object stream의 deserialization은 Java 공식 API도 위험하다고 경고하므로 외부 입력에는 명시적인 schema와 더 좁은 trust boundary를 우선하는 것이 중요합니다.
