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
  - url: "https://documentation.red-gate.com/fd/versioned-migrations-273973333.html"
    title: "Flyway: Versioned Migrations"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "적용된 versioned migration의 checksum 이력과 forward-only correction 원칙을 참고한다."
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

### 구버전 쓰기와 backfill이 겹치면 생기는 문제

```text
시각   구버전 서버(name 사용)           backfill / 신버전 서버
t1     id=42 name="김철수"              first_name=NULL, last_name=NULL
t2                                     backfill → "김", "철수"
t3     id=42 name="박영희" 로 수정      first_name="김", last_name="철수" (낡음)
t4                                     신버전이 first/last로 읽으면 불일치
```

위 사례에서 backfill의 완료 표시만 믿고 새 column으로 읽기를 바꾸면 **같은 row의 두 표현이 달라질 수 있습니다.** 공존 기간에는 어느 표현이 authoritative한지 명확히 정해야 합니다. 가능한 방식으로는 구버전 쓰기를 중단할 수 있는 시점까지 기존 column을 기준으로 읽고 새 column을 반복 catch-up하는 방법, 모든 활성 writer가 호환되게 두 표현을 원자적으로 갱신하도록 배포하는 방법 등이 있습니다. 어느 방식을 선택하든 이전 데이터를 다시 적용해도 안전한 backfill과 **동시 쓰기 경합 시 갱신 손실을 막는 규칙**이 필요합니다.

신규 표현으로 전환하기 전에는 구버전 writer가 더는 값을 덮어쓰지 않는지, 두 표현의 동등성 검증과 미처리 변경분 대조가 끝났는지 확인합니다. 계약 단계는 구버전 배포로 되돌릴 수 있는 기간이 끝난 뒤에 수행해야 합니다. `dual write`라는 단어만 붙였다고 두 column이 자동으로 일치하거나 rollback이 안전해지는 것은 아닙니다.

### schema 변경도 transaction/lock 비용이 있다

큰 table의 `ALTER`, index 생성, backfill은 장시간 lock이나 IO를 만들 수 있다. 개발 DB에서 1초 걸린 migration이 production에서도 1초라는 보장은 없다. row 수, lock mode, online index 지원 여부를 확인해야 한다.

### migration은 되돌리기보다 앞으로 고치는 경우가 많다

이미 여러 환경에 적용된 migration 파일을 수정하면 history가 갈라진다. 새 migration으로 correction을 추가하는 편이 재현성과 감사 가능성을 지키기 쉽다.

핵심은 schema를 단일 순간에 바꾸는 것이 아니라 **실행 중인 여러 버전과 데이터 상태 사이의 호환 구간**을 설계하는 것이다.
