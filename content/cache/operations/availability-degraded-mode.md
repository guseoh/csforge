---
kind: concept
contentKey: cache.core.operations.availability-degraded-mode
topicContentKey: cache.core.operations
slug: availability-degraded-mode
title: "캐시 장애와 제한적 대체 처리"
summary: "캐시 타임아웃·사용 불가 상황에서 원본 조회, 오래된 결과 제공, 명확한 실패 중 무엇을 선택할지 정확성·요청 시간·원본 용량 관점에서 판단한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Redis cache-aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "캐시 미스에서 원본 저장소를 조회하는 기본 흐름 확인"
  - url: "https://redis.io/docs/latest/develop/clients/error-handling/"
    title: "Redis Documentation: Error handling"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "연결 오류·타임아웃에서 재시도와 대체 처리를 선택하는 오류 처리 패턴 확인"
---
# 캐시 장애와 제한적 대체 처리

조회 성능을 위해 추가한 캐시가 장애를 일으켰을 때 가장 단순한 생각은 “그냥 DB에서 읽으면 된다”입니다. 하지만 트래픽 대부분을 캐시가 흡수하던 시스템이라면 모든 요청을 갑자기 원본 저장소로 보내는 순간 **Redis 장애가 PostgreSQL 과부하로 전파될 수 있습니다.**

```text
정상
요청 ─▶ 캐시 ── 일부 미스 ─▶ DB

캐시 장애
요청 ────────────────▶ DB
                           ▲
                    갑작스러운 부하 증가
```

### 어떤 대체 처리가 허용되는지는 데이터 의미가 결정한다

비핵심 추천 목록은 캐시가 없을 때 DB를 직접 조회하거나 조금 오래된 값을 반환해도 괜찮을 수 있습니다. 반면 권한 판정이나 결제 상태처럼 잘못된 값을 성공으로 간주하면 안 되는 데이터는 캐시 장애를 이유로 검증을 건너뛰어서는 안 됩니다.

```text
추천 목록 캐시 실패
→ 제한된 DB 대체 처리 / 오래된 값 제공 가능성 검토

권한 정보 캐시 실패
→ "캐시가 없으니 허용"은 위험
```

흔히 이를 **장애 시 허용(fail-open)**과 **장애 시 차단(fail-closed)**이라는 말로 설명하지만, 핵심은 용어가 아니라 **오래되거나 없는 값으로 계속 진행했을 때 정확성이 깨지는가**입니다.

### 대체 처리에도 용량 한계가 필요하다

캐시 타임아웃을 오래 기다린 뒤 모든 요청이 DB 대체 처리를 시작하면 요청의 전체 시간 예산과 연결 풀(connection pool)을 동시에 소모합니다. 캐시 타임아웃은 상위 요청 제한 시간보다 충분히 짧아야 하고, 원본 저장소로 보내는 대체 처리도 동시 실행 수나 요청 비율을 제한할 수 있어야 합니다.

```text
요청 제한 시간
   │
   ├─ 짧은 캐시 시도
   │
   └─ 남은 시간 안에서 제한된 대체 처리
```

대체 처리 용량을 넘는 요청은 무한히 기다리게 하기보다 명확하게 실패시키는 편이 전체 시스템을 보호할 수 있습니다.

### 캐시 복구 후에도 부하가 생길 수 있다

Redis가 다시 살아났다고 바로 정상 상태로 돌아가는 것은 아닙니다. 비어 있는 캐시를 수많은 요청이 동시에 채우면 복구 직후 또 다른 캐시 스탬피드가 발생할 수 있습니다. 필요한 경우 캐시를 점진적으로 다시 채우거나 요청 병합을 적용해 재생성 부하를 제한합니다.

캐시 장애 대응의 목표는 “항상 성공 응답을 만든다”가 아니라 **캐시가 없어도 원본 데이터의 정확성을 지키면서, 제한된 자원 안에서 어떤 기능까지 계속 제공할지 정하는 것**입니다.
