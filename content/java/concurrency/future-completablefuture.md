---
kind: concept
contentKey: java.core.concurrency.future-completablefuture
topicContentKey: java.core.concurrency
slug: future-completablefuture
title: "Future and CompletableFuture"
summary: "아직 끝나지 않은 작업의 결과를 Future로 다루고 CompletableFuture에서 결과·실패·다음 작업을 stage로 연결하는 방식을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 180
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html"
    title: "Java SE 25 API: CompletableFuture"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: completion stage와 sync/async method 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Future.html"
    title: "Java SE 25 API: Future"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 결과 조회와 cancellation 계약 확인
---
# Future와 CompletableFuture로 비동기 결과 다루기

작업을 다른 thread에 맡겼다면 호출 직후에는 아직 결과가 없을 수 있습니다. 그렇다고 결과가 생길 때까지 무조건 현재 thread를 붙잡고 있을 필요는 없습니다. **"나중에 완료될 결과"를 하나의 객체로 표현**하면 제출 시점과 결과 사용 시점을 분리할 수 있습니다.

`Future`는 그 결과를 가리키는 handle이고, `CompletableFuture`는 결과에 다음 작업과 실패 처리를 연결하는 기능까지 제공합니다.

### Future는 "나중에 결과가 생길 작업"을 가리킨다

```java
ExecutorService executor = Executors.newFixedThreadPool(2);

Future<Integer> future = executor.submit(() -> calculate());

// 다른 일을 할 수 있음
int result = future.get();
```

`submit()`이 반환됐다고 task가 완료된 것은 아닙니다. `future.get()`을 호출한 시점에도 결과가 준비되지 않았다면 현재 thread는 완료될 때까지 기다릴 수 있습니다.

```text
caller ─ submit ─▶ executor/task
  │                    │
  │ 다른 작업           │ 계산 중
  │                    ▼
  └──── get() ◀──── result
```

그래서 Future를 사용한다고 코드 전체가 자동으로 non-blocking이 되는 것은 아닙니다. 어디에서 `get()`으로 기다리는지가 중요합니다.

### CompletableFuture는 완료 뒤의 흐름을 연결한다

```java
CompletableFuture<User> userFuture = loadUserAsync(id);

CompletableFuture<String> nameFuture = userFuture
        .thenApply(User::name);
```

`thenApply`는 앞 stage의 결과가 생기면 그 값을 다른 값으로 바꿉니다.

```text
CompletableFuture<User>
        │ complete
        ▼
    thenApply
        │
        ▼
CompletableFuture<String>
```

caller가 중간마다 `get()`해서 기다리기보다 "결과가 생기면 무엇을 할지"를 연결할 수 있습니다.

### `thenApply`와 `thenCompose`는 중첩 결과 때문에 구분한다

단순 값 변환이면 `thenApply`가 자연스럽습니다.

```java
CompletableFuture<String> name = userFuture.thenApply(User::name);
```

하지만 다음 함수 자체가 또 비동기 결과를 반환한다면 상황이 다릅니다.

```java
CompletableFuture<Profile> loadProfile(User user)
```

`thenApply(this::loadProfile)`을 쓰면 개념적으로 `CompletableFuture<CompletableFuture<Profile>>`처럼 중첩된 결과가 생깁니다. 이때 `thenCompose`는 다음 비동기 stage를 하나의 흐름으로 연결합니다.

```java
CompletableFuture<Profile> profile = userFuture
        .thenCompose(this::loadProfile);
```

`map`과 `flatMap`의 차이를 떠올릴 수 있지만, 용어보다 **다음 함수가 일반 값인지 또 다른 비동기 결과인지**를 보는 것이 핵심입니다.

### Async가 붙었다고 "새 thread를 하나 만든다"는 뜻은 아니다

`thenApply`와 `thenApplyAsync`의 차이를 단순히 "현재 thread / 새 thread"로 외우면 틀릴 수 있습니다.

Async suffix가 없는 stage는 completion을 일으킨 thread나 해당 completion을 처리하는 thread에서 실행될 수 있습니다. Async 계열은 명시적인 executor를 주지 않으면 `CompletableFuture`가 정한 기본 비동기 실행 시설을 사용합니다.

```java
future.thenApplyAsync(this::transform, myExecutor);
```

