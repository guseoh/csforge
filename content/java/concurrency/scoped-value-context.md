---
kind: concept
contentKey: java.core.concurrency.scoped-value-context
topicContentKey: java.core.concurrency
slug: scoped-value-context
title: "ScopedValue context"
summary: "Java 25의 ScopedValue가 값을 bounded dynamic scope에 바인딩하여 one-way context 전달에 사용하는 방식과 ThreadLocal과의 선택 trade-off를 이해하며, 참조된 객체 자체를 깊은 불변으로 만든다고 오해하지 않는다"
level: 3
status: PUBLISHED
displayOrder: 170
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ScopedValue.html"
    title: "Java SE 25 API: ScopedValue"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java 25 bounded dynamic scope와 binding 계약 확인
---
# ScopedValue context

## 쉬운 진입

호출 계층 전체에 request identity를 전달해야 하지만 모든 메서드 시그니처를 바꾸고
싶지 않을 때가 있다. ScopedValue는 key에 값을 특정 실행 범위 동안 binding하고, 그
범위 안의 호출자가 get으로 읽게 하는 bounded dynamic context다.

## 정확한 메커니즘

~~~
static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

ScopedValue.where(REQUEST_ID, "req-42").run(() -> {
    log(REQUEST_ID.get());
    callDeeper();
});
// 여기서는 REQUEST_ID.get()이 binding을 찾지 못한다.
~~~

binding은 run/call이 실행되는 동안만 유효하고, 범위를 벗어나면 자동으로 사라진다.
callee가 호출자의 binding을 임의로 set하는 ThreadLocal 방식이 아니라, 바깥에서 안쪽으로
읽기 전용으로 전달되는 모델이다. 중첩 scope는 별도 binding을 만들 수 있으며 현재 scope
규칙을 코드와 API 계약으로 확인한다.

ScopedValue에 객체 reference를 넣었다고 그 객체의 내부 상태가 deep immutable해지는
것은 아니다. mutable value를 공유하면 여전히 ownership과 동기화가 필요하다. ThreadLocal은
thread별로 값을 변경하고 오래 보관하는 모델에, ScopedValue는 짧고 bounded한 호출
context와 structured concurrency 같은 전달 모델에 더 잘 맞는 trade-off가 있다.

## 흔한 오해

- binding은 애플리케이션 전체 전역 변수처럼 영구 지속되지 않는다.
- ScopedValue가 참조된 객체를 deep copy하거나 deep freeze하지 않는다.
- binding 범위 밖에서 get()이 항상 이전 값을 반환한다고 가정할 수 없다.
