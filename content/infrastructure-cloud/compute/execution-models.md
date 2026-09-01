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

### image와 running container를 구분한다

Image는 재현 가능한 artifact이고 container는 그 image로 실행된 process와 writable runtime state입니다. container local filesystem에 중요한 데이터를 저장하면 restart·reschedule 후 사라질 수 있으므로 durable volume/object/database를 별도 선택해야 합니다.

### 문제를 풀 때 확인할 것

1. 어느 계층이 patch와 host resource를 소유하는지 봅니다.
2. image, process, durable data를 분리합니다.
3. restart/reschedule 뒤 보존되어야 할 state를 찾습니다.
4. runtime이 제공하는 health·scaling·permission 계약을 확인합니다.
5. portability와 운영 비용을 함께 판단합니다.

### 면접에서 설명한다면

VM·container·serverless는 실행 isolation과 관리 책임을 서로 다르게 분배합니다. Container image는 artifact이고 running container는 재생성 가능한 process이므로 중요한 state를 local filesystem에 두지 않습니다. abstraction이 높아져도 timeout·resource·permission·cost의 운영 책임이 사라지는 것은 아닙니다.

