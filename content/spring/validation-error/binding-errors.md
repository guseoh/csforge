---
kind: concept
contentKey: spring.core.validation-error.binding-errors
topicContentKey: spring.core.validation-error
slug: binding-errors
title: "binding error 처리"
summary: "HTTP 문자열·JSON 값이 Java parameter/DTO로 변환되고 validation되는 과정에서 생기는 type mismatch와 field/global error를 일관된 API 오류 계약으로 바꾸는 흐름을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html"
    title: "Spring Framework Reference: @ModelAttribute Method Arguments"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "data binding과 validation 결과를 BindingResult로 처리하는 MVC 흐름 참고"
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html"
    title: "Spring Framework Reference: Validation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "validation error가 MVC exception/BindingResult로 전달되는 조건 확인"
---
# binding error 처리

HTTP request에서 들어오는 값은 처음부터 Java `long`, `LocalDate`, enum이 아닙니다. path/query/form 값은 문자열 representation이고 JSON body도 converter가 Java type으로 바꿔야 합니다.

```http
GET /orders?page=abc
```

controller가 `int page`를 요구한다면 `abc`를 int로 바꾸는 과정에서 실패할 수 있습니다. 이 오류는 “page는 1 이상이어야 한다”는 validation보다 앞선 **type conversion/binding 실패**입니다.

### 입력 실패를 단계로 나누면 오류 응답이 더 정확해진다

```text
raw HTTP input
    │
    ├─ parsing / message conversion
    │       └─ JSON 문법, media type, type conversion 실패
    │
    ├─ data binding
    │       └─ field type mismatch / missing value
    │
    └─ Bean Validation
            └─ @NotBlank, @Min 같은 constraint violation
```

모든 오류를 `INVALID_REQUEST` 하나로 뭉칠 수는 있지만 client가 어느 field를 고쳐야 하는지 알 수 있어야 하는 API에서는 field error 정보를 구조화하는 편이 유용합니다.

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

### framework error code를 그대로 public contract로 노출할 필요는 없다

Spring 내부의 exception class나 validator code는 version/implementation detail일 수 있습니다. client가 장기간 의존할 public error code는 application API contract로 정의하고 내부 오류를 mapping하는 편이 안정적입니다.

```text
MethodArgumentNotValidException
TypeMismatchException
HttpMessageNotReadableException
          │
          ▼
API error mapper
          │
          ▼
stable external error shape
```

### rejected value를 log/response에 그대로 넣지 않는다

password, token, 주민번호 같은 민감한 input도 binding error를 만들 수 있습니다. “어떤 값이 잘못됐는지 보여주자”는 이유로 rejected value를 response/log에 그대로 넣으면 정보 유출이 생깁니다.

```text
field=password, rejectedValue=secret123!  // 위험
```

오류 진단에 필요한 최소 정보와 개인정보/secret exposure를 함께 고려해야 합니다.

### global error도 존재한다

두 날짜의 관계처럼 특정 field 하나에만 귀속하기 어려운 request-level constraint가 있을 수 있습니다.

```text
startDate <= endDate
```

이 경우 `fieldErrors`만 강제하지 않고 global/request error로 표현하는 것이 더 자연스럽습니다. 물론 이 관계가 domain invariant라면 DTO validation이 아니라 domain에서 보호해야 하는지 다시 봅니다.

binding error 처리는 “400을 보내는 방법”이 아니라 **외부 representation이 Java input contract가 되지 못한 이유를 client가 수정 가능한 형태로 번역하는 작업**입니다.
