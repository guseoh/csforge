---
kind: concept
contentKey: java.core.metadata-compatibility.binary-compatibility-api-evolution
topicContentKey: java.core.metadata-compatibility
slug: binary-compatibility-api-evolution
title: "Binary compatibility and API evolution"
summary: "library/API를 변경할 때 source compatibility, binary compatibility, runtime compatibility가 서로 다른 문제임을 구분한다"
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-13.html"
    title: "Java SE 25 JLS Chapter 13: Binary Compatibility"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: binary compatibility rules 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/NoSuchMethodError.html"
    title: "Java SE 25 API: NoSuchMethodError"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: binary linkage failure의 runtime 증상 확인
---
# Binary compatibility와 API evolution

## 쉬운 진입

library를 바꾼 뒤 기존 source가 다시 compile되는지, 이미 compile된 client가 새
library와 링크되는지, 실행 중 behavior가 계약을 지키는지는 서로 다른 질문이다.
source compatibility와 binary compatibility를 같다고 부르면 배포 단계의 오류를
놓치게 된다.

## 정확한 메커니즘

~~~
client.java --compile with v1--> client.class
                                  |
                         run with library v2
~~~

source compatibility는 기존 source가 새 API로 compile되는지의 문제다. binary
compatibility는 기존 class file이 새 library의 type/member와 계속 링크될 수 있는지의
문제이며, public method 삭제·signature 변경은 NoSuchMethodError 같은 linkage failure를
만들 수 있다. runtime compatibility는 링크가 되더라도 behavior, exception, timing,
serialization/module contract가 client 기대를 유지하는지까지 포함하는 더 넓은
운영 질문이다.

예를 들어 새 overload를 추가하는 것은 기존 binary에 영향을 덜 줄 수 있지만, source
재컴파일 시 overload resolution 결과가 달라질 수 있다. 반대로 구현을 바꿔 binary
link는 유지해도 동작 계약이 깨질 수 있다. API evolution은 공개 surface, default
method, field/method descriptor, module exports와 실제 client를 함께 검토한다.

## 흔한 오해

- source compatible이면 기존 binary도 항상 compatible하다는 뜻이 아니다.
- binary linkage가 성공했다고 runtime behavior compatibility가 보장되는 것은 아니다.
- public API에서 method body만 바꾸면 모든 호환성 문제가 사라진다고 할 수 없다.
