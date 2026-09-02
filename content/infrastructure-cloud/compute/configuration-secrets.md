---
kind: concept
contentKey: infrastructure.core.compute.configuration-secrets
topicContentKey: infrastructure.core.compute
slug: configuration-secrets
title: "configuration과 secrets"
summary: "image와 runtime configuration을 분리하고 secret 노출·rotation·least privilege를 설계한다"
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
# configuration과 secrets

같은 application image를 local·staging·production에서 재사용하려면 DB URL, feature flag, API endpoint 같은 config를 image 밖 runtime boundary에서 주입해야 합니다. Password·token·private key는 일반 config와 달리 접근·rotation·로그 노출을 더 엄격하게 관리해야 합니다.

```text
immutable image
      + runtime config
      + secret reference / mounted secret
      -> 실행 process
```

### image에 secret을 bake하지 않는다

image layer, source repository, build log와 crash dump는 여러 사람과 시스템에 복제될 수 있습니다. secret을 image에 넣으면 deployment 전에 유출되고 rotation 때 image rebuild가 필요합니다. runtime secret store와 최소 권한 identity를 사용하고 로그·환경 진단에서 값을 redaction합니다.

### configuration 변경과 secret rotation을 구분한다

환경 변수 변경이 process restart를 필요로 하는지, mounted file이 자동 갱신되는지, application이 connection을 재생성하는지를 확인해야 합니다. secret을 교체해도 이미 열린 connection·token cache가 오래된 credential을 사용할 수 있으므로 overlap과 revoke 시점을 설계합니다.

### 문제를 풀 때 확인할 것

1. immutable artifact와 environment-specific config를 분리합니다.
2. secret 접근 주체와 scope를 최소화합니다.
3. build/image/log/metric에 secret이 남지 않는지 확인합니다.
4. rotation·revocation과 process reload 동작을 테스트합니다.
5. config 변경이 rollback 가능한지 봅니다.

### 면접에서 설명한다면

Image는 환경과 무관한 artifact로 만들고 endpoint·flag는 runtime config로 주입합니다. Secret은 image·source·log에 넣지 않고 최소 권한과 rotation·revocation을 별도로 설계해야 합니다. rotation은 값 교체만이 아니라 열린 connection과 process reload까지 포함합니다.

