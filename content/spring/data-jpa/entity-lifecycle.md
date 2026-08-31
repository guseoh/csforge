---
kind: concept
contentKey: spring.core.data-jpa.entity-lifecycle
topicContentKey: spring.core.data-jpa
slug: entity-lifecycle
title: "Entity lifecycle과 persistence context"
summary: "JPA entity의 new/managed/detached/removed 상태와 persistence context identity/dirty checking을 구분하고 Java field 변경이 언제 SQL과 연결되는지 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html"
    title: "Jakarta Persistence 3.2 Specification"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "entity lifecycle, persistence context, managed/detached/removed semantics의 specification 확인"
  - url: "https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html"
    title: "Spring Data JPA Reference: Persisting Entities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "Spring Data save가 persist/merge를 선택하는 기본 동작 확인"
---
# Entity lifecycle과 persistence context

JPA entity는 단순 POJO이지만 `EntityManager`/persistence context와 관계를 맺는 순간 **provider가 identity와 변경 추적을 관리하는 상태**가 생깁니다. 같은 Java class라도 현재 persistence context에 의해 관리되는지에 따라 field 변경이 DB와 연결되는 방식이 달라집니다.

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

### managed 상태에서 dirty checking이 동작한다

```java
@Transactional
public void rename(long id, String name) {
    Member member = entityManager.find(Member.class, id);
    member.rename(name);
}
```

`find`가 반환한 entity가 현재 persistence context의 managed instance라면 provider는 transaction flush 과정에서 변경을 감지해 UPDATE SQL을 생성할 수 있습니다.

```text
SELECT member
   │
   ▼
managed Member snapshot/tracking
   │ Java field change
   ▼
flush 시 change detection
   │
   ▼
UPDATE SQL
```

여기서 `rename()`을 호출하는 순간 바로 DB network I/O가 일어난다고 단정하면 안 됩니다. flush 시점은 transaction commit, explicit flush, query execution 조건 등과 provider behavior에 따라 연결됩니다.

### persistence context는 같은 identity의 managed instance를 관리한다

같은 persistence context에서 같은 entity identity를 반복 조회하면 provider가 같은 managed instance identity를 유지할 수 있습니다. 이것이 흔히 1차 캐시라고 설명되는 동작과 연결됩니다.

```java
Member a = em.find(Member.class, 1L);
Member b = em.find(Member.class, 1L);
System.out.println(a == b); // 같은 persistence context의 managed identity 의미와 연결
```

하지만 이 사실을 “JPA는 DB query를 항상 한 번만 한다”로 일반화하면 안 됩니다. JPQL/criteria query, refresh, clear, 다른 context 등 조건이 달라집니다.

### detached entity는 Java object일 뿐 자동 dirty checking 대상이 아니다

transaction/context가 끝난 뒤 entity reference를 들고 있어도 그 instance가 현재 persistence context에 관리되지 않으면 field를 바꿨다고 자동으로 UPDATE되는 것은 아닙니다.

```java
Member detached = ...;
detached.rename("new"); // 현재 context에서 managed가 아니라면 자동 추적 대상 아님
```

`merge()`는 detached instance 자체를 다시 managed로 붙이는 단순 연산이라고 외우기보다, state를 managed instance로 복사하고 **반환되는 managed instance가 별도일 수 있음**을 이해해야 합니다.

```java
Member managed = em.merge(detached);
```

### Entity lifecycle과 domain lifecycle은 다른 개념이다

JPA의 `managed/detached`는 persistence 상태입니다. 주문의 `CREATED/PAID/CANCELLED`는 business lifecycle입니다.

| JPA lifecycle                    | Domain lifecycle     |
| -------------------------------- | -------------------- |
| persistence context가 관리하는가 | 업무 상태가 무엇인가 |
| persist/merge/remove             | pay/cancel/ship      |
| provider/JPA contract            | domain invariant     |

두 층을 섞으면 `setStatus()`를 persistence 편의 때문에 열어두거나 detached를 “취소된 주문”처럼 업무 상태로 오해하게 됩니다.

JPA entity를 이해할 때 중요한 것은 annotation 목록보다 **현재 object가 persistence context와 어떤 관계인지, Java 상태 변경이 언제 SQL/transaction과 연결되는지**를 추적하는 것입니다.