어느 executor에서 실행되어야 하는지가 중요하다면 직접 전달하는 것이 명확합니다. API가 특정 OS thread 이름이나 정확한 실행 순서를 보장한다고 가정하지 않습니다.

### 예외도 결과의 한 상태다

비동기 작업은 정상 값 대신 실패로 완료될 수 있습니다.

```java
CompletableFuture<String> result = loadAsync()
        .thenApply(this::transform)
        .exceptionally(error -> "fallback");
```

`exceptionally`, `handle`, `whenComplete`는 역할이 다릅니다.

- `exceptionally`: 실패를 다른 결과로 복구하는 데 사용 가능
- `handle`: 정상/실패 양쪽 결과를 보고 새 결과로 변환 가능
- `whenComplete`: 결과/실패를 관찰하는 side-effect에 가깝고 원래 completion 의미를 유지하는 데 주로 사용

정확한 예외 전달과 wrapping 규칙은 각 API 계약을 확인합니다.

중요한 것은 예외를 `exceptionally(e -> null)`처럼 무조건 삼켜 "성공한 null"로 바꾸지 않는 것입니다. 호출자가 실패와 정상 빈 값을 구분해야 할 수 있습니다.

### 여러 작업을 합칠 때는 실패와 완료 조건을 같이 본다

```java
CompletableFuture<User> user = loadUser();
CompletableFuture<Order> order = loadOrder();

CompletableFuture<Void> both = CompletableFuture.allOf(user, order);
```

여러 독립 작업을 동시에 시작한 뒤 모두 끝날 때까지 기다리는 구조를 만들 수 있습니다. 하지만 `allOf` 결과 자체가 각 결과값을 리스트로 자동 모아 주는 것은 아닙니다. 원래 future들의 값을 별도로 읽어야 합니다.

또 하나가 실패했을 때 나머지 작업을 취소해야 하는지, 모두 끝난 뒤 실패를 모을지 같은 정책은 업무 요구사항입니다.

### cancellation은 실행 중인 모든 일을 강제로 멈추는 마법이 아니다

```java
future.cancel(true);
```

`Future`의 cancellation과 실제 task가 자원을 정리하고 중단되는 것은 구분해야 합니다. 특히 `CompletableFuture`의 cancellation은 해당 future의 완료 상태를 바꾸는 의미가 중심이며, 이미 실행 중인 외부 HTTP 요청이나 DB 작업을 반드시 강제로 끊는다고 생각하면 안 됩니다.

작업 코드가 interruption/cancellation에 어떻게 협력하는지, 사용하는 I/O API가 cancellation을 어떻게 지원하는지 별도로 봅니다.

### 공유 상태보다 결과 전달을 우선 생각한다

비동기 작업 여러 개가 같은 mutable collection을 직접 수정하게 만들기보다 각 future가 결과를 만들고 마지막 단계에서 합치는 구조가 이해하기 쉬운 경우가 많습니다.

```text
Task A -> Result A ┐
                   ├─ combine -> Final Result
Task B -> Result B ┘
```

이런 구조는 race를 줄이고 실패가 어느 stage에서 났는지 추적하기도 쉽습니다.

### 문제를 풀 때 확인할 것

1. task가 제출된 시점과 실제 완료 시점을 구분합니다.
2. `get/join`이 어느 thread를 기다리게 하는지 확인합니다.
3. 다음 함수가 일반 값을 반환하는지 또 Future/CompletionStage를 반환하는지 봅니다.
4. Async 메서드가 어떤 executor를 사용하는지 확인합니다.
5. 정상 완료와 exceptional completion을 따로 추적합니다.
6. cancellation이 underlying 작업을 실제로 멈추는지 추측하지 않습니다.

### 면접에서 설명한다면

`Future`는 아직 완료되지 않은 작업의 결과를 나중에 조회할 수 있게 하고, `CompletableFuture`는 결과가 완료됐을 때 다음 변환·비동기 작업·예외 처리를 stage로 연결할 수 있게 합니다. `thenApply`는 값 변환, `thenCompose`는 또 다른 비동기 결과를 이어 붙일 때 사용합니다. Async 실행 위치와 cancellation 동작은 API 계약과 executor를 확인해야 하며, Future를 사용한다고 모든 코드가 자동으로 non-blocking이 되는 것은 아닙니다.
