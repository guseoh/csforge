---
kind: concept
contentKey: database.core.model.normalization
topicContentKey: database.core.model
slug: normalization
title: "정규화와 중복이 만드는 변경 문제"
summary: "반복 데이터를 무조건 나누는 규칙으로 외우지 않고 하나의 사실이 여러 row에 중복될 때 생기는 update·insert·delete anomaly를 줄이는 구조화 과정으로 이해한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/ddl-constraints.html"
    title: "PostgreSQL Documentation: Constraints"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 정규화된 schema에서 key와 참조 무결성을 표현하는 DB constraint 확인
---
# 정규화와 중복이 만드는 변경 문제

정규화를 “1NF, 2NF, 3NF를 순서대로 외우는 것”으로 시작하면 왜 필요한지 놓치기 쉽습니다. 먼저 **하나의 사실을 여러 곳에 복사해 둘 때 어떤 변경 문제가 생기는가**를 봐야 합니다.

주문 row마다 회원 이메일을 그대로 저장한다고 해 봅시다.

```text
order_id │ member_id │ member_email       │ total
─────────┼───────────┼────────────────────┼──────
101      │ 7         │ old@example.com    │ 12000
102      │ 7         │ old@example.com    │ 18000
103      │ 7         │ old@example.com    │  9000
```

회원 7의 이메일이 변경되면 세 row를 모두 바꿔야 합니다. 한 row를 놓치면 같은 회원이 서로 다른 이메일을 갖는 모순이 생깁니다. 이것이 update anomaly의 전형적인 모습입니다.

### 사실의 소유 위치를 분리한다

```text
member
member_id │ email
──────────┼─────────────────
7         │ new@example.com

orders
order_id │ member_id │ total
─────────┼───────────┼──────
101      │ 7         │ 12000
102      │ 7         │ 18000
```

회원의 현재 이메일이라는 사실은 `member`가 소유하고 주문은 `member_id`로 참조합니다. 그러면 이메일 변경은 한 곳에서 일어납니다.

```sql
ALTER TABLE orders
ADD CONSTRAINT fk_orders_member
FOREIGN KEY (member_id) REFERENCES member(member_id);
```

외래 키는 애플리케이션이 실수로 존재하지 않는 회원을 참조하는 것도 DB에서 막아 줍니다.

### 그렇다고 중복이 언제나 잘못은 아니다

주문 시점의 배송 주소나 상품명 snapshot은 이후 원본이 바뀌어도 과거 주문 기록이 유지되어야 할 수 있습니다. 이때 중복은 anomaly가 아니라 **의도한 역사적 snapshot**입니다.

```text
현재 회원 주소     ≠     주문 당시 배송 주소 snapshot
```

따라서 “중복을 발견하면 무조건 table을 분리한다”가 아니라 그 값이 **현재 원본 사실인지, 시점별 기록인지**를 구분해야 합니다.

### denormalization은 조회 편의와 쓰기 책임을 교환한다

측정 결과 복잡한 JOIN이나 aggregate가 병목이고 읽기 성능 요구가 명확하다면 일부 값을 중복 저장할 수 있습니다. 다만 그 순간부터 “원본이 바뀌면 복사본을 누가 언제 동기화하는가?”라는 새 책임이 생깁니다. 캐시나 materialized projection과 같은 관점으로 관리해야 합니다.

정규화의 목적은 table 수를 늘리는 것이 아니라 **한 사실의 authoritative location을 명확히 하고 변경 시 모순 가능성을 줄이는 것**입니다.
