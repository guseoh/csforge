---
kind: concept
contentKey: java.core.io-nio.path-files-api
topicContentKey: java.core.io-nio
slug: path-files-api
title: "Path and Files API"
summary: "Path·Files의 modern file operation과 resource/error 경계를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html"
    title: "Java SE 25 API: Path"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: path 표현과 결합 API 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html"
    title: "Java SE 25 API: Files"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 파일 읽기·쓰기·copy·move API 확인
---
# Path and Files API

## 쉬운 진입

문자열로 경로를 이어 붙이면 separator, 상대 경로, symbolic link 처리에서 실수가 생긴다.
`Path`는 경로라는 값을 표현하고 `Files`는 그 경로에 대한 읽기·쓰기·조회 작업을 제공한다.

## 정확한 메커니즘

```java
Path source = Path.of("content", "note.txt");
String text = Files.readString(source, StandardCharsets.UTF_8);
Files.createDirectories(Path.of("backup"));
Files.copy(source, Path.of("backup", source.getFileName().toString()));
```

`Path` 객체를 만든다고 실제 파일이 열리거나 존재 검사가 수행되는 것은 아니다. `Files` 작업은
권한·존재·경쟁 조건에 따라 `IOException` 등으로 실패할 수 있고, `Files.read...`·`Files.write...`나
stream factory 같은 작업은 별도의 close lifecycle을 갖는다. 상대 경로를 absolute로 바꾸는 기준도 process working
directory와 관련되므로 애플리케이션 경계에서 명시한다.

## 실전·면접 연결

파일 덮어쓰기, copy 옵션, symbolic link 추적, temp file 후 교체 같은 정책은 operation별로
선택한다. 사용자 입력 path는 normalization만으로 안전해지지 않으므로 허용 root와 권한을
별도 검증한다. path 값과 열린 resource의 ownership을 같은 것으로 혼동하지 않는다.

## 흔한 오해

- Path는 파일 descriptor나 열린 stream 자체가 아니다.
- `Files.exists` 후 `Files.read...`는 경쟁 조건을 없애지 않는다.
- `Files.readString`은 모든 대용량 파일을 무제한으로 메모리에 담아도 되는 API가 아니다.
