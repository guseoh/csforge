---
kind: concept
contentKey: database.core.mvcc.cleanup
topicContentKey: database.core.mvcc
slug: cleanup
title: "VACUUM과 old version cleanup"
summary: "MVCC가 남긴 dead tuple을 VACUUM이 즉시 파일 축소가 아니라 재사용 가능한 공간으로 정리하고, long-running transaction과 autovacuum 지연이 bloat·transaction ID 관리에 미치는 영향을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/routine-vacuuming.html"
    title: "PostgreSQL Documentation: Routine Vacuuming"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: dead row recovery, statistics, visibility map, transaction ID wraparound 관련 VACUUM 역할 확인
---
# VACUUM과 old version cleanup

MVCC는 reader와 writer의 충돌을 줄이는 대신 UPDATE와 DELETE 뒤에 **더 이상 최신 상태가 아닌 tuple version**을 남길 수 있습니다. 이 old/dead tuple을 영원히 보관하면 table과 index가 계속 비대해집니다. PostgreSQL의 VACUUM은 이런 version을 재사용 가능한 공간으로 회수하고 MVCC 운영에 필요한 metadata를 관리합니다.

### UPDATE가 많은 table에서는 dead tuple이 쌓인다

```text
account #1
version A: balance 100   → old
version B: balance 120   → old
version C: balance 90    → current
```

어떤 active snapshot도 A와 B를 볼 필요가 없다고 판단할 수 있어야 안전하게 정리할 수 있습니다.

### VACUUM은 보통 OS 파일 크기를 즉시 줄이는 작업이 아니다

일반 VACUUM은 dead tuple 공간을 table 내부에서 **향후 INSERT/UPDATE가 재사용할 수 있게** 합니다. `VACUUM FULL`은 table을 재작성해 물리 파일을 줄일 수 있지만 훨씬 강한 lock과 추가 공간/시간 비용이 있으므로 routine operation과 다릅니다.

```text
일반 VACUUM
[dead][live][dead][live]
   ↓      ↓
[free][live][free][live]

파일 자체는 유지, 내부 공간 재사용
```

### long-running transaction이 cleanup을 막을 수 있다

```text
T1: 오래된 snapshot ────────────────────────────────┐
                                                     │
T2/T3/T4: UPDATE 반복 → old versions 증가          │
                                                     │
VACUUM: T1이 볼 수도 있는 version은 제거 불가 ◄─────┘
```

“idle in transaction” connection 하나가 table bloat를 키우는 이유가 여기 있습니다. 단순히 transaction timeout만의 문제가 아니라 oldest snapshot horizon을 오래 붙잡을 수 있습니다.

### autovacuum은 선택 기능이 아니라 MVCC 운영의 핵심이다

PostgreSQL은 autovacuum으로 vacuum/analyze를 자동 수행합니다. table마다 변경량과 workload가 다르기 때문에 매우 큰 hot table에서는 default threshold가 충분한지 관측해야 할 수 있습니다. dead tuple, last_autovacuum, table size, transaction age 같은 지표를 함께 봅니다.

VACUUM은 “DB 청소 명령” 한 줄이 아니라 **MVCC가 concurrency를 위해 지불한 version 비용을 회수하는 lifecycle 단계**입니다.
