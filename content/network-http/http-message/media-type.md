---
kind: concept
contentKey: network-http.core.http-message.media-type
topicContentKey: network-http.core.http-message
slug: media-type
title: "미디어 유형(Media Type)"
summary: "미디어 유형이 표현 데이터의 형식과 처리 방식을 type/subtype으로 나타내고, 문자 인코딩·콘텐츠 코딩과는 다른 축인 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 미디어 유형(Media Type)

미디어 유형은 표현 데이터의 형식과 처리 모델을 나타냅니다. 기본 형태는 type/subtype이며 application/json, text/html, image/png 등이 있습니다.

```http
Content-Type: text/html; charset=UTF-8
```

미디어 유형 정의에 따라 charset 같은 매개변수를 사용할 수 있습니다. JSON과 HTML이 모두 텍스트로 보이더라도 해석 방법은 다릅니다. 파일 확장자만으로 실제 미디어 유형을 결정하는 것도 아닙니다.

### 콘텐츠 코딩과 구분합니다

```http
Content-Type: application/json
Content-Encoding: gzip
```

위 응답은 JSON 표현 데이터에 gzip 코딩을 적용한 사례입니다. 수신자는 콘텐츠 코딩을 처리한 후 미디어 유형에 맞게 해석할 수 있습니다. gzip을 적용했다고 JSON을 표현하는 리소스가 application/gzip 파일로 바뀌었다고 판단하지 않습니다.

미디어 유형 선언은 실제 문법과 업무상 유효성을 보증하지 않습니다. 파싱, DTO 입력 검증, 업무 규칙은 별도의 책임입니다.
