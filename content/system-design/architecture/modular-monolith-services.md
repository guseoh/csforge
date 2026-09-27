---
kind: concept
contentKey: system-design.core.architecture.modular-monolith-services
topicContentKey: system-design.core.architecture
slug: modular-monolith-services
title: "모듈형 모놀리스와 서비스 분리 (Modular Monolith)"
summary: "모듈 경계를 먼저 분명히 한다. 독립 배포·확장·장애 격리의 실질적 이점이 운영 복잡성보다 클 때 서비스를 분리한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://microservices.io/patterns/monolithic.html"
    title: "Microservices.io: Monolithic Architecture"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "단일 배포 단위와 모듈·서비스 결합도의 절충 확인"
  - url: "https://martinfowler.com/articles/microservice-trade-offs.html"
    title: "Martin Fowler: Microservice Trade-Offs"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: "모듈 경계·독립 배포·분산 및 운영 비용 사이의 절충을 검토"
---
# 모듈형 모놀리스와 서비스 분리 (Modular Monolith)

시스템이 커진다고 반드시 여러 서비스로 나눠야 하는 것은 아닙니다. 하나의 배포 단위 안에서도 모듈별 공개 API와 데이터 소유권을 분명히 하면 변경 범위를 제한할 수 있습니다. 반대로 프로세스를 여러 개로 나눠도 서로의 테이블과 내부 모델을 직접 다루면 분산 모놀리스(distributed monolith)가 될 수 있습니다.

```text
one deployable application
  ├─ member module
  ├─ learning module
  └─ quiz module
       └─ 각 module은 명시적 API와 ownership 유지
```

그래서 service 분리 전에 먼저 logical boundary가 실제 코드에서 지켜지는지 확인하는 편이 좋습니다. 어떤 module이 어떤 state를 소유하는지, 다른 module이 어떤 API를 통해 접근하는지, 한 transaction으로 함께 지켜야 하는 invariant가 무엇인지 정합니다.

Service로 분리하면 독립 배포와 확장, 장애 격리, 서로 다른 보안 경계를 얻을 수 있습니다. 그러나 network failure, timeout, data synchronization, observability, CI/CD, on-call과 recovery 같은 운영 비용도 함께 생깁니다.

따라서 단순히 코드가 많다는 이유보다 **서로 다른 scale 요구, 독립 release cadence, 명확한 data ownership, 장애 격리 또는 조직 자율성이 실제로 필요한가**를 분리 근거로 삼는 편이 좋습니다.

경계가 충분히 검증된 modular monolith는 나중에 service로 이동할 때도 유리합니다. Module API와 ownership이 이미 존재하면 특정 module의 runtime과 data를 점진적으로 분리할 수 있습니다. 반대로 경계 없이 먼저 process만 쪼개면 network를 사이에 둔 강한 coupling만 남기기 쉽습니다.

핵심은 monolith와 microservices 중 하나를 정답으로 고르는 것이 아니라 **얻고 싶은 독립성이 추가되는 운영 비용보다 큰지 확인하는 것**입니다.
