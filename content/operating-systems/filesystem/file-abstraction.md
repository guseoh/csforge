---
kind: concept
contentKey: operating-systems.core.filesystem.file-abstraction
topicContentKey: operating-systems.core.filesystem
slug: file-abstraction
title: "파일 추상화(파일 추상화)"
summary: "persistent 바이트 sequence와 메타데이터를 파일로 추상화하고 경로명·open 상태와 구분하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-intro.pdf"
    title: "Interlude: Files and Directories"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "file, pathname, descriptor, shared open-file state를 Unix file-system API 흐름으로 확인한다."
    displayOrder: 1
---
# 파일 추상화(파일 추상화)

파일 시스템에서 regular 파일은 애플리케이션이 persistent data를 **연속된 바이트 sequence와 메타데이터를 가진 객체**로 다룰 수 있게 하는 추상화이다. 파일의 이름(경로명), 프로세스가 연 뒤 사용하는 디스크립터, 커널의 open 상태는 이 파일 객체와 서로 다른 역할을 가진다.

```text
pathname ── lookup ──> file object
                         │
                       open
                         │
                         ▼
                process file descriptor
```

### 이름과 파일 식별자를 구분한다

경로명은 파일 시스템 네임스페이스에서 객체를 찾기 위한 이름이다. 같은 파일 객체에 여러 hard link가 연결될 수도 있고, rename으로 이름이 바뀌어도 이미 열린 디스크립터는 기존 객체를 계속 참조할 수 있다.

따라서 `filename = file identity`라고 보면 rename, unlink, hard link와 open 디스크립터의 수명을 설명하기 어렵다.

### Content와 메타데이터도 서로 다른 상태다

파일에는 바이트 content 외에도 size, ownership, 권한, timestamp 같은 메타데이터가 있다. Content 변경과 메타데이터 변경은 파일 시스템 내부에서 서로 다른 persistent 갱신를 요구할 수 있다.

Unix 계열에서는 socket이나 파이프도 파일 디스크립터를 통해 `read`/`write` 같은 공통 interface를 사용할 수 있다. 하지만 이것이 socket과 파이프가 regular 파일과 같은 persistence나 seek 의미를 가진다는 뜻은 아니다.

파일 추상화의 핵심은 **애플리케이션에 공통 바이트-oriented I/O 객체를 제공하면서, 경로명·open handle·메타데이터·실제 persistent data를 서로 다른 층으로 구분하는 것**이다.