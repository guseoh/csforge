---
kind: concept
contentKey: java.core.metadata-compatibility.serialization-contract-risk
topicContentKey: java.core.metadata-compatibility
slug: serialization-contract-risk
title: "직렬화가 만드는 장기 계약"
summary: "Java 내장 직렬화가 객체 그래프를 바이트 스트림으로 저장하는 계약이라는 점과 transient·serialVersionUID·신뢰하지 않는 역직렬화의 위험을 이해한다"
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
# 직렬화가 만드는 장기 계약

`Serializable`을 구현하면 Java 객체 그래프를 Object Stream에 기록했다가 나중에 객체로 복원할 수 있습니다. 편리하지만 단순히 객체를 `byte[]`로 바꾸는 기능이 아니라 **Java 클래스 구조와 저장된 바이너리 데이터 사이에 장기 호환성 계약을 만드는 기능**입니다.

### `Serializable`은 직렬화 참여를 표시하는 마커 인터페이스다

```java
final class Session implements Serializable {
    private static final long serialVersionUID = 1L;

    private String userId;
    private transient Connection connection;
}
```

`Serializable` 자체에는 구현해야 할 일반 메서드가 없습니다. 클래스가 Java Object Serialization 프로토콜에 참여할 수 있음을 표시합니다.

다만 루트 객체만 `Serializable`을 구현한다고 객체 그래프 전체가 항상 직렬화되는 것은 아닙니다. 기본 직렬화 대상 필드가 참조하는 객체도 직렬화할 수 있어야 합니다.

### `transient`는 기본 직렬화 상태에서 필드를 제외한다

```java
private transient Connection connection;
```

`transient` 필드는 기본 직렬화 대상에서 제외됩니다. 따라서 기본 역직렬화만으로는 스트림에서 값이 복원되지 않고 해당 타입의 기본값이 됩니다. 복원 후 필요한 실행 시점 상태는 `readObject` 같은 사용자 정의 후크에서 다시 만들어야 합니다.

이를 "민감한 필드를 숨기는 키워드" 정도로만 이해해서는 부족합니다. DB 연결이나 스레드 풀 같은 실행 자원은 저장된 객체 상태와 같은 생명주기를 갖지 않으므로 복원 후 어떻게 다시 연결할지 별도로 설계해야 합니다.

### `serialVersionUID`는 모든 변경을 호환되게 만드는 스위치가 아니다

```java
private static final long serialVersionUID = 1L;
```

`serialVersionUID`는 직렬화 형식과 현재 클래스의 버전 호환성을 판단하는 데 사용됩니다. 값을 명시하지 않으면 클래스 구조를 바탕으로 계산될 수 있어 작은 클래스 변경도 이전 스트림과의 호환성에 영향을 줄 수 있습니다.

하지만 값을 계속 `1L`로 고정한다고 모든 구조 변경이 안전해지는 것은 아닙니다. 필드 타입, 상속 계층, 사용자 정의 직렬화 로직 등 실제 직렬화 형식과 복원 후 불변 조건이 호환되어야 합니다.

### 네이티브 직렬화는 Java 클래스 구조와 강하게 결합된다

```text
Java 클래스 v1
      │
      ▼
serialized stream
      │ 저장
      ▼
Java 클래스 v2
      │
      ▼
예전 stream 복원 가능?
```

데이터를 수년간 DB나 메시지 브로커에 저장하는 형식으로 네이티브 직렬화를 쓰면 클래스 리팩터링이 데이터 호환성과 이전 문제로 이어질 수 있습니다.

따라서 새 백엔드의 외부 API나 장기 보존 기준 데이터에는 스키마를 더 명시적으로 관리할 수 있는 형식을 우선 검토하는 편이 안전합니다.

### 신뢰할 수 없는 역직렬화는 보안 경계 문제다

Java 25 `ObjectInputStream` API는 **신뢰할 수 없는 데이터의 역직렬화가 본질적으로 위험하므로 피해야 한다**고 명시합니다.

```text
신뢰할 수 없는 바이트
      │
      ▼
ObjectInputStream
      │
클래스 해석
객체 그래프 복원
      │
      ▼
실행 시점 객체·코드 경로
```

역직렬화는 단순한 문자열 파싱이 아니라 클래스 해석과 객체 그래프 복원을 수행합니다. 예상하지 못한 클래스 그래프와 직렬화 후크가 실행 경로에 참여할 수 있으므로 외부 사용자 입력이나 신뢰할 수 없는 메시지를 Java 네이티브 역직렬화로 직접 받지 않는 것이 기본 원칙입니다.

### 직렬화 필터는 방어층일 뿐 신뢰 경계를 없애지 않는다

Java의 `ObjectInputFilter` 등으로 허용할 클래스와 그래프 규모를 제한할 수 있습니다. 기존 Object Stream을 반드시 처리해야 할 때 유용한 방어층입니다.

하지만 필터가 있다고 해서 임의의 신뢰할 수 없는 스트림을 일반 입력 형식처럼 받아도 된다는 뜻은 아닙니다. 가능하면 허용 스키마가 분명한 데이터 형식과 DTO 검증을 사용해 **받을 수 있는 데이터 형태 자체를 제한하는 것**이 더 단순한 경계입니다.

### Java 네이티브 직렬화와 JSON 직렬화는 서로 다른 계약이다

```text
Jackson JSON
Java 객체 -> JSON 문서

Java 네이티브 직렬화
Serializable 객체 그래프 -> Object Stream
```

둘 다 직렬화라고 부르지만 형식, 클래스 결합도, 호환성, 보안 모델이 다릅니다. `Serializable`을 구현하지 않아도 Jackson으로 JSON을 만들 수 있고, JSON DTO를 사용한다고 네이티브 객체 역직렬화의 위험을 그대로 갖는 것도 아닙니다.

### 정리

Java 네이티브 직렬화(native serialization)는 `Serializable` 객체 그래프를 Object Stream에 저장하는 프로토콜이며 클래스 구조와 장기 호환성 계약을 만듭니다. `transient`는 기본 직렬화 상태에서 필드를 제외하고, `serialVersionUID`는 호환성 판단에 참여하지만 모든 클래스 변경을 자동으로 안전하게 만들지는 않습니다. Java 공식 API도 신뢰할 수 없는 Object Stream의 역직렬화가 위험하다고 경고하므로, 외부 입력에는 명시적인 스키마와 더 좁은 신뢰 경계를 우선해야 합니다.
