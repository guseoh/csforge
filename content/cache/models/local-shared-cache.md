---
kind: concept
contentKey: cache.core.models.local-shared-cache
topicContentKey: cache.core.models
slug: local-shared-cache
title: "로컬 캐시와 공유 캐시의 최신성 경계"
summary: "인스턴스별 로컬(L1) 복사본과 공유(L2) 캐시가 서로 다른 수명을 가지는 이유를 이해하고 무효화 누락·연결 단절 뒤 오래된 값의 사용을 제한한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://redis.io/docs/latest/develop/reference/client-side-caching/"
    title: "Redis Documentation: Client-side caching reference"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Redis Tracking의 무효화 알림, 응답 경쟁 상태와 연결 끊김 시 로컬 캐시 비우기 계약을 확인한다."
    displayOrder: 1
    relationNote: "Redis 키 변경에 대한 서버 보조 로컬 캐시 무효화와 연결 복구의 조건 확인"
  - url: "https://docs.spring.io/spring-framework/reference/integration/cache.html"
    title: "Spring Framework Reference: Cache Abstraction"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Spring Cache 추상화와 실제 캐시 제공자·갱신/무효화 책임을 구분한다."
    displayOrder: 2
    relationNote: "메서드 캐싱 선언만으로 프로세스 간 복사본 일관성이 자동 제공되지 않는 경계 확인"
---
# 로컬 캐시와 공유 캐시의 최신성 경계

인기 데이터를 Redis에서 반복해서 읽을 때 네트워크 호출조차 줄이려고 애플리케이션 프로세스의 메모리에 작은 로컬 캐시를 둘 수 있습니다. 한 인스턴스만 있을 때는 편리하지만, 인스턴스 A와 B가 각각 같은 키를 복사하면 **Redis의 값이 바뀌었다고 두 JVM 안의 복사본까지 자동으로 바뀌지는 않습니다.** 이 문제는 캐시 히트율이 아니라 복사본의 소유권과 변경 전파의 문제입니다.

```text
                    ┌─ App A: L1 concept:42 = v1
클라이언트 요청 ────┤
                    └─ App B: L1 concept:42 = v1
                              │ L1 미스
                              ▼
                      Redis L2: v1
                              │ L2 미스
                              ▼
                      PostgreSQL 원본: v1
```

L1은 JVM마다 따로 존재하므로 인스턴스가 종료되면 사라집니다. 공유 Redis(L2)는 여러 인스턴스가 같은 키를 조회하도록 돕지만 기준 데이터베이스를 대신하지는 않습니다. L1 히트는 Redis·DB에 접근하지 않으므로 빠를 수 있는 대신, **조회한 복사본이 최신이라는 증거도 얻지 못합니다.** 모든 데이터에 L1을 추가할 필요는 없습니다. 업데이트가 드물고 짧은 오래됨을 허용하며 L2 네트워크 비용이 실제 병목인 경우에만 추가 비용을 감수할 가치가 있습니다.

### 쓰기 뒤에는 캐시 계층마다 갱신 경로가 필요하다

PostgreSQL 원본이 v2로 커밋된다고 가정하겠습니다. 작성자가 L2의 `concept:42`를 무효화했더라도 A와 B의 L1이 v1을 계속 보관한다면 각 인스턴스의 다음 요청에서는 오래된 값이 반환될 수 있습니다.

```text
T1  App A/B L1 = v1, Redis L2 = v1, DB = v1
T2  DB v2 COMMIT
T3  Redis L2의 v1 무효화
T4  App A는 L1 v1 히트 ─▶ 오래된 응답
T5  App B에 무효화 전달 ─▶ B의 L1 삭제
```

