---
kind: concept
contentKey: java.core.object-model.static-vs-instance-members
topicContentKey: java.core.object-model
slug: static-vs-instance-members
title: "static 멤버와 인스턴스 멤버"
summary: "객체마다 따로 존재하는 상태와 클래스에 속하는 static 상태를 구분하고 공유 상태의 영향을 이해한다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: static 필드·메서드와 인스턴스 멤버 규칙 확인
---
# static 멤버와 인스턴스 멤버

Java 클래스 안에 있는 필드와 메서드가 모두 객체마다 따로 존재하는 것은 아닙니다. `static`이 붙지 않은 인스턴스 멤버는 객체를 기준으로 사용하고, `static` 멤버는 특정 객체가 아니라 **클래스 자체에 속한 멤버**입니다.

```java
class Member {
    static int totalCount;
    String name;

    Member(String name) {
        this.name = name;
        totalCount++;
    }
}
```

두 객체를 만들어 보면 차이가 분명합니다.

```java
Member a = new Member("kim");
Member b = new Member("lee");
```

```text
Member 클래스
└─ static totalCount = 2   ← 공유

Member 객체 a
└─ name = "kim"

Member 객체 b
└─ name = "lee"
```

`name`은 객체마다 별도 상태를 가지지만 `totalCount`는 클래스에 하나의 상태가 있어 모든 인스턴스가 함께 봅니다.

### static 메서드에는 `this`가 없다

인스턴스 메서드는 어떤 객체를 대상으로 호출되므로 그 객체를 가리키는 `this`를 사용할 수 있습니다.

```java
void rename(String name) {
    this.name = name;
}
```

반면 static 메서드는 특정 객체를 대상으로 실행되는 메서드가 아닙니다.

```java
static int totalCount() {
    return totalCount;
}
```

그래서 static 메서드에서 인스턴스 필드인 `name`을 그냥 읽을 수 없습니다. 어떤 `Member` 객체의 `name`인지 정해져 있지 않기 때문입니다.

필요하다면 객체를 매개변수로 받아 명시적으로 접근해야 합니다.

### static은 전역 공유 상태를 만들 수 있다

`static final` 상수처럼 변하지 않는 값을 두는 용도는 이해하기 쉽습니다.

```java
static final int MAX_RETRY = 3;
```

하지만 변경 가능한 static 필드는 애플리케이션 전체에서 공유되기 때문에 주의해야 합니다.

```java
static int currentUserId;
```

여러 요청이나 스레드가 이 값을 함께 바꾸면 서로의 상태가 섞일 수 있습니다. 그래서 “객체를 하나만 만들기 귀찮으니 static으로 둔다”는 식의 사용은 설계를 어렵게 만들 수 있습니다.

Spring의 singleton Bean도 여러 곳에서 같은 객체를 참조할 수 있지만, **static 멤버와 singleton 객체는 같은 개념이 아닙니다.** Spring Bean의 생명주기와 공유는 컨테이너가 관리하고, static은 Java 클래스 차원의 언어 기능입니다.

### static 메서드는 언제 자연스러운가

객체 상태와 관계없이 입력만으로 결과를 계산하는 유틸리티 동작이나, 이름 있는 생성 API는 static 메서드가 자연스러울 수 있습니다.

```java
static int max(int a, int b) { ... }
static Money of(long amount) { ... }
```

반대로 특정 객체의 상태를 읽거나 변경해야 하는 동작을 무리하게 static으로 만들면 객체의 책임이 흐려질 수 있습니다.

### 문제를 풀 때 확인할 것

코드 결과를 묻는 문제에서는 다음을 구분합니다.

1. 이 필드는 객체마다 하나인가, 클래스에 하나인가?
2. static 메서드에서 어떤 인스턴스에 접근하려는가?
3. 한 객체가 static 필드를 바꾸면 다른 객체에서 읽는 값도 바뀌는가?

특히 static 변경 가능 상태는 동시성 문제로 이어질 수 있다는 점도 기억해 두면 좋습니다.
