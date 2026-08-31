---
kind: concept
contentKey: java.core.io-nio.path-files-api
topicContentKey: java.core.io-nio
slug: path-files-api
title: "Path and Files API"
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
---
# Path and Files API

파일 경로를 단순 문자열로 이어 붙이면 운영체제별 구분자, 상대 경로, `..`, symbolic link 같은 문제를 직접 처리하게 됩니다. `Path`는 **파일 시스템 경로라는 값을 표현하는 타입**이고 `Files`는 그 경로를 대상으로 실제 파일 시스템 작업을 수행하는 API입니다.

둘을 구분하는 것이 첫 번째 핵심입니다. `Path` 객체를 만들었다고 파일을 열거나 생성한 것이 아닙니다.

### Path는 경로를 표현하는 값이다

```java
Path path = Path.of("content", "java", "note.txt");
```

이 코드는 경로 값을 만들 뿐 실제 `note.txt`가 존재하는지 확인하지 않습니다.

```java
Path backup = Path.of("backup").resolve(path.getFileName());
```

문자열을 `"backup/" + fileName`처럼 직접 합치는 대신 `resolve`를 사용하면 경로 연산의 의도가 더 분명합니다.

### 상대 경로는 기준 위치가 필요하다

```java
Path relative = Path.of("data", "input.txt");
Path absolute = relative.toAbsolutePath();
```

상대 경로가 실제 어디를 가리키는지는 process의 working directory 같은 실행 환경과 연결됩니다. IntelliJ에서 실행할 때와 Docker container에서 실행할 때 working directory가 다르면 같은 상대 경로가 다른 파일을 가리킬 수 있습니다.

따라서 운영에 필요한 파일 위치라면 "현재 디렉터리겠지"라는 숨은 가정보다 설정이나 명시적인 base path를 사용하는 편이 안전합니다.

### 실제 파일 작업은 Files가 수행한다

```java
String text = Files.readString(path, StandardCharsets.UTF_8);
Files.writeString(backup, text, StandardCharsets.UTF_8);
```

이 시점에는 실제 I/O가 발생할 수 있고 파일이 없거나 권한이 부족하거나 storage 오류가 나면 실패합니다.

```text
Path
 └─ "어디인가"를 표현

Files.readString(path)
 └─ 그 위치에서 실제 작업 시도
      ├─ 성공
      └─ 파일 없음 / 권한 / I/O 오류
```

### `exists`를 먼저 확인해도 경쟁 조건은 사라지지 않는다

```java
if (Files.exists(path)) {
    return Files.readString(path);
}
```

`exists()`가 true를 반환한 직후 다른 process가 파일을 삭제할 수도 있습니다. 두 호출 사이의 세상은 바뀔 수 있습니다. 이를 흔히 check-then-act 형태의 경쟁 조건으로 볼 수 있습니다.

그래서 실제 작업 자체가 실패할 수 있다는 사실을 받아들이고 `IOException` 등 실패 경계를 처리해야 합니다.

### 작은 파일용 편의 API와 stream API를 구분한다

`Files.readString`, `Files.readAllBytes`는 편리하지만 결과 전체를 메모리에 올립니다. 작은 설정 파일에는 적합할 수 있지만 수 GB 파일을 그대로 읽는 데 기계적으로 사용하면 메모리 문제가 생길 수 있습니다.

큰 데이터를 순차 처리해야 한다면 stream/channel 기반 API를 검토합니다. 중요한 것은 "최신 API"가 아니라 **데이터 크기와 처리 방식에 맞는 API를 선택하는 것**입니다.

### 사용자 입력 경로는 보안 경계다

웹 요청으로 받은 파일 이름을 그대로 `resolve`한다고 안전한 것은 아닙니다.

```text
허용 root: /app/uploads
사용자 입력: ../../secret.txt
```

`normalize()`는 경로 모양을 정리하는 기능이지 사용자가 접근해도 되는 파일인지 판단하는 authorization 기능이 아닙니다. 파일 다운로드나 업로드를 구현할 때는 허용된 root 경계, symbolic link, 실제 대상 경로, 접근 권한 등을 함께 검토해야 합니다.

Security 영역에서는 path traversal 공격을 더 깊게 다루지만 Java I/O 관점에서도 **Path 조작과 접근 허용 정책을 같은 것으로 보지 않는 것**이 중요합니다.

### 문제를 풀 때 확인할 것

1. 현재 코드는 Path 값만 만드는지 실제 Files 작업을 하는지 구분합니다.
2. 상대 경로라면 기준 directory가 무엇인지 확인합니다.
3. `Files.exists` 결과를 이후 작업의 보장으로 생각하지 않습니다.
4. 전체 파일을 메모리에 올리는 API인지 확인합니다.
5. 사용자 입력 경로라면 normalization 외에 허용 root 정책이 있는지 봅니다.

### 면접에서 설명한다면

`Path`는 파일 시스템 경로를 값으로 표현하고 `Files`는 실제 읽기·쓰기·복사 같은 작업을 수행합니다. Path 생성 자체는 파일 존재 여부나 open을 의미하지 않습니다. 상대 경로의 기준, 실제 I/O 실패, 대용량 파일의 메모리 사용, 사용자 입력 경로의 traversal 위험을 함께 고려해야 합니다.
