---
kind: concept
contentKey: java.core.io-nio.path-files-api
topicContentKey: java.core.io-nio
slug: path-files-api
title: "Path와 Files API"
summary: "파일 경로 값과 실제 파일 작업을 구분하고 상대 경로·실패·보안·자원 경계를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html"
    title: "Java SE 25 API: Path"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 경로 표현·resolve·normalize 등 Path 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html"
    title: "Java SE 25 API: Files"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 파일 생성·읽기·쓰기·복사·이동과 stream API 확인
  - url: "https://d2.naver.com/helloworld/1219"
    title: "네이버 D2: JDK 7의 NIO.2와 파일 API"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: Path·Files와 try-with-resources를 실제 파일 처리 흐름으로 연결
---
# Path와 Files API

파일 경로를 단순 문자열로 다루면 경로 조합과 상대 경로 의미를 코드가 직접 떠안게 됩니다. `Path`는 **파일 시스템 경로라는 값**을 표현하고, `Files`는 그 경로를 대상으로 실제 파일 시스템 작업을 수행합니다.

이 둘을 구분하는 것이 핵심입니다. `Path`를 만들었다고 파일이 생성되거나 열리는 것은 아닙니다.

### Path는 "어디인가"를 표현한다

```java
Path path = Path.of("content", "java", "note.txt");
```

이 코드는 경로 값을 만들 뿐 `note.txt`의 존재 여부를 확인하지 않습니다.

경로를 조합할 때도 문자열 연결보다 경로 연산을 사용할 수 있습니다.

```java
Path backup = Path.of("backup").resolve(path.getFileName());
```

### 상대 경로는 기준 위치에 따라 실제 대상이 달라진다

```java
Path relative = Path.of("data", "input.txt");
Path absolute = relative.toAbsolutePath();
```

상대 경로는 working directory 같은 실행 환경을 기준으로 해석됩니다. 같은 코드라도 IDE, container, 다른 실행 스크립트에서 기준 directory가 다르면 다른 파일을 가리킬 수 있습니다.

따라서 파일 위치가 애플리케이션 설정이라면 숨은 현재 directory에 기대기보다 명시적인 base path와 연결하는 편이 의미가 분명합니다.

### 실제 I/O와 실패는 Files 호출에서 발생한다

```java
String text = Files.readString(path, StandardCharsets.UTF_8);
Files.writeString(backup, text, StandardCharsets.UTF_8);
```

이 단계에서는 실제 파일 시스템 작업이 시도되므로 파일 없음, 권한 부족, I/O 오류 등이 발생할 수 있습니다.

```text
Path
 └─ 위치를 표현

Files.readString(path)
 └─ 실제 작업 시도
      ├─ 성공
      └─ I/O 실패
```

`Files.exists(path)`를 먼저 확인해도 이후 작업 성공이 보장되는 것은 아닙니다. 확인 직후 다른 process가 파일을 삭제하거나 권한 상태가 바뀔 수 있기 때문입니다. 실제 작업 자체가 실패할 수 있다는 계약을 처리해야 합니다.

### 편의 API와 streaming API는 데이터 크기에 따라 선택한다

`Files.readString()`과 `readAllBytes()`는 결과 전체를 메모리에 올리기 때문에 작은 파일에는 간단하고 유용합니다. 반대로 큰 파일을 순차 처리해야 한다면 stream이나 channel 기반 API가 더 적합할 수 있습니다.

"최신 API"를 고르는 것이 아니라 **데이터 전체를 한 번에 가져와도 되는가**를 기준으로 선택합니다.

### 경로 정규화와 접근 허용은 같은 문제가 아니다

```java
Path normalized = path.normalize();
```

`normalize()`는 `.`이나 `..` 같은 경로 구성 요소를 정리하는 연산이지, 사용자가 그 파일에 접근해도 되는지를 판단하는 authorization 기능은 아닙니다.

사용자 입력으로 파일 경로를 구성하는 기능에서는 허용된 root 밖으로 벗어나는지, symbolic link를 어떻게 다룰지 같은 보안 정책이 별도로 필요할 수 있습니다. Java I/O 관점에서 기억할 경계는 **경로를 계산하는 기능과 접근 권한 정책을 동일시하지 않는 것**입니다.

Path와 Files 코드를 읽을 때는 먼저 현재 코드가 경로 값만 만드는지 실제 I/O를 수행하는지 구분하세요. 그다음 상대 경로의 기준, 전체 메모리 로딩 여부, 실제 Files 작업의 실패 가능성을 확인하면 파일 처리 흐름을 안정적으로 추적할 수 있습니다.
