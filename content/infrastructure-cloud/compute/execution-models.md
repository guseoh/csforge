---
kind: concept
contentKey: infrastructure.core.compute.execution-models
topicContentKey: infrastructure.core.compute
slug: execution-models
title: "VM·container·serverless execution models"
summary: "VM·container·serverless가 isolation과 운영 책임을 어떻게 나누는지 이해한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://csrc.nist.gov/pubs/sp/800/145/final"
    title: "NIST SP 800-145: Cloud Computing Definition"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "on-demand shared computing resource와 cloud service model 확인"
  - url: "https://docs.docker.com/get-started/docker-overview/"
    title: "Docker Documentation: Docker Overview"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "image와 container 실행 모델 확인"
  - url: "https://docs.docker.com/engine/storage/"
    title: "Docker Documentation: Storage"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "container writable layer와 persistent storage의 lifecycle 차이 확인"
---
# VM·container·serverless execution models

애플리케이션을 실행한다는 말 뒤에는 서로 다른 isolation과 운영 책임이 있습니다. VM은 guest OS까지 묶어 비교적 강한 경계를 제공하고, container는 host kernel을 공유하며 image와 process 실행을 묶습니다. Serverless는 실행 단위와 host 관리가 provider 뒤로 이동합니다.

```text
VM:          app -> guest OS -> hypervisor -> host
Container:   app -> container image/process -> host kernel
Serverless:  function -> platform runtime -> provider resource
```

### abstraction이 올라갈수록 책임이 이동한다

VM을 직접 운영하면 patch·image·network·capacity를 더 많이 관리합니다. container orchestrator를 사용하면 scheduler가 restart와 placement를 도울 수 있지만 image, resource declaration, probe와 rollout 계약은 application team의 책임으로 남습니다. serverless도 business code만 쓰면 되는 것이 아니라 timeout, concurrency, cold start, permission과 cost를 관리해야 합니다.

### image, container와 durable state를 구분한다

Image는 재현 가능한 artifact이고 running container는 그 image를 기반으로 실행되는 process와 writable layer를 가집니다. **같은 container instance의 process가 단순히 재시작되는 경우와 container 자체가 삭제·재생성되는 경우를 구분해야 합니다.** Docker의 container writable layer는 container lifecycle에 묶이므로 container가 제거되면 그 layer의 데이터도 함께 사라집니다. Kubernetes 같은 orchestrator에서 Pod/container가 재생성되거나 다른 node로 reschedule되는 상황에도 local writable state가 그대로 보존된다고 가정하면 안 됩니다.

따라서 process restart 자체를 곧 data loss라고 설명하지 않고, 어떤 execution unit이 재사용되고 어떤 storage가 별도 lifecycle을 가지는지 확인합니다. 재생성 이후에도 보존되어야 하는 business data는 volume, object storage, database처럼 명시적인 durable storage boundary에 둡니다.

### 문제를 풀 때 확인할 것

1. 어느 계층이 patch와 host resource를 소유하는지 봅니다.
2. image, running process/container, writable layer와 durable data를 분리합니다.
3. process restart와 container/Pod recreation·reschedule을 구분합니다.
4. 재생성 뒤에도 보존되어야 할 state가 어느 storage lifecycle에 있는지 확인합니다.
5. runtime이 제공하는 health·scaling·permission 계약과 운영 비용을 함께 판단합니다.

### 면접에서 설명한다면

VM·container·serverless는 실행 isolation과 관리 책임을 서로 다르게 분배합니다. Container image는 artifact이고 writable layer는 container lifecycle에 묶이므로 container/Pod 재생성 뒤에도 필요한 state를 local layer에 의존하면 안 됩니다. 단순 process restart와 execution unit recreation을 구분하고, durable data는 별도 storage lifecycle로 분리합니다. abstraction이 높아져도 timeout·resource·permission·cost의 운영 책임이 사라지는 것은 아닙니다.

