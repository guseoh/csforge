---
kind: concept
contentKey: java.core.metadata-compatibility.annotation-processing-vs-reflection
topicContentKey: java.core.metadata-compatibility
slug: annotation-processing-vs-reflection
title: "애너테이션 처리(Annotation Processing)와 리플렉션(Reflection)"
summary: "애너테이션을 컴파일 시점에 읽어 코드를 생성하는 처리 방식과 실행 중 메타데이터를 읽는 리플렉션의 시점·결과물·장단점을 구분한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.compiler/javax/annotation/processing/package-summary.html"
    title: "Java SE 25 API: javax.annotation.processing"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: compile-time annotation processing API 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/package-summary.html"
    title: "Java SE 25 API: java.lang.reflect"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: runtime reflection phase와 결과 확인
---
# 애너테이션 처리(Annotation Processing)와 리플렉션(Reflection)

같은 애너테이션 메타데이터라도 **언제 읽는지**에 따라 설계가 달라집니다. 컴파일 중 애너테이션 프로세서가 메타데이터를 읽어 코드를 만들 수도 있고, 실행 중 프레임워크가 `Class`와 애너테이션을 리플렉션으로 조사할 수도 있습니다.

### 애너테이션 처리는 컴파일 과정에 참여한다

애너테이션 프로세서는 `javac`의 처리 단계(processing round)에 참여해 소스·타입 모델을 읽고 검증하거나 새 소스 코드를 생성할 수 있습니다.

```text
소스 코드 + 애너테이션
       │
       ▼
      javac
       │
애너테이션 프로세서
  ├─ 규칙 검증
  ├─ 컴파일 오류 보고
  └─ 소스 코드 생성
       │
       ▼
   클래스 파일 산출물
```

예를 들어 빌드 시점에 매퍼 타입을 모두 알고 있다면 프로세서가 구현체를 생성하고, 실행 시점에는 이미 만들어진 일반 Java 클래스를 사용할 수 있습니다.

이 방식의 중요한 장점은 잘못된 메타데이터나 타입 관계를 **컴파일 시점에 발견할 수 있다는 것**입니다. 대신 프로세서 설정, 생성된 소스 코드, IDE·빌드 도구 연동에 따른 빌드 복잡성이 추가됩니다.

### 리플렉션은 로드된 런타임 타입을 조사한다

리플렉션은 프로그램 실행 중 `Class`, `Method`, `Field`와 같은 런타임 메타데이터를 조사합니다.

```java
Class<?> type = UserService.class;
Audited audited = type.getAnnotation(Audited.class);
```

```text
클래스 산출물
      │
    JVM 로딩
      │
      ▼
   Class<?> object
      │
  리플렉션
      ▼
실행 시점 메타데이터
```

빌드 시점에 어떤 타입이 들어올지 알 수 없는 플러그인이나 프레임워크 확장에서는 이런 동적 성질이 유용합니다.

### 차이의 핵심은 결정 시점과 산출물이다

| 구분 | Annotation Processing | Reflection |
| --- | --- | --- |
| 주요 시점 | 컴파일 시점 | 실행 시점 |
| 보는 대상 | 소스·타입 모델 | 로드된 `Class`와 멤버 정보 |
| 오류 발견 | 컴파일 중 가능 | 실행 중 발견 가능 |
| 대표 산출물 | 생성된 소스 코드·class file | 실행 시점의 메타데이터 조회·호출 |
| 동적 타입 대응 | 빌드 시점 정보에 제한됨 | 실제 로드된 타입 조사 가능 |

둘은 경쟁 기술이라기보다 서로 다른 시점의 도구입니다.

### 보존 정책(Retention)은 메타데이터를 읽는 시점에 맞춰야 한다

컴파일 시 애너테이션 프로세서만 애너테이션을 읽는다면 실행 시점 보존 정책은 필요하지 않을 수 있습니다.

```java
@Retention(RetentionPolicy.SOURCE)
@interface GenerateMapper {}
```

반대로 실행 시점 리플렉션으로 애너테이션을 찾아야 한다면 `RUNTIME` 보존 정책이 필요합니다.

```java
@Retention(RetentionPolicy.RUNTIME)
@interface Audited {}
```

따라서 보존 정책을 고를 때는 "더 오래 남는 것이 좋은가"보다 **실제 사용 주체(consumer)가 언제 메타데이터를 읽는가**를 살펴야 합니다.

### 생성된 코드는 실행 시점 비용을 줄일 수 있지만 공짜는 아니다

빌드 시점에 코드를 생성하면 실행 중 리플렉션 조회를 줄이고 컴파일러의 타입 검사를 활용할 수 있습니다. 하지만 생성 산출물 증가, 컴파일 시간, 프로세서와 컴파일러의 호환성 비용이 생깁니다.

반대로 리플렉션은 실행 중 타입을 유연하게 다룰 수 있지만 멤버 조회와 접근 실패가 실행 시점에 드러날 수 있습니다. 프레임워크가 시작할 때 메타데이터를 한 번 읽어 캐시하는지, 자주 실행되는 경로에서 매번 리플렉션을 사용하는지도 성능 판단에 영향을 줍니다.

따라서 "reflection은 느리니 무조건 processor" 또는 "processor가 최신이니 항상 더 낫다" 같은 선택은 피합니다.

### 하나의 프레임워크가 두 방식을 함께 사용할 수도 있다

실제 생태계에서는 컴파일 시점 메타데이터·색인을 만들고 실행 중 일부 리플렉션을 사용하는 혼합 구조가 흔합니다. 라이브러리 이름만으로 분류하기보다 다음을 확인합니다.

- 빌드 중 어떤 산출물이 만들어지는가
- 실행 중 리플렉션 조회가 남는가
- 애너테이션 보존 정책이 어느 단계에서 쓰이는가

Spring을 실행 시점의 리플렉션·프록시만 사용하는 방식으로 한정해 설명하기는 어렵습니다. 기능에 따라 빌드 시점/AOT 처리가 함께 사용될 수 있습니다.

### 정리

애너테이션 처리는 컴파일 과정에서 소스·타입 모델을 읽어 검증하거나 코드를 생성하는 방식이고, 리플렉션은 실행 중 로드된 `Class`와 멤버 메타데이터를 조사하는 방식입니다. 처리는 오류를 일찍 발견하고 코드를 생성할 수 있지만 빌드가 복잡해집니다. 리플렉션은 실행 중 동적으로 알게 되는 타입을 다루기 쉽습니다. 선택 기준은 기술 이름보다 **메타데이터를 언제 알고, 언제 결정해야 하는가**입니다.
