---
kind: concept
contentKey: computer-architecture.core.cache-organization.write-allocate
topicContentKey: computer-architecture.core.cache-organization
slug: write-allocate
title: "Write Allocate"
summary: "write miss에서 line을 cache로 가져올지 bypass할지 결정하는 write-allocate와 no-write-allocate의 locality·traffic trade-off를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Write Allocate

### Write hit 정책과 write miss 정책은 다른 선택이다

write-through/write-back이 이미 cache에 있는 line을 수정했을 때 lower level에 언제 반영할지를 정한다면, write-allocate/no-write-allocate는 write하려는 block이 cache에 없을 때 무엇을 할지를 정한다. 두 축을 구분해야 write policy 조합을 정확히 이해할 수 있다.

### Write-allocate는 miss 난 line을 cache로 가져온 뒤 수정한다

write-allocate에서는 write miss가 발생하면 해당 memory block을 lower level에서 cache line으로 가져오고, 그 line 안의 target byte/word를 수정한다. 이후 같은 line을 다시 읽거나 쓸 가능성이 높다면 spatial/temporal locality를 활용할 수 있다. write-back cache와 자주 결합되는 이유도 여러 write를 cache에서 모은 뒤 dirty line을 나중에 write-back할 수 있기 때문이다.

하지만 기존 line 전체가 필요하지 않은 단순 store라도 cache line을 먼저 확보해야 하므로 line fill traffic이 발생할 수 있다. coherence system에서는 write 권한을 얻기 위한 ownership transaction도 필요할 수 있다. `write 한 번`이 실제 memory bus에서 반드시 작은 store 하나만 발생한다는 뜻은 아니다.

### No-write-allocate는 miss 난 block을 cache에 채우지 않는다

no-write-allocate 또는 write-no-allocate에서는 write miss를 cache line fill로 연결하지 않고 lower level/write path로 전달한다. 한 번만 쓰고 다시 접근하지 않는 streaming workload라면 cache capacity를 오염시키지 않고 불필요한 line fill을 줄일 수 있다. write-through policy와 함께 설명되는 경우가 많지만 실제 hardware 조합은 architecture와 cache level에 따라 다를 수 있으므로 `항상 이 조합`이라고 고정하면 안 된다.

반대로 같은 line을 곧 다시 읽거나 여러 번 수정한다면 no-write-allocate는 locality 이점을 놓칠 수 있다. 이후 read에서 결국 miss가 발생하거나 반복 write가 lower-level traffic을 계속 만들 수 있기 때문이다.

### Read-for-ownership과 전체-line write를 구분한다

일부 write-allocate/coherence 경로에서는 line을 수정하기 전에 기존 line contents와 ownership을 가져오는 read-for-ownership 형태의 transaction이 발생할 수 있다. 다만 모든 store가 항상 DRAM까지 기존 64-byte line을 읽은 뒤 쓰는 것으로 단순화해서는 안 된다. lower cache에 line이 있을 수도 있고, full-line store나 non-temporal store처럼 다른 최적화 경로도 존재할 수 있다. 정확한 behavior는 target architecture와 instruction/cache policy에 따라 확인한다.

### Backend 성능에서 연결할 때

큰 byte buffer를 한 번 채우고 다시 읽지 않는 workload나 zeroing/streaming write는 일반 cached write가 불필요한 cache pollution과 memory traffic을 만들 수 있다. 반대로 같은 buffer를 곧 후속 stage에서 읽는다면 cache에 남기는 것이 유리할 수 있다. application 수준에서 이를 최적화할 때는 먼저 실제 write bandwidth와 cache miss가 병목인지 측정하고, JVM/JIT가 어떤 store instruction을 생성하는지까지 필요한 경우 확인한다.

또한 application의 write-behind/write-around cache policy와 CPU write-allocate는 이름이 비슷해도 consistency·durability 책임이 다르다. 동일한 정책으로 취급하지 않는다.
