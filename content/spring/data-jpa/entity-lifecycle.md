---
kind: concept
contentKey: spring.core.data-jpa.entity-lifecycle
topicContentKey: spring.core.data-jpa
slug: entity-lifecycle
title: "Entity 생명주기와 영속성 컨텍스트"
summary: "JPA Entity의 new/managed/detached/removed 상태와 영속성 컨텍스트의 객체 정체성·변경 감지를 구분하고 Java 객체의 상태 변경이 언제 SQL과 연결되는지 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html"
    title: "Jakarta Persistence 3.2 Specification"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Entity 생명주기, 영속성 컨텍스트, managed/detached/removed 상태의 명세 확인"
  - url: "https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html"
    title: "Spring Data JPA Reference: Persisting Entities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "Spring Data `save()`가 `persist`/`merge`를 선택하는 기본 동작 확인"
---
# Entity 생명주기와 영속성 컨텍스트

JPA Entity는 Java 객체이지만 `EntityManager`와 영속성 컨텍스트의 관리 대상이 되면 **JPA provider가 객체 정체성과 변경을 추적하는 상태**가 생깁니다. 같은 Java 클래스의 객체라도 현재 영속성 컨텍스트가 관리하는지에 따라 필드 변경이 DB와 연결되는 방식이 달라집니다.

```text
new / transient
   │ persist
   ▼
managed
   │ detach/clear/context close
   ▼
detached

managed ── remove ──► removed
```

### managed 상태에서는 변경 감지(dirty checking)가 동작한다

```java
@Transactional
public void rename(long id, String name) {
    Member member = entityManager.find(Member.class, id);
    member.rename(name);
}
```

`find()`가 반환한 Entity가 현재 영속성 컨텍스트의 managed 객체라면 JPA provider는 flush 과정에서 변경을 감지해 UPDATE SQL을 만들 수 있습니다.

```text
SELECT member
   │
   ▼
managed Member 변경 추적
   │ Java 상태 변경
   ▼
flush 시 변경 감지
   │
   ▼
UPDATE SQL
```

여기서 `rename()`을 호출하는 순간 바로 DB 네트워크 I/O가 일어난다고 단정하면 안 됩니다. SQL 반영은 트랜잭션 commit 전 flush, 명시적 `flush()`, 쿼리 실행에 앞선 flush 등 여러 조건과 JPA provider의 동작에 따라 이어질 수 있습니다.

### 영속성 컨텍스트는 같은 Entity 식별자의 managed 객체 정체성을 관리한다

같은 영속성 컨텍스트에서 같은 Entity 식별자를 반복 조회하면 같은 managed 객체를 돌려받을 수 있습니다. 이것이 흔히 1차 캐시와 함께 설명되는 동작입니다.

```java
Member a = em.find(Member.class, 1L);
Member b = em.find(Member.class, 1L);
System.out.println(a == b);
```

하지만 이를 “JPA는 DB 쿼리를 항상 한 번만 실행한다”로 일반화하면 안 됩니다. JPQL·Criteria 쿼리, `refresh()`, `clear()`, 다른 영속성 컨텍스트 등 조건이 달라지면 동작도 달라집니다.

### detached Entity는 현재 영속성 컨텍스트의 변경 감지 대상이 아니다

트랜잭션이나 영속성 컨텍스트가 끝난 뒤 Entity 참조를 계속 가지고 있어도 그 객체가 현재 컨텍스트의 managed 상태가 아니라면 필드를 바꿨다고 자동으로 UPDATE되는 것은 아닙니다.

```java
Member detached = ...;
detached.rename("new"); // 현재 컨텍스트의 managed 객체가 아니라면 자동 변경 감지 대상이 아님
```

`merge()`는 detached 객체 자체를 그대로 managed 상태로 되돌리는 단순 연산이라고 외우기보다, detached 객체의 상태를 managed 객체에 복사하고 **반환된 managed 객체가 원래 객체와 다른 객체일 수 있다**는 점을 이해해야 합니다.

```java
Member managed = em.merge(detached);
```

### JPA 생명주기와 도메인 생명주기는 다른 개념이다

JPA의 `managed/detached`는 영속성 관리 상태입니다. 주문의 `CREATED/PAID/CANCELLED`는 업무 상태입니다.

| JPA 생명주기                    | 도메인 생명주기                  |
| ------------------------------- | -------------------------------- |
| 영속성 컨텍스트가 관리하는가    | 현재 업무 상태가 무엇인가        |
| persist/merge/remove            | pay/cancel/ship                  |
| JPA provider와 명세의 계약      | 도메인 불변식과 상태 전이 규칙   |

두 층을 섞으면 JPA 편의를 위해 `setStatus()`를 열어두거나 detached 상태를 “취소된 주문” 같은 업무 상태로 오해할 수 있습니다.

JPA Entity를 이해할 때 중요한 것은 annotation 목록보다 **현재 객체가 영속성 컨텍스트와 어떤 관계인지, Java 상태 변경이 언제 SQL과 트랜잭션으로 이어지는지**를 추적하는 것입니다.
