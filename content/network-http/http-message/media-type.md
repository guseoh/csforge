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

미디어 유형은 HTTP로 전달되는 표현 데이터가 **어떤 형식이며 어떤 처리 모델로 해석되어야 하는지** 나타낸다. 기본 형태는 `type/subtype`이고 대표적인 값으로 `application/json`, `text/html`, `image/png`가 있다.

```text
application/json
    │         │
    type      subtype
```

필요하면 `charset` 같은 매개변수가 미디어 유형에 함께 붙을 수 있다.

```http
Content-Type: text/html; charset=UTF-8
```

여기서 `text/html`은 표현 형식을, `charset=UTF-8`은 그 텍스트를 어떤 문자 인코딩으로 해석할지에 대한 정보를 나타낸다.

### 사람이 보기에는 모두 텍스트여도 처리 방식은 다를 수 있다

다음 두 데이터는 모두 글자로 보일 수 있지만 미디어 유형이 다르면 수신 측의 처리 방식도 다르다.

```text
application/json → JSON 문법으로 파싱
text/html        → HTML 처리 모델로 해석
```

따라서 미디어 유형은 단순한 파일 확장자나 ‘텍스트인가 바이너리인가’를 구분하는 표시가 아니다. **수신 측이 표현 데이터를 어떤 규칙으로 해석할지 정하는 중요한 메타데이터**다.

### 미디어 유형과 콘텐츠 코딩은 다른 축이다

JSON 데이터를 gzip으로 압축해 전송한다고 하자.

```text
원래 표현 형식
application/json
      ↓ gzip 적용
압축된 바이트 전송
```

이때 미디어 유형은 여전히 `application/json`이고, 압축 사실은 `Content-Encoding: gzip` 같은 별도 필드로 표현한다. gzip을 적용했다고 JSON이 `application/gzip` 리소스로 바뀐다고 단정하면 표현 형식과 전송 코딩을 섞게 된다.

수신 측은 일반적으로 필요한 콘텐츠 코딩을 해제한 뒤 미디어 유형에 맞는 방식으로 표현 데이터를 처리한다.

```text
전송된 gzip 바이트
      ↓ Content-Encoding 해제
JSON 바이트
      ↓ Content-Type 해석
JSON 파서
```

### 미디어 유형을 선언한다고 데이터가 자동으로 유효해지지는 않는다

`Content-Type: application/json`이라고 적혀 있어도 실제 바이트가 잘못된 JSON일 수 있다. 미디어 유형은 **어떤 형식이라고 주장하는지** 알려 주는 메타데이터이고, 실제 문법이 유효한지는 파서가 확인해야 한다.

JSON 문법이 유효하더라도 필수 필드나 업무 규칙을 만족하는지는 또 다른 애플리케이션 검증 단계다.

핵심은 **미디어 유형이 표현 데이터의 형식과 처리 방식을 알려 주며, 문자 인코딩·콘텐츠 코딩·애플리케이션 유효성 검증과는 구분되는 개념이라는 점**이다.