여기서 Redis의 **클라이언트 측 캐싱(Client-side caching) Tracking**은 Redis 키를 읽은 클라이언트에 해당 키의 변경을 알리는 선택적 메커니즘입니다. 클라이언트는 알림을 받으면 자신의 L1 키를 제거할 수 있습니다. 그러나 이것은 **Redis 키의 변경 알림**이지 PostgreSQL 커밋을 직접 관측하는 분산 트랜잭션이 아닙니다. DB 변경 뒤 Redis 무효화 자체가 실패하거나 늦어지면 Redis와 모든 L1에 v1이 남을 수 있습니다. 따라서 원본 DB→L2 무효화와 L2→L1 전파의 실패 경계를 각각 생각해야 합니다.

### 연결 단절에서 놓친 무효화를 어떻게 다룰까

App A가 Redis 무효화 알림을 받는 연결을 잃은 사이 다른 인스턴스가 키를 갱신할 수 있습니다. A가 다시 연결되어도 끊긴 동안의 알림을 모두 재생할 수 있다는 보장은 없습니다.

```text
App A: L1 = v1       Redis L2      PostgreSQL
   │  알림 연결 X         │             │
   │                     │   원본 v2  ──┤
   │                     │◀─ 무효화 ────┤
   │  갱신 알림 미수신    X             │
   │  재연결 ────────────▶│             │
   └─ 기존 L1 v1 사용 금지 / 비우기
```

Redis 공식 클라이언트 측 캐싱 문서는 무효화 연결이 끊어지면 **로컬 캐시를 비우도록** 안내합니다. 단절을 감지할 때까지의 창도 있으므로 연결 상태를 감시하고, 감지 지연과 허용 가능한 오래됨을 함께 제한해야 합니다. 재연결 직후 L1을 지웠다고 해서 Redis L2가 곧 최신이라는 뜻은 아닙니다. **L2 무효화도 실패할 수 있는 업무**라면 최신성을 강하게 요구하는 읽기는 DB로 우회하거나 원본 리비전을 검증해야 합니다.

만약 단순한 로컬 TTL 전략만 선택한다면 무효화 메시지의 신뢰성에 덜 의존하지만, 데이터가 바뀐 직후부터 TTL이 끝나기까지 오래된 값을 제공할 수 있습니다. 또한 캐시를 다시 채울 때 오래된 L2 복사본을 읽는다면 L1 TTL만 짧게 설정해도 DB와의 최신성을 보장하지 못합니다.

### 무엇을 보장하고 어떤 비용을 치를지 정한다

업무상 허용하는 오래됨이 짧고 연결 상태를 감시할 수 있다면 로컬 TTL, 인스턴스별 무효화, 버전·세대 검증을 함께 사용할 수 있습니다. 단, 이벤트나 Pub/Sub을 통한 통지는 연결 단절·누락·순서 역전이 있을 수 있으므로 “알림을 발행했다”만으로 모든 L1이 지워졌다고 단정해서는 안 됩니다.

```text
선택 A  L1 미사용 → L2만 조회: 네트워크 비용은 있지만 복사본 수가 적음
선택 B  짧은 L1 TTL → 제한된 오래됨을 감수하고 읽기 비용 감소
선택 C  무효화 + 단절 시 L1 전체 비우기 → 더 빠른 전파, 연결 상태 관리
선택 D  원본 버전 검증 / 중요 읽기 DB 우회 → 정확성 강화, 추가 조회 비용
```

Spring Cache의 `@Cacheable`과 `@CacheEvict`는 메서드 캐싱을 표현하는 추상화입니다. 해당 선언만으로 프로세스 사이의 값 갱신, Redis Tracking 활성화, DB 커밋 뒤 무효화 전달이 자동으로 보장되지는 않습니다. 제공자와 애플리케이션이 실제로 구현한 경계를 확인해야 합니다.

핫 키에서 L1을 검토하는 **이유**는 Redis 노드에 집중되는 조회를 줄이기 위해서이며, 캐시 무효화와 TTL에서 다루는 **최신성 정책**을 L1·L2 복사본의 수명 주기에 적용하는 것이 이 Concept의 학습 목표입니다. 각 단계의 변경·단절을 원본 DB까지 추적할 수 있어야 성능 최적화가 오래된 값을 숨기는 문제로 바뀌지 않습니다.
