---
kind: concept
contentKey: java.core.concurrency.threadlocal-context
topicContentKey: java.core.concurrency
slug: threadlocal-context
title: "ThreadLocal context"
summary: "ThreadLocal이 값을 thread에 묶는 방식과 cleanup, thread pool reuse, async boundary, virtual thread 환경에서의 주의점을 설명한다"
level: 3
status: PUBLISHED
displayOrder: 160
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ThreadLocal.html"
    title: "Java SE 25 API: ThreadLocal"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: per-thread value와 remove 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Java SE 25 API: Thread"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: ThreadLocal과 virtual thread 관계 확인
---
# ThreadLocal context

## 쉬운 진입

ThreadLocal은 같은 변수처럼 보이지만 thread마다 별도의 값을 연결한다. 한 요청을
처리하는 동안 현재 사용자나 formatter를 편리하게 꺼낼 수 있지만, 값이 thread의
생명주기에 붙는다는 점이 핵심이다.

## 정확한 메커니즘

~~~
private static final ThreadLocal<RequestContext> CURRENT = new ThreadLocal<>();

void handle(Request request) {
    CURRENT.set(new RequestContext(request.id()));
    try {
        service();
    } finally {
        CURRENT.remove();
    }
}
~~~

thread pool은 worker를 재사용하므로 remove하지 않은 값이 다음 작업에 남거나 큰 object
graph를 오래 retain할 수 있다. task가 다른 executor나 CompletableFuture stage로
이동하면 ThreadLocal 값이 자동으로 따라간다고 가정할 수 없다. context를 명시적 인자로
전달하거나 해당 async framework의 propagation contract를 사용한다.

virtual thread는 task마다 많은 thread를 만들 수 있어 per-thread 값을 쓸 수 있지만,
그것이 context 전파·취소·정리를 자동으로 설계해 주지는 않는다. ThreadLocal은 mutable
공유 상태의 동기화 도구가 아니며, 값을 넣은 thread만 읽는다는 편의와 lifecycle 비용을
함께 평가한다.

## 흔한 오해

- ThreadLocal 값은 모든 thread가 공유하는 하나의 전역 값이 아니다.
- pool worker가 task 종료와 함께 사라진다고 가정할 수 없다.
- ThreadLocal이 async stage의 실행 thread로 context를 자동 전파하지 않는다.
