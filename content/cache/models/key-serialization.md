---
kind: concept
contentKey: cache.core.models.key-serialization
topicContentKey: cache.core.models
slug: key-serialization
title: "캐시 키와 직렬화 계약"
summary: "네임스페이스·테넌트·버전을 포함한 키 규칙과 값의 직렬화 형식을 명시해 키 충돌과 배포 간 스키마 호환성 문제를 줄인다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://redis.io/docs/latest/develop/data-types/"
    title: "Redis Documentation: Data Types"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Redis 값의 자료형과 문자열·바이트 기반 저장 모델 확인"
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Redis cache-aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "캐시 엔티티 키의 네임스페이스 예시 확인"
  - url: "https://techblog.woowahan.com/22767/"
    title: "우아한형제들 기술블로그: Spring Cache + Spring Data Redis 사용 시 record 직렬화 오류 원인과 해결"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: "직렬화 설정과 Java record의 자료형 정보가 기존 캐시 값 호환성에 영향을 주는 실제 사례 확인"
---
# 캐시 키와 직렬화 계약

캐시 키는 값을 찾기 위한 문자열이면서 동시에 **어떤 데이터의 어떤 표현을 저장했는지 구분하는 주소**입니다. 규칙이 모호하면 서로 다른 기능이 같은 키를 사용하거나, 새 버전 애플리케이션이 이전 형식의 값을 읽지 못하는 문제가 생깁니다.

```text
cache:v2:concept:42
cache:v2:concept-list:topic-java:page-1
```

### 키는 충돌하지 않게 의미를 구분한다

`42` 하나만 키로 사용하면 회원 42와 주문 42를 구분할 수 없습니다. 기능이나 자원 종류를 **네임스페이스(namespace)**로 분리하고, 다중 테넌트 환경이라면 테넌트 식별자도 필요한 위치에 포함해야 합니다.

직렬화 스키마를 호환되지 않게 바꾸는 경우에는 버전을 키에 포함해 이전 값과 새 값을 자연스럽게 분리할 수도 있습니다.

```text
concept:v1:42  → 이전 표현
concept:v2:42  → 새 표현
```

이렇게 하면 새 애플리케이션이 이전 값을 잘못 역직렬화하는 대신 캐시 미스를 만나 새 형식으로 다시 채울 수 있습니다.

### 값의 형식도 배포 간 계약이다

JSON이나 바이너리 코덱으로 저장한 값은 쓰는 쪽과 읽는 쪽이 필드 이름, 자료형, null 허용 여부를 합의해야 합니다.

```text
old: {"level": 1}
new: {"level": "BEGINNER"}
```

새 코드가 `level`을 문자열 enum으로만 읽는다면 기존 캐시 항목이 남아 있는 순차 배포(rolling deployment) 중 파싱 오류가 발생할 수 있습니다. 이전 형식도 읽을 수 있게 호환성을 유지하거나 키 버전을 올려 이전 값을 자연스럽게 만료시키는 방식 중 하나를 선택할 수 있습니다.

### 무효화할 수 있는 키 구조여야 한다

키 설계는 조회뿐 아니라 삭제에도 영향을 줍니다. 하나의 Concept가 바뀌었을 때 엔티티 키 하나만 삭제하면 되는지, Topic 목록이나 검색 결과처럼 여러 파생 키도 함께 오래될 수 있는지 봐야 합니다.

파생 조합이 너무 많아 정확한 삭제 집합을 찾기 어렵다면 짧은 TTL이나 네임스페이스 세대(namespace generation)처럼 다른 최신성 전략이 더 단순할 수 있습니다.

또한 캐시 키는 운영 도구나 메트릭·로그에 노출될 수 있으므로 비밀번호, 토큰, 개인정보 같은 민감정보를 그대로 포함하지 않는 것이 좋습니다.

좋은 캐시 키는 보기 좋은 문자열이 아니라 **충돌 없이 데이터를 식별하고, 새 버전과 공존하며, 필요한 파생 값을 무효화할 수 있게 하는 운영 계약**입니다.
