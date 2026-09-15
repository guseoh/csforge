---
kind: concept
contentKey: system-design.core.requirements.capacity-data
topicContentKey: system-design.core.requirements
slug: capacity-data
title: "용량 추정과 데이터 규모"
summary: "QPS·payload·read/write 비율·보존 기간·성장률을 대략적인 수치로 연결해 어떤 규모가 architecture 선택을 바꾸는지 판단한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://sre.google/sre-book/service-best-practices/"
    title: "Google SRE Book: Production Services Best Practices"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "user-visible SLO와 capacity planning·load testing 연결 확인"
  - url: "https://docs.aws.amazon.com/pdfs/wellarchitected/latest/performance-efficiency-pillar/wellarchitected-performance-efficiency-pillar.pdf"
    title: "AWS Well-Architected Framework: Performance Efficiency Pillar"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "architecture·compute·data·network 선택을 workload에 연결하는 관점 확인"
---
# 용량 추정과 데이터 규모

용량 추정은 미래의 정확한 숫자를 맞히는 일이 아닙니다. 현재 알고 있는 사용자 수, 요청 빈도, payload 크기와 데이터 보존 기간을 이용해 **어느 정도 규모를 준비해야 하고 어떤 가정이 설계를 바꾸는지** 찾는 작업입니다.

먼저 같은 단위로 바꿔 봅니다. 하루 8,640만 건이면 하루 평균은 약 1,000 QPS지만 실제 traffic은 특정 시간에 몰릴 수 있으므로 peak 배수를 따로 잡아야 합니다. 한 요청이 DB query 여러 개나 downstream fan-out을 만든다면 외부 요청 수와 내부 작업량도 같지 않습니다.

```text
user requests
   ↓
peak QPS
   ↓
queries / messages / bytes
   ↓
storage growth + downstream load
```

데이터 규모도 record 수만으로 결정되지 않습니다. Record 평균 크기, index, history·audit 보존, replica와 backup까지 포함하면 실제 storage는 원본 데이터보다 커집니다. 반대로 모든 숫자를 처음부터 매우 정밀하게 계산할 필요는 없습니다. 초기 설계에서는 10GB인지 10TB인지처럼 order of magnitude가 선택을 바꾸는 경우가 더 중요합니다.

추정값에는 가정을 남깁니다. 예를 들어 `평균 1KB`, `peak는 평균의 5배`, `1년 보존`처럼 적어 두면 나중에 실제 telemetry와 비교해 틀린 가정을 수정할 수 있습니다.

용량 추정의 목적은 미리 sharding이나 특정 기술을 정답으로 고르는 것이 아닙니다. 현재 규모에서는 단순한 구조가 충분한지, load test가 필요한 경계가 어디인지, 어떤 수치가 커지면 architecture를 다시 검토해야 하는지를 찾는 데 있습니다.
