---
kind: concept
contentKey: java.core.jvm-runtime.reference-strengths
topicContentKey: java.core.jvm-runtime
slug: reference-strengths
title: "Reference strengths"
summary: "strong, soft, weak, phantom reference의 의미와 제한적인 사용 목적을 구분하고 일반 object lifetime 관리 수단처럼 남용하지 않는다"
level: 3
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ref/package-summary.html"
    title: "Java SE 25 API: java.lang.ref"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: reference strength와 처리 시점 개요 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ref/PhantomReference.html"
    title: "PhantomReference (Java SE 25 API)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: phantom reference와 ReferenceQueue 사용 확인
---
# Reference strength

## 쉬운 진입

일반 변수로 객체를 가리키는 strong reference가 있으면 GC가 그 객체를 마음대로
회수하지 않는다. 반면 weak·soft·phantom reference는 “이 참조만으로는 객체를
강하게 보존하지 않겠다”는 서로 다른 목적과 관찰 규칙을 제공한다.

## 정확한 메커니즘

| 종류 | 학습 포인트 | 제한적인 사용 예 |
|---|---|---|
| strong | 일반 참조이며 도달 가능성을 유지 | 일반 객체 소유 |
| soft | memory pressure와 연관된 처리 정책 | JVM 정책을 허용할 수 있는 보조 데이터 |
| weak | strong 참조가 사라지면 수집 후보가 됨 | canonical mapping, metadata 보조 |
| phantom | get으로 객체를 되살릴 수 없고 queue로 처리 관찰 | cleanup/reclamation 알림 |

ReferenceQueue를 사용하면 reference processing을 관찰할 수 있지만, 이것이 deterministic
destructor는 아니다. SoftReference를 일반 cache eviction 정책으로 추천할 수 없는 이유는
cache hit 정책·메모리 압력·runtime 동작을 애플리케이션이 정밀하게 제어하지 못하기
때문이다. 캐시는 명시적인 크기·만료·무효화 정책을 우선 설계한다.

## 흔한 오해

- weak reference가 있다고 객체가 즉시 회수되는 것은 아니다.
- PhantomReference.get()으로 원래 객체를 얻을 수 없다.
- SoftReference가 모든 cache에 맞는 자동 메모리 관리자라는 보장은 없다.
