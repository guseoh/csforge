---
kind: concept
contentKey: database.core.schema.foreign-key
topicContentKey: database.core.schema
slug: foreign-key
title: "Foreign key와 참조 무결성"
summary: "외래 키가 부모 row 존재와 삭제·변경 정책을 DB에서 보장하는 이유를 이해하고 CASCADE·RESTRICT·SET NULL을 aggregate lifecycle과 조회 경로에 맞춰 선택한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK"
    title: "PostgreSQL Documentation: Foreign Keys"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: foreign key와 referential action 계약 확인
---
# Foreign key와 참조 무결성

애플리케이션 코드에서 `memberRepository.existsById(memberId)`를 확인한 뒤 주문을 저장하면 안전해 보입니다. 하지만 확인과 INSERT 사이에 다른 transaction이 회원을 삭제할 수도 있고, 다른 import/script가 애플리케이션 코드를 우회해 데이터를 넣을 수도 있습니다. Foreign key는 **어떤 write 경로를 거치든 DB가 최종 참조 무결성을 검사**하게 합니다.

```sql
CREATE TABLE orders (
    id        BIGINT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    CONSTRAINT fk_orders_member
        FOREIGN KEY (member_id)
        REFERENCES member(id)
);
```

존재하지 않는 `member_id`로 INSERT하면 DB가 거부합니다.

### 삭제 정책은 문법 선택이 아니라 lifecycle 정책이다

부모가 삭제될 때 자식을 어떻게 할지는 관계 의미에 따라 다릅니다.

| 정책                     | 의미를 검토할 상황                                         |
| ------------------------ | ---------------------------------------------------------- |
| `RESTRICT` / `NO ACTION` | 자식이 남아 있으면 부모 삭제 자체를 막아야 함              |
| `CASCADE`                | 자식이 부모의 lifecycle에 완전히 종속되어 함께 사라져야 함 |
| `SET NULL`               | 관계가 끊겨도 자식 row 자체는 독립적으로 의미가 있음       |

예를 들어 주문 이력까지 회원 삭제와 함께 `CASCADE`로 지우는 것이 법적·업무 요구에 맞는지는 별도 판단입니다. ORM에서 `cascade = ALL`을 썼다는 이유로 DB foreign key의 `ON DELETE CASCADE`까지 기계적으로 맞추면 안 됩니다. 둘은 동작 계층도 다릅니다.

### 참조하는 column의 index는 별도 판단이다

PostgreSQL은 referenced primary/unique key 쪽에는 index가 있지만, foreign key를 선언했다고 **참조하는 쪽 column에 자동으로 index를 만들어 주지는 않습니다.**

```sql
CREATE INDEX idx_orders_member_id
ON orders(member_id);
```

회원별 주문 조회가 빈번하거나 부모 삭제 시 child 확인 비용이 중요하다면 이 index가 유용할 수 있습니다. 반대로 사용하지 않는 index는 write 비용과 저장 공간을 늘립니다. 접근 패턴과 query plan을 보고 결정합니다.

### application validation과 DB constraint는 경쟁 관계가 아니다

API에서 “존재하지 않는 회원입니다”처럼 친절한 오류를 빨리 주기 위해 application check를 할 수 있습니다. 그래도 마지막 race를 막는 authoritative constraint는 DB에 둘 수 있습니다.

```text
API/application check
  └─ 빠르고 친절한 오류

DB foreign key
  └─ 모든 write 경로의 최종 무결성
```

이 두 층을 구분하면 “이미 service에서 검사했으니 FK는 필요 없다”와 “FK가 있으니 사용자 오류 처리는 필요 없다”라는 양쪽 극단을 피할 수 있습니다.
