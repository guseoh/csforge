---
kind: concept
contentKey: infrastructure.core.compute.resource-boundaries
topicContentKey: infrastructure.core.compute
slug: resource-boundaries
title: "리소스 요청과 제한"
summary: "CPU·메모리 요청(request)과 제한(limit)이 스케줄링·실행에 미치는 영향을 구분하고 throttling·OOM·축출을 용량 관점에서 판단한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/"
    title: "Kubernetes Documentation: Resource Management for Pods and Containers"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "자원 요청·제한과 스케줄링·실행 중 강제 방식 확인"
---
# 리소스 요청과 제한

Kubernetes에서 CPU와 메모리 값을 선언하는 것은 단순한 문서화가 아닙니다. **요청(request)은 스케줄러가 Pod를 어디에 배치할지 판단하는 기준**이 되고, 제한(limit)은 실행 중 컨테이너가 사용할 수 있는 자원 상한과 연결됩니다.

```text
노드: 4 CPU / 8 GiB

Pod A 요청: 1 CPU / 2 GiB
Pod B 요청: 2 CPU / 4 GiB
        │
        └─ 스케줄러가 배치 가능성을 계산
```

요청보다 더 많은 CPU나 메모리를 사용할 수 있는 여유 자원이 노드에 있으면 컨테이너가 요청량을 초과해 사용할 수 있습니다. 요청은 실행 상한이 아니라 스케줄러가 배치 가능성을 계산할 때 보는 기준이므로, 실제 필요량보다 지나치게 낮으면 여러 워크로드가 몰려 자원 경쟁이 커지고 과하게 높으면 자원이 남아도 Pod가 배치되지 못할 수 있습니다.

### CPU와 메모리 제한은 실패 형태가 다르다

CPU 제한은 throttling으로 적용되어 지연 시간과 처리량에 영향을 줄 수 있습니다. 메모리 제한은 CPU처럼 초과 사용을 즉시 늦추지 않습니다. Linux 커널이 메모리 압박을 감지하면 OOM 종료가 일어날 수 있지만, 제한을 잠깐 넘었다고 즉시 종료되는 것은 아닙니다. 노드 전체에 메모리 압박이 생기면 요청량보다 더 사용 중인 Pod가 축출(eviction) 대상이 될 수도 있습니다.

```text
CPU 압박
→ throttling
→ 응답 지연 증가 가능

메모리 압박
→ OOM / 축출 가능
→ 프로세스 재시작
```

JVM 애플리케이션에서는 힙(heap)만 계산해서는 부족합니다. Metaspace, 스레드 스택, direct/native memory 같은 프로세스 메모리도 컨테이너의 메모리 예산 안에 들어갑니다.

### 선언값은 실제 사용량과 함께 조정한다

요청과 제한은 한 번 정하고 끝나는 상수가 아닙니다. 실제 CPU 사용률, 메모리 워킹 세트, throttling, OOM·재시작, 대기 중인 Pod를 관측해 워크로드에 맞게 조정해야 합니다.

또한 요청을 생략하고 제한만 설정했을 때 플랫폼이 요청 값을 어떻게 기본화하는지도 현재 Kubernetes 설정과 계약으로 확인합니다.

자원 설정의 목적은 최대한 작은 숫자를 넣는 것이 아니라 **스케줄러가 현실적인 처리 용량을 보게 하고, 한 워크로드가 다른 워크로드의 자원을 무제한으로 침범하지 못하게 하는 것**입니다.
