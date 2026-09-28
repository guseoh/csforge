---
kind: concept
contentKey: spring.core.validation-error.binding-errors
topicContentKey: spring.core.validation-error
slug: binding-errors
title: "바인딩 오류 처리"
summary: "HTTP 문자열·JSON 값이 Java 인자·DTO로 변환되고 검증되는 과정에서 생기는 타입 불일치와 필드·전체 요청 오류를 일관된 API 오류 계약으로 바꾸는 흐름을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html"
    title: "Spring Framework Reference: @ModelAttribute Method Arguments"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "data binding과 검증 결과를 BindingResult로 처리하는 MVC 흐름 참고"
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html"
    title: "Spring Framework Reference: Validation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "검증 오류가 MVC 예외·BindingResult로 전달되는 조건 확인"
---
# 바인딩 오류 처리

HTTP 요청에서 들어오는 값은 처음부터 Java `long`, `LocalDate`, enum이 아닙니다. 경로·query·form 값은 문자열 표현이고 JSON 본문도 converter가 Java 타입으로 바꿔야 합니다.

```http
GET /orders?page=abc
```

Controller가 `int page`를 요구한다면 `abc`를 정수로 바꾸는 과정에서 실패할 수 있습니다. 이 오류는 “page는 1 이상이어야 한다”는 검증보다 앞선 **타입 변환·바인딩 실패**입니다.

### 입력 실패를 단계로 나누면 오류 응답이 더 정확해진다

```text
원본 HTTP 입력
    │
    ├─ 파싱 / 메시지 변환
    │       └─ JSON 문법, 미디어 타입, 타입 변환 실패
    │
    ├─ 데이터 바인딩
    │       └─ 필드 타입 불일치 / 필수 값 누락
    │
    └─ Bean Validation
            └─ @NotBlank, @Min 같은 제약 위반
```

모든 오류를 `INVALID_REQUEST` 하나로 뭉칠 수는 있지만 클라이언트가 어느 필드를 고쳐야 하는지 알 수 있어야 하는 API에서는 필드 오류 정보를 구조화하는 편이 유용합니다.

```json
{
  "code": "VALIDATION_FAILED",
  "message": "요청 값을 확인해 주세요.",
  "fieldErrors": [
    {"field":"page","code":"TYPE_MISMATCH","message":"정수를 입력해 주세요."},
    {"field":"size","code":"MAX","message":"100 이하여야 합니다."}
  ]
}
```

### Spring 내부 오류 코드를 그대로 외부 API 계약으로 노출할 필요는 없다

Spring 내부의 예외 클래스나 validator code는 프레임워크 버전과 구현 세부에 영향을 받을 수 있습니다. 클라이언트가 장기간 의존할 외부 오류 코드는 애플리케이션 API 계약으로 정의하고 내부 오류를 여기에 변환하는 편이 안정적입니다.

```text
MethodArgumentNotValidException
TypeMismatchException
HttpMessageNotReadableException
          │
          ▼
API 오류 변환기
          │
          ▼
안정적인 외부 오류 형식
```

### 거부된 값을 로그·응답에 그대로 넣지 않는다

비밀번호, 토큰, 주민번호 같은 민감한 입력도 바인딩 오류를 만들 수 있습니다. “어떤 값이 잘못됐는지 보여주자”는 이유로 거부된 값을 응답이나 로그에 그대로 넣으면 정보 유출이 생깁니다.

```text
field=password, rejectedValue=secret123!  // 위험
```

오류 진단에 필요한 최소 정보와 개인정보·비밀값 노출 위험을 함께 고려해야 합니다.

### 특정 필드 하나로 설명할 수 없는 오류도 있다

두 날짜의 관계처럼 특정 필드 하나에만 귀속하기 어려운 요청 전체 제약이 있을 수 있습니다.

```text
startDate <= endDate
```

이 경우 `fieldErrors`만 강제하지 않고 요청 전체 오류로 표현하는 것이 더 자연스럽습니다. 물론 이 관계가 도메인 불변식이라면 DTO 검증이 아니라 도메인에서 보호해야 하는지도 다시 봅니다.

바인딩 오류 처리는 단순히 400을 보내는 방법이 아니라 **외부 표현이 Java 입력 계약이 되지 못한 이유를 클라이언트가 수정 가능한 형태로 번역하는 작업**입니다.
