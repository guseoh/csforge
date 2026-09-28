---
kind: concept
contentKey: operating-systems.core.filesystem.file-abstraction
topicContentKey: operating-systems.core.filesystem
slug: file-abstraction
title: "파일 추상화(File Abstraction)"
summary: "영속적인 바이트 열과 메타데이터를 파일로 추상화하고 경로명·열린 상태와 구분하는 이유를 설명한다."
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
# 파일 추상화(File Abstraction)

파일 시스템에서 일반 파일(regular file)은 애플리케이션이 영속적인 데이터를 **연속된 바이트 열과 메타데이터를 가진 객체**로 다룰 수 있게 하는 추상화다. 파일의 이름인 경로명(pathname), 프로세스가 연 뒤 사용하는 파일 디스크립터, 커널이 관리하는 열린 상태는 이 파일 객체와 서로 다른 역할을 가진다.

```text
pathname ── lookup ──> file object
                         │
                       open
                         │
                         ▼
                process file descriptor
```

### 이름과 파일의 정체성을 구분한다

경로명은 파일 시스템의 이름 공간(namespace)에서 객체를 찾기 위한 이름이다. 같은 파일 객체에 여러 하드 링크가 연결될 수 있고, `rename()`으로 이름이 바뀌어도 이미 열린 파일 디스크립터는 기존 객체를 계속 참조할 수 있다.

따라서 `파일 이름 = 파일 객체의 정체성`이라고 보면 `rename`, `unlink`, 하드 링크와 열린 파일 디스크립터의 생명주기를 설명하기 어렵다.

### 파일 내용과 메타데이터도 서로 다른 상태다

파일에는 바이트 내용 외에도 크기, 소유자, 접근 권한, 시각 정보 같은 메타데이터가 있다. 파일 내용 변경과 메타데이터 변경은 파일 시스템 내부에서 서로 다른 영속 상태 갱신을 요구할 수 있다.

Unix 계열에서는 소켓이나 파이프도 파일 디스크립터를 통해 `read`/`write` 같은 공통 인터페이스를 사용할 수 있다. 하지만 이것이 소켓과 파이프가 일반 파일과 같은 영속성이나 탐색(seek) 의미를 가진다는 뜻은 아니다.

파일 추상화의 핵심은 **애플리케이션에 공통적인 바이트 중심 I/O 객체를 제공하면서, 경로명·열린 핸들·메타데이터·실제 영속 데이터를 서로 다른 층으로 구분하는 것**이다.