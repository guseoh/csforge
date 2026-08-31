---
kind: concept
contentKey: java.core.metadata-compatibility.annotations-retention-target
topicContentKey: java.core.metadata-compatibility
slug: annotations-retention-target
title: "Annotations, Retention, and Target"
summary: "annotation metadata와 @Target, @Retention, runtime visibility, meta-annotation의 기본 의미를 설명한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/package-summary.html"
    title: "Java SE 25 API: java.lang.annotation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: annotation support와 meta-annotation 개요 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/RetentionPolicy.html"
    title: "Java SE 25 API: RetentionPolicy"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: SOURCE·CLASS·RUNTIME 보존 정책 확인
---
# Annotation·Retention·Target

## 쉬운 진입

annotation은 class나 method에 붙이는 metadata다. compiler, annotation processor,
문서 도구, runtime framework가 그 metadata를 서로 다른 시점에 읽는다. 따라서 “annotation을
붙였다”와 “runtime reflection으로 볼 수 있다”는 같은 말이 아니다.

## 정확한 메커니즘

~~~
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@interface Audited {}

@Audited
void save() {}
~~~

@Target은 annotation을 붙일 수 있는 syntax location을 제한한다. @Retention은
SOURCE(compile 후 유지할 필요 없음), CLASS(class file에 보존하지만 runtime visibility
보장 없음), RUNTIME(runtime reflection으로 조회 가능) 중 보존 정책을 표현한다.
@Target과 @Retention 자체가 annotation interface에 붙는 meta-annotation이다.

runtime에서 getAnnotation으로 조회하려면 RUNTIME이어야 하며, inheritance·repeatable·
type-use처럼 별도 정책은 관련 meta-annotation과 AnnotatedElement API를 함께 본다.
annotation 값은 metadata이지 자동 validation·실행·aspect가 아니며, 실제 처리는
compiler/processor/framework 또는 application code가 소유한다.

## 흔한 오해

- CLASS retention annotation을 일반 reflection에서 항상 찾을 수 있는 것은 아니다.
- @Target이 지정되지 않았다고 모든 가능한 위치에서 같은 방식으로 사용된다고 단정하지 않는다.
- annotation을 선언했다고 그 자체로 business behavior가 실행되지 않는다.
