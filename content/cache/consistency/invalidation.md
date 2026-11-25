---
kind: concept
contentKey: cache.core.consistency.invalidation
topicContentKey: cache.core.consistency
slug: invalidation
title: "캐시 무효화 순서와 오래된 값의 재등장"
summary: "원본 변경과 캐시 삭제·갱신이 겹칠 때 늦게 끝난 조회가 이전 값을 다시 채우는 경쟁 상태를 이해하고 최신 세대를 판별할 기준을 설계한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Redis cache-aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "원본 쓰기 후 캐시 무효화 흐름 확인"
  - url: "https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/"
    title: "Redis Documentation: Redis keyspace notifications"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "캐시 키 변화 관측과 Pub/Sub의 메시지 유실 가능성 확인"
  - url: "https://techblog.woowahan.com/23138/"
    title: "우아한형제들 기술블로그: 이제 Redis를 멈춰보겠습니다 - @CacheEvict 파헤치기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: "Spring Cache의 캐시 퇴출이 Redis 명령과 운영 지연 시간에 연결되는 실제 사례 확인"
---
# 캐시 무효화 순서와 오래된 값의 재등장

원본 데이터를 수정한 뒤 캐시 키를 삭제하면 다음 조회가 최신 값을 채울 수 있습니다. 하지만 **이미 진행 중인 오래된 원본 조회**가 있다면 삭제가 성공한 뒤에도 이전 값이 다시 캐시에 들어갈 수 있습니다.

![무효화 뒤 늦은 조회 · v1이 다시 살아나는 이유](/learning/cache/late-fill-after-invalidation.svg)

가능한 동시 실행 순서입니다. 단순히 원본에서 최신 버전을 확인한 직후 SET하는 방식도 확인과 게시 사이에 변경이 끼어들 수 있습니다.

결과적으로 PostgreSQL에는 v2가 있지만 캐시에는 다시 v1이 남습니다. 이 문제는 `DEL` 명령 자체의 실패가 아니라 **조회와 쓰기의 완료 순서가 뒤집힌 경쟁 상태(race condition)**입니다.

### 값에 버전을 넣는 것만으로는 충분하지 않을 수 있다

`{ value: ..., version: 41 }`처럼 버전을 함께 저장하면 새 값과 오래된 값을 비교할 수 있습니다. 하지만 작성자가 캐시 항목 자체를 삭제해 버리면 늦게 도착한 조회자가 비교할 최신 버전도 함께 사라질 수 있습니다.

오래된 캐시 채우기를 막으려면 삭제 이후에도 “현재 세대(generation)가 무엇인지” 판단할 기준이 필요합니다. 예를 들어 별도의 세대 메타데이터를 유지하고, Redis 안에서 현재 세대 확인과 값 게시를 같은 원자적 연산으로 묶을 수 있습니다. 단순히 DB 버전을 SET 직전에 조회하면 확인과 게시 사이에 작성자가 v2를 커밋하고 DEL한 후 조회자가 v1을 SET하는 새 경쟁이 남습니다.

```text
R: 최신 DB 버전 v1 확인
W: v2 COMMIT + DEL
R: SET v1 → 다시 오래된 값
```

Redis의 현재 세대가 42이고 늦은 조회가 41이면, 같은 Redis 원자 경계(예: 관련 키를 같은 슬롯에 둔 Lua 스크립트)에서 비교와 게시를 수행해 41의 저장을 거부할 수 있습니다. 버전별 네임스페이스를 쓸 때는 읽기 경로도 현재 세대를 사용해야 이전 세대에 늦게 게시된 값을 읽지 않습니다. DB 커밋과 Redis 세대 전파는 여전히 별개입니다. 전파 실패·지연·세대 메타데이터 유실에 대한 복구와 허용 가능한 오래됨, 중요 읽기의 원본 우회 정책이 필요합니다.

![세대 확인과 캐시 게시의 원자 경계](/learning/cache/generation-atomic-publication.svg)

이 그림은 Redis의 세대 갱신과 이전 값 제거가 원자적으로 수행되어 세대 42가 이미 관측 가능한 상태를 전제로 합니다. 세대가 유실되면 오래된 값의 게시를 허용하지 않고 원본에서 복구하거나 우회하는 정책이 필요합니다.

어떤 구현을 쓰든 핵심은 CAS나 Lua라는 도구 이름이 아니라 **무엇을 최신 값의 기준으로 비교하는가**입니다.

### 파생 캐시가 많아지면 무효화 범위도 커진다

Concept 하나를 수정했을 때 다음 값들이 모두 영향을 받을 수 있습니다.

```text
concept:42
topic:java:list
search:keyword:...
dashboard:summary
```

관련 키를 모두 정확히 찾는 비용이 커지면 모든 것을 즉시 삭제하는 전략보다 짧은 TTL이나 네임스페이스 세대를 사용하는 편이 더 단순할 수도 있습니다.

이벤트로 무효화를 전달하는 경우에는 또 다른 실패 경계가 생깁니다. DB 커밋과 이벤트 발행이 서로 다른 쓰기라면 이벤트가 빠질 수 있고, Pub/Sub 계열은 연결이 끊긴 동안 전달을 보존하지 않을 수도 있습니다. 이런 전달 보장, 중복, 순서 문제는 Messaging 영역의 책임과 연결됩니다.

캐시 무효화의 핵심은 키 삭제 명령이 아니라 **원본 변경과 동시에 진행되는 조회·캐시 채우기 사이에서 오래된 값이 다시 살아날 수 있는 순서를 발견하고, 그 값을 최신이라고 받아들이지 않을 기준을 갖는 것**입니다.
