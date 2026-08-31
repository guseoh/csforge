---
kind: concept
contentKey: spring.core.production.graceful-shutdown
topicContentKey: spring.core.production
slug: graceful-shutdown
title: "Graceful shutdown과 종료 순서"
summary: "배포·종료 시 새 요청 유입을 줄이고 진행 중 작업에 제한된 완료 시간을 주며 connection·executor·외부 자원을 순서 있게 정리하는 이유를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-boot/reference/web/graceful-shutdown.html"
    title: "Spring Boot Reference: Graceful Shutdown"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: embedded web server graceful shutdown 동작과 timeout 설정 확인
---
# Graceful shutdown과 종료 순서

배포할 때 이전 프로세스를 즉시 죽여도 다음 프로세스가 바로 올라오면 괜찮다고 생각하기 쉽습니다. 하지만 기존 프로세스가 결제 요청을 처리 중이거나 큰 파일을 저장 중이었다면 종료 시점에 connection이 끊기면서 사용자는 실패를 보게 됩니다. Graceful shutdown은 “절대로 요청을 잃지 않는다”는 기능이 아니라 **종료 과정에서 새 작업은 줄이고 이미 시작한 작업에는 제한된 완료 기회를 주는 정책**입니다.

### 종료 시점에는 상태가 바뀐다

개념적으로는 다음 순서를 생각할 수 있습니다.

```text
정상 서비스
   │
   │ SIGTERM / application stop
   ▼
종료 시작
   │
   ├─ 새 요청 수신 중단 또는 readiness 해제
   │
   ├─ 진행 중 요청 완료 대기
   │
   ├─ executor / scheduler 정리
   │
   └─ DB pool / 기타 resource 종료
   ▼
프로세스 종료
```

중요한 점은 **영원히 기다릴 수는 없다는 것**입니다. 오래 걸리는 요청이나 멈춘 외부 API 호출 때문에 종료가 무한정 지연되면 배포 시스템이 강제 종료할 수 있습니다. 그래서 graceful shutdown에는 timeout이 함께 필요합니다.

### transaction이 있다고 요청 재실행까지 안전한 것은 아니다

주문 요청이 DB commit 직후 응답을 보내기 전에 프로세스가 종료되었다고 해 봅시다.

```text
Client        Server             DB
  │             │                 │
  │ POST order  │                 │
  ├────────────►│                 │
  │             │ INSERT/COMMIT   │
  │             ├────────────────►│
  │             │      OK         │
  │             │◄────────────────┤
  │             X process stops   │
  │ timeout     │                 │
  │◄────────────┘                 │
```

클라이언트는 결과를 모르기 때문에 재시도할 수 있습니다. 이미 DB에는 주문이 존재하므로 **graceful shutdown과 idempotency는 다른 문제**입니다. 종료를 부드럽게 해도 네트워크 단절과 “결과를 모르는 실패”는 완전히 제거할 수 없습니다.

### background task도 종료 정책이 필요하다

웹 요청만 기다리고 scheduler나 custom `ExecutorService`를 즉시 종료하면 background 작업이 중간에 끊길 수 있습니다. 반대로 모든 background job을 끝까지 기다리면 종료 시간이 너무 길어질 수 있습니다. 작업 특성에 따라 다음을 나눕니다.

| 작업                                | 종료 시 판단                             |
| ----------------------------------- | ---------------------------------------- |
| 짧은 HTTP 요청                      | 제한 시간 내 완료 대기                   |
| 재실행 가능한 batch chunk           | checkpoint 후 종료 가능                  |
| 외부로 이미 side effect를 보낸 작업 | idempotency/상태 기록 필요               |
| 긴 비동기 job                       | durable queue나 작업 상태 기반 재개 검토 |

### readiness와 liveness를 혼동하지 않는다

종료 직전에 프로세스 자체는 살아 있지만 **새 트래픽을 받을 준비는 끝난 상태**일 수 있습니다. 이때 readiness를 먼저 내려 load balancer가 새 요청을 보내지 않게 하고, 기존 요청을 drain한 뒤 종료하는 패턴을 사용합니다. liveness는 프로세스가 살아 있는지에 더 가까운 질문이므로 역할이 다릅니다.

Graceful shutdown의 핵심은 종료 시간을 예쁘게 만드는 것이 아닙니다. **새 요청 유입, 진행 중 요청, background 작업, DB/외부 side effect의 상태를 구분하고 어디까지 기다리고 어디부터 재시도·복구할지를 정하는 것**입니다.
