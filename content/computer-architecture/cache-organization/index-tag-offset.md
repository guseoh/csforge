---
kind: concept
contentKey: computer-architecture.core.cache-organization.index-tag-offset
topicContentKey: computer-architecture.core.cache-organization
slug: index-tag-offset
title: "인덱스·태그·오프셋(Index, Tag and Offset)"
summary: "캐시 용량·라인 크기·연관도에서 세트 수를 구하고 주소 비트를 오프셋·인덱스·태그로 나누는 방법을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "direct-mapped·set-associative·fully-associative mapping, tag/index/offset, replacement과 write policy를 확인한다."
    displayOrder: 1
---
# 인덱스·태그·오프셋(Index, Tag and Offset)

바이트 주소 지정 메모리와 2의 거듭제곱 크기 캐시를 가정하면 주소를 `tag`, `index`, `offset`으로 나누어 캐시 조회를 이해할 수 있다.

- **offset**: 선택된 캐시 라인 안에서 어느 바이트를 사용할지 고른다.
- **index**: 어느 세트를 확인할지 고른다.
- **tag**: 그 세트에 들어 있는 라인이 요청한 메모리 블록과 같은지 확인한다.

```text
high bits                              low bits
|              tag              | index | offset |
```

### 먼저 라인 수와 세트 수를 구한다

캐시 용량을 `C`, 라인 크기를 `B`, 연관도를 `A`라고 하면 다음처럼 계산할 수 있다.

```text
line count = C / B
set count  = (C / B) / A
```

예를 들어 32KiB 캐시, 64-byte 라인, 4-way 캐시라면 전체 라인은 512개이고 세트는 128개다.

64바이트 라인 안의 바이트를 고르려면 6비트가 필요하므로 오프셋은 6비트다. 128개 세트 중 하나를 고르려면 7비트가 필요하므로 인덱스는 7비트다. 32-bit 주소라면 나머지 19비트가 태그가 된다.

### 연관도가 바뀌면 인덱스 폭도 달라진다

같은 용량과 라인 크기에서 연관도를 높이면 한 세트 안의 way 수가 늘고 세트 수는 줄어든다. 그러면 인덱스 비트 수가 줄고 태그 비트 수가 늘어난다.

직접 사상 캐시는 연관도가 1이므로 세트 수와 라인 수가 같다. 완전 연관 캐시는 전체 캐시가 하나의 세트이므로 배치를 위한 인덱스 비트가 없다.

이 계산에서 가장 자주 틀리는 부분은 **전체 라인 수와 세트 수를 혼동하는 것**이다. 또한 실제 CPU의 캐시 인덱싱은 이 교육용 모델보다 복잡할 수 있으므로 이 식은 기본 원리를 이해하기 위한 모델로 사용한다.
