---
kind: concept
contentKey: infrastructure.core.compute.execution-models
topicContentKey: infrastructure.core.compute
slug: execution-models
title: "VM·Container·Serverless의 실행 책임"
summary: "VM·container·serverless가 애플리케이션 실행 환경과 host 관리 책임을 어떻게 나누는지 이해하고 실행 단위와 durable state의 lifecycle을 구분한다."
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
# VM·Container·Serverless의 실행 책임

같은 Spring Boot 애플리케이션도 어디에서 실행하느냐에 따라 우리가 직접 관리해야 하는 범위가 달라집니다. VM은 guest OS까지 하나의 실행 환경으로 다루고, container는 host kernel을 공유하면서 image와 process 실행 단위를 격리합니다. Serverless는 host와 runtime 관리의 더 많은 부분을 provider가 맡습니다.

```text
VM
app → guest OS → hypervisor → host

Container
app → image/container process → host kernel

Serverless
function/app unit → managed runtime → provider infrastructure
```

### 추상화가 높아져도 운영 책임이 사라지지는 않는다

VM을 직접 운영하면 OS patch, runtime 설치, capacity와 process lifecycle까지 더 많이 관리합니다. Container platform은 placement와 restart를 자동화할 수 있지만 image, resource request/limit, health signal과 rollout 설정은 여전히 애플리케이션 운영 계약입니다.

Serverless도 host를 직접 관리하지 않을 뿐 timeout, concurrency, permission, cold start와 비용 같은 새로운 제약을 갖습니다. 따라서 "serverless는 운영이 없다"고 이해하면 안 됩니다.

### 실행 단위와 데이터 수명은 따로 본다

Container image는 재현 가능한 artifact이고 running container는 그 image를 기반으로 실행되는 instance입니다. Container가 제거되어 새 instance가 만들어질 때 writable layer의 데이터가 그대로 유지된다고 가정할 수 없습니다.

```text
image ─▶ container A ─X
   └──▶ container B

A의 local writable state
→ B에 자동 승계된다고 가정하지 않음
```

재생성 이후에도 남아야 하는 주문 데이터나 업로드 파일은 database, volume, object storage처럼 실행 instance와 분리된 durable storage에 둬야 합니다.

VM·Container·Serverless를 비교할 때 핵심은 기술 이름보다 **누가 host와 runtime lifecycle을 관리하는지, 실행 instance가 사라질 때 어떤 state까지 함께 사라지는지**를 구분하는 것입니다.
