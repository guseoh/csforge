---
kind: concept
contentKey: java.core.collections.iterable-iterator-foreach-modification
topicContentKey: java.core.collections
slug: iterable-iterator-foreach-modification
title: "Iterable·Iterator와 foreach 중 수정"
summary: "반복자 계약, foreach 동작, 구조적 변경과 ConcurrentModificationException의 의미를 구분한다"
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Iterable.html"
    title: "Iterable API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: iterator와 forEach 동작 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Iterator.html"
    title: "Iterator API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: next/remove와 fail-fast 주의 확인
---
# Iterable·Iterator와 foreach 중 수정

## 쉬운 진입

foreach는 컬렉션 내부를 마법처럼 복사하는 문법이 아니라 Iterator를 사용해 원소를 순회하는
편의 문법이다. 순회 중 구조를 바꾸면 Iterator가 기대한 상태와 달라질 수 있다.

## 정확한 메커니즘

```java
for (Iterator<String> it = names.iterator(); it.hasNext(); ) {
    if (it.next().isBlank()) it.remove();
}
```

현재 Iterator의 `remove()`는 자신이 반환한 원소를 삭제하는 정식 경로다. 컬렉션의 `remove`
를 직접 호출하면 구현에 따라 `ConcurrentModificationException`이 날 수 있다. fail-fast는
동시 변경을 발견하면 best-effort로 빠르게 실패하는 진단 장치이지 thread-safety 보장이 아니다.

## 실전·면접 연결

더 복잡한 조건은 `removeIf`나 새 컬렉션으로 필터링해 의도를 드러낸다. 여러 스레드가 공유
컬렉션을 수정한다면 동기화·동시성 컬렉션·불변 snapshot을 별도로 선택해야 한다.

## 흔한 오해

- `ConcurrentModificationException`이 항상 발생하는 것은 아니다.
- 이름에 Concurrent가 있어도 일반 ArrayList가 동시 수정에 안전해지는 것은 아니다.
- 원소 객체의 내부 field 수정과 컬렉션 구조 수정은 다른 문제다.
