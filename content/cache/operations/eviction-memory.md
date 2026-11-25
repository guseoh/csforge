---
kind: concept
contentKey: cache.core.operations.eviction-memory
topicContentKey: cache.core.operations
slug: eviction-memory
title: "퇴출 정책과 메모리 예산"
summary: "캐시 메모리 한계를 넘을 때 어떤 키를 제거할지 결정하는 퇴출 정책을 작업 집합·캐시 적중률·재생성 비용과 연결한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://redis.io/docs/latest/develop/reference/eviction/"
    title: "Redis Documentation: Key Eviction"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "maxmemory와 LRU/LFU/noeviction 계열 퇴출 정책 확인"
---
# 퇴출 정책과 메모리 예산

캐시는 메모리를 무한히 사용할 수 없습니다. Redis가 `maxmemory` 한계에 도달하면 설정된 **퇴출 정책(eviction policy)**에 따라 일부 키를 제거하거나 새 쓰기를 거부할 수 있습니다. 중요한 점은 **어떤 키가 사라져도 원본에서 다시 만들 수 있어야 한다**는 것입니다.

![Redis 퇴출 · 정책별 후보 집합](/learning/cache/eviction-policy-candidates.svg)

일반 Redis OSS 퇴출 정책의 기본 후보 집합을 단순화했습니다. 보호된 키 등 제품·버전별 추가 조건은 생략합니다. volatile 계열에서 후보가 없으면 메모리를 늘리는 명령이 실패할 수 있습니다.

### 정책은 접근 패턴에 대한 가정이다

최근 사용한 값을 오래 남기고 싶다면 LRU 계열, 자주 사용되는 값을 남기고 싶다면 LFU 계열을 검토할 수 있습니다. `allkeys-*` 계열은 만료 설정 여부와 무관하게 키를 퇴출 후보로 삼고, `volatile-*` 계열은 TTL이 설정된 키만 후보로 삼습니다. 일반적인 volatile 정책에서 후보가 없다면 메모리를 늘리는 명령은 noeviction처럼 거부될 수 있습니다. `maxmemory`는 프로세스 RSS 전체의 절대 상한과 동일하지 않으므로 실제 메모리도 관측합니다.

다만 Redis의 LRU/LFU는 교과서적인 완전 정렬을 그대로 구현하는 것이 아닙니다. LRU는 표본 추출(sampling)을 사용하는 근사 정책이고 LFU도 확률적 카운터와 감쇠를 사용합니다. 따라서 특정 키가 정확히 다음 퇴출 대상이라고 단정하기보다 **전체 부하에서의 캐시 적중률과 퇴출 발생률**을 봐야 합니다.

### 키 개수보다 실제 메모리와 재생성 비용을 본다

큰 값 몇 개가 작은 인기 값을 밀어내면 키 개수는 많지 않아도 캐시 적중률이 크게 떨어질 수 있습니다. 반대로 자주 쓰이지 않는 작은 값이 많아도 실제 **작업 집합(working set)**과 퇴출 특성은 달라집니다.

```text
메모리 압박
   │
   ├─ 퇴출 증가
   ├─ 캐시 미스 증가
   └─ 원본 조회 증가
          │
          └─ DB 부하까지 상승 가능
```

그래서 메모리 사용량, 직렬화된 값의 크기, 퇴출 발생률, 캐시 적중률, 미스 이후 원본 조회 비용을 함께 관측합니다.

### 캐시 쓰기 실패와 원본 쓰기 실패는 다르다

PostgreSQL 커밋이 성공한 뒤 Redis가 `noeviction`이나 장애로 `SET`에 실패했다고 해서 원본 데이터까지 실패한 것은 아닙니다. Cache-Aside 구조라면 다음 조회에서 다시 채우거나 일정 기간 캐시 없이 동작할 수 있습니다.

퇴출 정책을 고르는 핵심은 LRU와 LFU 이름을 외우는 것이 아니라 **제한된 메모리 안에서 어떤 작업 집합을 유지할 때 실제 원본 부하와 사용자 지연 시간이 가장 안정적인지**를 측정하는 것입니다.
