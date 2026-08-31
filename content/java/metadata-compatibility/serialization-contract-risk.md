---
kind: concept
contentKey: java.core.metadata-compatibility.serialization-contract-risk
topicContentKey: java.core.metadata-compatibility
slug: serialization-contract-risk
title: "Serialization contract risk"
summary: "Serializable, transient, serialVersionUID를 high-level contract로 이해하고 native Java deserialization을 신뢰 경계에서 위험한 입력 처리로 본다"
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
# Serialization contract risk

## 쉬운 진입

Serializable을 구현하면 객체 graph를 Java object stream으로 저장하거나 읽을 수 있는
계약에 참여한다. 이는 단순히 모든 field를 안전하게 JSON처럼 보내는 기능이 아니다.
클래스 변경, private state, 신뢰하지 않는 입력을 함께 고려해야 한다.

## 정확한 메커니즘

~~~
final class Session implements Serializable {
    private static final long serialVersionUID = 1L;
    private final String userId;
    private transient String connection;
}
~~~

transient field는 기본 serialization 대상에서 제외되어 deserialize 뒤 기본값을
관찰할 수 있다. serialVersionUID는 compatible class evolution을 판단하는 식별자
계약에 영향을 주므로, 변경 시 어떤 이전 stream을 계속 읽을지 명시한다. 모든 객체가
자동으로 serializable해지는 것이 아니며, graph 안의 non-transient field도 계약을
만족해야 한다.

native Java deserialization은 입력이 공격자 제어일 수 있는 신뢰 경계에서 위험하다.
역직렬화 중 class resolution과 object construction 경로가 실행되므로 허용 class
필터·안전한 포맷·서명/검증 정책을 별도 설계한다. 여기서는 보안 전체가 아니라
Serializable API의 호환성과 trust-boundary 위험만 다룬다.

## 흔한 오해

- transient는 field를 영구 삭제하는 것이 아니라 기본 serialization에서 제외하는 것이다.
- serialVersionUID 하나가 모든 schema migration을 자동으로 해결하지 않는다.
- Serializable 구현이 untrusted byte stream을 안전하게 만든다는 보장은 없다.
