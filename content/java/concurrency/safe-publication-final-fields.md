---
kind: concept
contentKey: java.core.concurrency.safe-publication-final-fields
topicContentKey: java.core.concurrency
slug: safe-publication-final-fields
title: "Safe publication and final fields"
summary: "새 객체를 다른 thread에 전달할 때 안전한 publication이 필요한 이유와 final field semantics, volatile/lock/static initialization 같은 publication 경계를 이해한다"
level: 3
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.5"
    title: "Java SE 25 JLS: final Field Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: final field의 초기화와 관찰 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java SE 25 JLS Chapter 17: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: publication과 synchronization 관계 확인
---
# Safe publication과 final field

## 쉬운 진입

객체를 만들었다고 다른 thread가 생성자의 모든 결과를 안전하게 본다는 뜻은 아니다.
생성 중인 객체가 밖으로 새거나, 공유 참조를 동기화 없이 노출하면 reader가 초기화되지
않은 상태를 관찰할 수 있다. 객체 참조를 전달하는 방법 자체가 publication contract다.

## 정확한 메커니즘

~~~
final class Config {
    private final int port;
    private final List<String> hosts;

    Config(int port, List<String> hosts) {
        this.port = port;
        this.hosts = List.copyOf(hosts);
    }
}

private volatile Config current;
void publish(Config next) { current = next; }
Config read() { return current; }
~~~

final field는 생성자 종료 전후의 특정 초기화 관찰을 위한 JLS 규칙을 제공하지만, 이것이
객체 전체를 자동으로 thread-safe하게 만들거나 final reference가 가리키는 mutable 객체를
깊이 불변으로 만들지는 않는다. 생성자에서 this를 다른 thread나 callback에 전달하는
constructor escape는 피한다. static initialization, volatile 참조, synchronized lock,
concurrent collection 삽입 같은 경계는 객체 상태를 전달하는 happens-before를 만들 수 있다.

안전한 publication과 immutability는 서로 보완되는 별도 문제다. 참조를 안전하게 읽어도
그 객체를 이후 mutate하면 별도의 state 보호가 필요하다. 반대로 객체가 불변이어도 안전한
경계 없이 참조를 전달하는 코드는 publication을 설명해야 한다.

## 흔한 오해

- final field가 붙은 참조의 내부 collection까지 불변으로 만들지 않는다.
- 생성자 안에서 this를 저장해도 final semantics가 constructor escape를 고쳐 주지 않는다.
- volatile 참조는 참조 교체의 publication을 돕지만 객체의 모든 후속 변경을 원자화하지 않는다.
