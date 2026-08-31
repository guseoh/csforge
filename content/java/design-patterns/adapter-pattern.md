---
kind: concept
contentKey: java.core.design-patterns.adapter-pattern
topicContentKey: java.core.design-patterns
slug: adapter-pattern
title: "Adapter로 외부 인터페이스와 경계 분리하기"
summary: "외부 라이브러리나 다른 인터페이스를 애플리케이션이 기대하는 계약으로 변환해 내부 코드가 외부 세부에 직접 묶이지 않게 한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "JLS 9 Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 인터페이스 기반 계약의 언어 규칙 확인
---
# Adapter로 외부 인터페이스와 경계 분리하기

외부 라이브러리나 오래된 코드가 제공하는 메서드 형태가 우리 애플리케이션이 원하는 계약과 다를 수 있습니다. 호출 코드마다 외부 API 형식에 맞추는 변환을 반복하면 내부 로직이 그 외부 기술에 퍼져서 의존하게 됩니다.

Adapter는 **한쪽의 인터페이스를 다른 쪽이 기대하는 형태로 바꾸는 경계 객체**입니다.

```java
interface MessageSender {
    void send(String receiver, String message);
}
```

외부 SDK가 다음처럼 전혀 다른 API를 제공한다고 해 보겠습니다.

```java
externalClient.deliver(new VendorRequest(receiver, message));
```

Adapter가 변환을 맡을 수 있습니다.

```java
class VendorMessageAdapter implements MessageSender {
    private final VendorClient client;

    @Override
    public void send(String receiver, String message) {
        client.deliver(new VendorRequest(receiver, message));
    }
}
```

```text
Application
   │ MessageSender
   ▼
Adapter
   │ VendorRequest로 변환
   ▼
외부 SDK
```

### 경계를 보호한다는 것이 핵심이다

외부 SDK의 DTO와 예외 타입이 서비스 계층 전체에 퍼지면 SDK를 교체할 때 많은 코드를 수정해야 합니다. Adapter에서 입력·출력과 예외를 애플리케이션 의미로 변환하면 영향 범위를 줄일 수 있습니다.

### 데이터 변환만 한다고 항상 Adapter는 아니다

DTO mapper도 데이터를 변환하지만 모든 변환 클래스를 디자인 패턴의 Adapter라고 부를 필요는 없습니다. 핵심은 **호환되지 않는 인터페이스 사이를 연결해 호출자가 기대하는 계약을 유지하는가**입니다.

### 실무 예시

- 결제 PG SDK를 내부 `PaymentGateway` 계약으로 감싸기
- 외부 스토리지 API를 내부 파일 저장 계약으로 변환하기
- 오래된 인터페이스를 새 인터페이스에 맞추기

외부 기술에 대한 의존이 한 경계로 모여야 실제 교체와 테스트가 쉬워집니다.
