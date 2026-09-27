---
kind: concept
contentKey: computer-architecture.core.cache-organization.fully-associative-cache
topicContentKey: computer-architecture.core.cache-organization
slug: fully-associative-cache
title: "완전 연관 캐시(Fully-Associative Cache)"
summary: "메모리 블록을 어느 라인에도 배치할 수 있게 해 충돌을 줄이는 대신 전체 태그 검색과 교체 비용이 커지는 구조를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "direct-mapped·set-associative·fully-associative mapping, tag/index/offset, replacement과 write policy를 확인한다."
    displayOrder: 1
---
# 완전 연관 캐시(Fully-Associative Cache)

완전 연관 캐시에서는 메모리 블록이 캐시의 어느 라인에도 들어갈 수 있다. 특정 인덱스가 배치를 제한하지 않으므로 전체 캐시를 하나의 세트로 보고 모든 라인을 후보로 생각할 수 있다.

이 자유도 덕분에 직접 사상 캐시처럼 특정 인덱스 하나를 두고 블록이 반복해서 서로 밀어내는 충돌 미스를 줄일 수 있다.

### 배치가 자유로운 만큼 조회가 복잡하다

요청한 블록이 어느 라인에 있는지 모르기 때문에 적중 여부를 확인하려면 캐시에 있는 여러 태그와 요청 태그를 비교해야 한다.

```text
requested tag
   ├─ compare line 0
   ├─ compare line 1
   ├─ compare line 2
   └─ ...
```

캐시가 커질수록 이런 비교와 선택 회로의 면적·전력·타이밍 비용도 커진다. 미스가 발생하고 빈 라인이 없다면 캐시 전체 후보 중 어느 라인을 내보낼지도 결정해야 한다.

### 충돌 미스를 줄여도 모든 미스가 사라지는 것은 아니다

처음 접근하는 블록에서 발생하는 compulsory miss는 그대로 존재한다. 작업 집합 자체가 캐시 용량보다 크다면 capacity miss도 발생한다.

즉 완전 연관 구조는 배치 제약을 크게 줄이는 방법이지 `미스가 없는 캐시`가 아니다.

정리하면 배치 자유도는 다음 순서로 커진다.

```text
direct-mapped < set-associative < fully-associative
```

반대로 조회와 교체 하드웨어의 복잡도도 일반적으로 커진다. 그래서 실제 캐시는 크기와 지연 시간 목표에 맞춰 적절한 연관도를 선택한다.
