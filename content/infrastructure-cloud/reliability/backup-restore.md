---
kind: concept
contentKey: infrastructure.core.reliability.backup-restore
topicContentKey: infrastructure.core.reliability
slug: backup-restore
title: "백업·복구와 RPO/RTO"
summary: "backup 파일이 존재하는 것과 실제 서비스 복구 가능성을 구분하고 RPO·RTO를 기준으로 복구 시점, 순서와 restore test를 설계한다."
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
# 백업·복구와 RPO/RTO

Backup job이 성공했다는 로그만으로 장애 때 서비스를 복구할 수 있다고 말할 수는 없습니다. **얼마나 최근 시점까지 데이터를 되살려야 하는지(RPO), 얼마 안에 서비스를 다시 제공해야 하는지(RTO)**를 먼저 정하고 실제 restore가 그 목표를 만족하는지 확인해야 합니다.

```text
장애 시점: 18:00
마지막 복구 가능 시점: 17:45
→ RPO 관점의 데이터 손실 범위 약 15분

복구 시작: 18:05
서비스 정상화: 19:00
→ 실제 복구 시간 약 55분
```

### Replica와 backup은 실패를 막는 범위가 다르다

Replica는 primary 장애 시 빠르게 전환하거나 read workload를 분산하는 데 도움이 될 수 있습니다. 하지만 잘못된 DELETE나 잘못된 application write 역시 replica에 복제될 수 있습니다.

```text
사용자 실수 DELETE
primary ─▶ replica에도 반영
```

이런 실패에서 이전 상태로 돌아가려면 독립된 backup, versioning, point-in-time recovery 같은 별도 복구 수단이 필요합니다.

### 복구는 DB 하나만 되살리는 작업이 아닐 수 있다

서비스 상태가 DB, object storage, secret, schema version에 걸쳐 있다면 복구 순서도 함께 설계해야 합니다.

```text
1. 필요한 storage/DB 복구
2. schema/application version 호환성 확인
3. secret·configuration 연결
4. application 시작
5. 핵심 read/write 검증
6. traffic 복귀
```

DB backup은 성공했지만 object storage의 사용자 파일이 없거나 현재 application이 복구된 schema를 읽지 못한다면 서비스는 아직 복구된 것이 아닙니다.

### Restore test가 backup을 검증한다

Backup을 오랫동안 실제로 열어 보지 않으면 손상, 권한 누락, 암호화 key 문제, 문서와 다른 복구 절차를 장애 당일에 처음 발견할 수 있습니다. 격리된 환경에서 정기적으로 restore하고 실제 걸린 시간과 핵심 데이터 검증 결과를 기록해야 합니다.

백업의 핵심 지표는 파일 개수가 아니라 **원하는 시점의 데이터를 실제로 복원하고, 의존성을 맞춰 서비스가 목표 시간 안에 다시 동작하는가**입니다.
