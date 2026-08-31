---
kind: concept
contentKey: backend.core.evolution.migration
topicContentKey: backend.core.evolution
slug: migration
title: "DB migration과 호환 가능한 변경"
summary: "배포 중 구버전과 신버전 애플리케이션이 동시에 존재할 수 있음을 전제로 schema 변경 순서를 설계한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://documentation.red-gate.com/fd"
    title: "Flyway Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "versioned migration과 schema 변경 운영 방식을 참고한다."
---
# DB migration과 호환 가능한 변경

migration은 SQL 파일을 순서대로 실행하는 기능만의 문제가 아니다. rolling deployment나 blue/green 환경에서는 한동안 구버전 애플리케이션과 신버전 애플리케이션이 같은 DB를 사용할 수 있다. 이때 새 코드만 이해하는 파괴적 schema 변경을 먼저 적용하면 구버전 요청이 즉시 깨진다.

### expand → migrate → contract

안전한 변경은 흔히 세 단계로 나눈다.

```text
1. Expand
   새 column/table 추가
   기존 코드도 계속 동작

2. Migrate
   새 코드가 새 구조를 사용
   필요하면 backfill / dual write

3. Contract
   더 이상 사용하지 않는 column 제거
```

예를 들어 `name`을 `first_name`, `last_name`으로 나누고 싶다면 기존 `name`을 즉시 삭제하지 않는다. 새 column을 추가하고, 데이터를 채우고, 애플리케이션 읽기/쓰기를 전환한 뒤 실제 사용이 사라졌음을 확인하고 제거한다.

### schema 변경도 transaction/lock 비용이 있다

큰 table의 `ALTER`, index 생성, backfill은 장시간 lock이나 IO를 만들 수 있다. 개발 DB에서 1초 걸린 migration이 production에서도 1초라는 보장은 없다. row 수, lock mode, online index 지원 여부를 확인해야 한다.

### migration은 되돌리기보다 앞으로 고치는 경우가 많다

이미 여러 환경에 적용된 migration 파일을 수정하면 history가 갈라진다. 새 migration으로 correction을 추가하는 편이 재현성과 감사 가능성을 지키기 쉽다.

핵심은 schema를 단일 순간에 바꾸는 것이 아니라 **실행 중인 여러 버전과 데이터 상태 사이의 호환 구간**을 설계하는 것이다.
