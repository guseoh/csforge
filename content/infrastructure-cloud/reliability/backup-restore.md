---
kind: concept
contentKey: infrastructure.core.reliability.backup-restore
topicContentKey: infrastructure.core.reliability
slug: backup-restore
title: "backup·restore와 RPO/RTO"
summary: "backup 존재와 실제 복구 가능성을 구분하고 RPO/RTO와 restore test를 설계한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://csrc.nist.gov/pubs/sp/800/34/r1/final"
    title: "NIST SP 800-34 Rev. 1: Contingency Planning Guide"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "backup·recovery planning과 복구 절차 확인"
  - url: "https://www.postgresql.org/docs/current/continuous-archiving.html"
    title: "PostgreSQL Documentation: Continuous Archiving and PITR"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "database backup와 point-in-time recovery 참고"
---
# backup·restore와 RPO/RTO

backup job이 매일 성공했다는 로그는 복구 가능성의 증명이 아닙니다. RPO(얼마나 최신 데이터까지 복구해야 하는가)와 RTO(얼마나 빨리 서비스를 복구해야 하는가)를 정하고 그 목표를 만족하는 backup·replication·restore 절차를 검증해야 합니다.

```text
장애 시점 t
  ├─ 마지막 usable backup = t-24h -> RPO 24h 가능
  └─ restore + validation = 3h    -> RTO 3h 필요
```

### backup과 replica는 역할이 다르다

replica는 읽기 scale과 failover에 도움을 줄 수 있지만 잘못된 DELETE나 corruption을 함께 복제할 수 있습니다. 별도 backup과 보존 기간, immutable copy, point-in-time recovery가 필요한 이유입니다.

### restore는 dependency 순서를 가진다

DB만 복구해도 secret, schema migration, object file, message offset, DNS와 application version이 맞지 않으면 서비스가 완전히 살아나지 않습니다. 정기적으로 isolated environment에 restore하고 checksum·row count·핵심 read/write와 application compatibility를 확인합니다.

### 문제를 풀 때 확인할 것

1. 목표 RPO/RTO와 실제 backup cadence를 비교합니다.
2. replica와 independent backup을 구분합니다.
3. backup integrity·암호화·접근 권한·retention을 봅니다.
4. DB·object·secret·schema recovery 순서를 그립니다.
5. restore drill 결과와 실제 복구 시간을 기록합니다.

### 면접에서 설명한다면

Backup은 존재 자체보다 목표 RPO/RTO를 만족하며 실제 restore 가능한지가 중요합니다. Replica는 failover에 유용해도 corruption과 실수까지 복제할 수 있으므로 independent backup·보존·point-in-time recovery를 둡니다. 복구에는 DB뿐 아니라 schema·object·secret·application version과 검증 절차가 필요합니다.

