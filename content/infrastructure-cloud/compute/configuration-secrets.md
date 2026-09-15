---
kind: concept
contentKey: infrastructure.core.compute.configuration-secrets
topicContentKey: infrastructure.core.compute
slug: configuration-secrets
title: "실행 설정과 Secret 관리"
summary: "동일한 image와 환경별 runtime configuration을 분리하고, secret은 접근 권한·rotation·노출 경계를 별도로 관리한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://kubernetes.io/docs/concepts/configuration/secret/"
    title: "Kubernetes Documentation: Secrets"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "secret object의 사용과 보안 주의사항 확인"
  - url: "https://12factor.net/config"
    title: "The Twelve-Factor App: Config"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: "배포 환경별 config 분리 원칙 참고"
---
# 실행 설정과 Secret 관리

같은 application image를 local, staging, production에서 재사용하려면 DB endpoint, feature flag, timeout처럼 환경에 따라 달라지는 값을 image 밖에서 공급해야 합니다.

```text
versioned image
    + runtime configuration
    + secret reference
          │
          ▼
      running process
```

이 구조는 환경마다 image를 다시 만드는 대신 **실행 artifact와 환경 입력을 분리**합니다.

### Secret은 일반 설정과 노출 비용이 다르다

DB password, API token, private key는 endpoint나 flag와 같은 방식으로 공개되어서는 안 됩니다. Source repository나 image layer에 secret을 넣으면 여러 build cache와 registry에 값이 복제될 수 있고, credential을 교체할 때 image까지 다시 만들어야 할 수 있습니다.

Secret은 필요한 workload identity만 접근할 수 있게 하고 log, metric, crash dump, diagnostic endpoint에 값이 노출되지 않게 해야 합니다.

### Rotation은 새 값을 저장하는 것보다 길다

Credential을 새 값으로 바꿨더라도 실행 중인 application이 이전 값을 계속 들고 있을 수 있습니다.

```text
새 credential 발급
    │
    ├─ secret store 갱신
    ├─ process가 새 값을 reload/restart
    ├─ 새 connection 확인
    └─ 이전 credential revoke
```

이 순서가 맞지 않으면 새 secret은 존재하지만 application은 여전히 old connection을 사용하거나, old credential을 너무 빨리 revoke해 outage가 날 수 있습니다.

환경 변수, mounted file, secret manager SDK는 갱신 방식이 서로 다르므로 현재 실행 환경의 reload semantics를 확인해야 합니다.

실행 설정을 분리하는 핵심은 파일 위치가 아니라 **image를 환경과 독립적인 artifact로 유지하면서, 민감한 값은 최소 권한과 안전한 rotation lifecycle 안에서 공급하는 것**입니다.
