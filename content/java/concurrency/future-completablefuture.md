---
kind: concept
contentKey: java.core.concurrency.future-completablefuture
topicContentKey: java.core.concurrency
slug: future-completablefuture
title: "Future and CompletableFuture"
summary: "비동기 결과의 completion과 failure를 다루고 CompletableFuture stage composition과 executor/thread 동작을 이해한다"
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
    relationNote: result retrieval와 cancellation 계약 확인
---
# Future와 CompletableFuture

## 쉬운 진입

Future는 아직 끝나지 않은 작업의 결과를 나중에 확인하는 handle이다. CompletableFuture는
결과를 직접 complete할 수 있고, 결과가 오면 다음 함수를 연결하는 CompletionStage
composition을 제공한다. 따라서 blocking get을 여러 번 호출하는 대신 데이터 흐름을
stage로 표현할 수 있다.

## 정확한 메커니즘

~~~
CompletableFuture<User> user = loadUserAsync(id);
CompletableFuture<String> name = user
        .thenCompose(this::loadProfile)
        .thenApply(Profile::displayName)
        .exceptionally(error -> "unknown");
~~~

thenApply는 값 변환이고, 함수가 또 다른 CompletionStage를 반환하면 thenCompose로
중첩 future를 평탄화한다. thenApply 같은 non-async stage는 현재 stage를 완료시키는
thread나 completion을 관찰하는 caller가 실행할 수 있다. thenApplyAsync 계열은 명시적
executor를 주지 않으면 CompletableFuture API가 정의한 default async execution facility를
사용하며, Java API 문서의 예외 조건까지 포함한 범위로 이해해야 한다. 어떤 thread에서
실행될지 필요하면 executor를 직접 전달한다.

예외는 stage의 exceptional completion이 되며 exceptionally/handle/whenComplete의
역할을 구분한다. cancel은 future를 취소 상태로 완료하지만 underlying 작업을 항상
강제 종료한다는 보장은 없으므로 interrupt와 자원 정리를 별도로 설계한다. 실패한
stage에 어떤 후속 stage가 실행되는지는 completion method의 contract를 따른다.

## 흔한 오해

- thenApply와 thenCompose는 둘 다 같은 수준의 future를 만드는 API가 아니다.
- Async suffix가 없으면 반드시 호출 thread에서 실행된다고 보장되지 않는다.
- CompletableFuture.cancel()이 이미 실행 중인 외부 작업을 반드시 중단시키지 않는다.
