---
kind: concept
contentKey: cache.core.models.key-serialization
topicContentKey: cache.core.models
slug: key-serialization
title: "cache key와 serialization contract"
summary: "key namespace·tenant·version과 value serialization을 명시해 collision과 schema 변경을 제어한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://redis.io/docs/latest/develop/data-types/"
    title: "Redis Documentation: Data Types"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Redis value type과 byte/string 기반 저장 모델 확인"
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Cache Aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "cache entity key namespace 예시 확인"
  - url: "https://techblog.woowahan.com/22767/"
    title: "우아한형제들 기술블로그: Spring Cache + Spring Data Redis 사용 시 record 직렬화 오류 원인과 해결"
    referenceType: BLOG
    language: ko
    displayOrder: 3
    relationNote: "serializer 설정과 Java record type 정보가 기존 cache value 호환성에 영향을 주는 실제 사례 확인"
---
# cache key와 serialization contract

Cache key는 단순한 문자열이 아니라 어떤 representation을 어떤 tenant와 version에 대해 저장했는지 나타내는 주소입니다. key 설계가 모호하면 서로 다른 use case가 같은 값을 덮어쓰거나, schema를 바꾼 뒤 이전 serializer가 만든 값을 새 code가 잘못 읽을 수 있습니다.

```text
cache:v2:concept:tenant-7:42
cache:v2:concept-list:tenant-7:topic-java:page-1
```

### namespace는 collision을 막는다

`user:42`와 `order:42`가 같은 prefix 규칙을 공유하면 값 type을 잘못 읽을 수 있습니다. entity·use case·tenant·schema version을 구분하고 delimiter 규칙을 고정해야 합니다. tenant가 있는 서비스에서는 tenant 경계를 key에 포함하거나 별도 database/ACL로 명시해야 cross-tenant read가 생기지 않습니다.

### value serialization도 계약이다

JSON, hash field, binary codec 등 어떤 형식이든 producer와 consumer가 field 이름·type·nullable·version을 합의해야 합니다.

```text
old value: {"name":"CSForge","level":1}
new code:  {"name":"CSForge","level":"BEGINNER"}
```

새 code가 old value를 읽을 수 없다면 배포 중 cache hit가 parsing error가 될 수 있습니다. schema version을 key에 넣어 miss로 처리한 뒤 새 형식으로 재생성하거나, backward-compatible reader와 단계적 전환을 둡니다.

### key에 민감정보를 넣지 않는다

key는 metric, debug log, eviction 도구와 함께 노출될 수 있습니다. password·token·개인정보를 raw key로 사용하지 말고 stable identifier와 필요한 scope만 사용합니다. key 길이가 지나치게 길면 memory와 network 비용도 커집니다.

### deterministic key와 invalidation은 함께 설계한다

write 뒤 어떤 key를 삭제해야 하는지 모르면 cache hit가 남습니다. list key가 filter·sort·page 조건을 표현한다면 entity update 시 모든 관련 list key를 찾을 수 있는지, 짧은 TTL이나 version namespace로 정리할지 판단해야 합니다.

### 문제를 풀 때 확인할 것

1. key가 tenant·entity·use case·schema version을 구분하는지 봅니다.
2. value schema가 old/new deployment 동안 읽히는지 확인합니다.
3. invalidation 시 삭제할 key 집합을 알 수 있는지 검토합니다.
4. key와 value에 secret·PII가 들어가지 않는지 확인합니다.
5. key cardinality와 serialized size를 metric으로 봅니다.

### 면접에서 설명한다면

Cache key는 namespace와 identity뿐 아니라 tenant와 representation version을 포함하는 계약입니다. value serialization도 배포 간 호환성이 필요하며, 호환되지 않으면 versioned key로 안전하게 miss를 유도할 수 있습니다. deterministic key는 invalidation과 관측을 쉽게 하고, key·value 모두 민감정보와 과도한 크기를 피해야 합니다.
