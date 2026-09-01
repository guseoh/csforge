---
kind: concept
contentKey: computer-architecture.core.cache-organization.write-through-write-back
topicContentKey: computer-architecture.core.cache-organization
slug: write-through-write-back
title: "Write-Through and Write-Back"
summary: "cache hit write를 lower level에 언제 반영할지 결정하는 write-through와 write-back의 traffic·dirty eviction trade-off를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Write-Through and Write-Back

### Read cache와 달리 write는 여러 복사본을 어떻게 갱신할지가 문제다

cache hit로 data를 읽는 경우에는 가까운 copy를 반환하면 되지만, CPU가 cached line을 수정하면 상위 cache와 lower memory level 사이에 서로 다른 값이 존재할 수 있다. write-through와 write-back은 `cache에서 write가 발생했을 때 lower level을 언제 갱신할 것인가`를 정하는 대표 정책이다.

### Write-through는 매 write를 lower level에도 전달한다

write-through cache는 cache line을 수정하면서 해당 write를 다음 memory level에도 전달한다. lower level이 cache와 비교적 빠르게 같은 값을 갖게 되어 dirty eviction 처리가 단순해지는 장점이 있다. 하지만 같은 line을 여러 번 수정해도 write마다 lower-level traffic이 발생할 수 있어 bandwidth 부담이 커진다.

실제 구현에서는 CPU가 lower-level write completion을 매번 동기적으로 기다리면 성능이 크게 떨어질 수 있으므로 write buffer를 두어 cache write와 lower-level transfer를 decouple할 수 있다. 이 경우 CPU instruction이 진행되었다는 사실과 write buffer의 data가 더 아래 계층까지 실제 도착했다는 사실은 같은 시점이 아니다.

### Write-back은 cache에서 수정하고 eviction까지 미룬다

write-back cache는 write hit 시 cache copy만 수정하고 dirty state를 표시한다. 같은 line을 여러 번 수정하더라도 eviction 전까지 lower level에 매번 쓰지 않아 write traffic을 줄일 수 있다. 대신 dirty line을 replacement해야 할 때 lower level로 write-back해야 하므로 clean victim보다 miss/replacement 경로가 더 비싸질 수 있다.

write-back에서 lower memory가 잠시 오래된 값을 가진다는 것은 cache coherence protocol과 memory ordering rule이 필요 없다는 뜻이 아니다. 다른 core가 같은 line을 읽고 쓸 때는 coherence가 올바른 value ownership과 visibility를 관리해야 한다. write policy와 coherence는 관련되어 있지만 같은 문제는 아니다.

### Write policy는 durability policy가 아니다

CPU cache의 write-back에서 `memory에 아직 반영되지 않았다`는 표현을 database write-back cache나 disk durability와 그대로 같은 의미로 사용하면 안 된다. CPU cache hierarchy와 DRAM 사이의 data movement는 hardware memory system의 영역이고, application이 `transaction commit`, `fsync`, storage controller cache flush`, replication acknowledgement 중 어디까지 보장받았는지는 별도 storage/database contract다.

전원 장애 후 data가 남는지를 판단할 때 CPU cache의 write-through/write-back 용어만으로 결론 내릴 수 없다. volatile DRAM까지 도달했다는 것과 non-volatile storage에 durable하게 기록되었다는 것은 다르다.

### Backend 성능에서 연결해서 볼 것

write-heavy workload에서 memory bandwidth와 cache miss를 볼 때 dirty eviction이 추가 traffic을 만들 수 있다는 점은 중요하다. 하지만 backend의 write-behind cache 설계를 CPU write-back 정책의 단순 복사판으로 결정하면 안 된다. application cache에는 stale data, crash recovery, source of truth, retry/idempotency 같은 별도 책임이 있다.
