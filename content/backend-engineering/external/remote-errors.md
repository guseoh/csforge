---
kind: concept
contentKey: backend.core.external.remote-errors
topicContentKey: backend.core.external
slug: remote-errors
title: "remote error와 response validation"
summary: "HTTP status만으로 성공을 단정하지 않고 payload schema와 business status를 검증해 외부 실패를 내부 계약으로 번역한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110.html"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "HTTP response status와 representation semantics 확인"
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc-client.html"
    title: "Spring Framework Reference: REST Clients"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "HTTP response를 application object로 변환하는 client 경계 확인"
---
# remote error와 response validation

외부 API가 `200 OK`를 반환했다고 내부 use case가 성공한 것은 아닙니다. HTTP status는 transport-level response의 한 신호이고, body가 기대한 schema인지, 필수 field가 있는지, business status가 성공인지까지 확인해야 application이 안전하게 다음 상태로 넘어갈 수 있습니다.

```text
HTTP response
  ├─ status: transport/protocol 신호
  ├─ headers: content type, request id 등
  └─ body: schema와 business 결과

세 층을 모두 확인한 뒤 내부 결과로 번역
```

### status와 business success를 분리한다

어떤 remote system은 validation 실패를 `4xx`로 반환하지만, 어떤 시스템은 항상 `200` body 안에 `success=false`와 error code를 넣을 수 있습니다. 반대로 `2xx`라도 body가 잘렸거나 필수 주문 식별자가 없으면 내부에서는 실패로 다뤄야 합니다.

```json
{
  "success": true,
  "orderId": "ord-123",
  "status": "APPROVED"
}
```

이 응답을 신뢰하려면 HTTP status뿐 아니라 `success`, `orderId`, `status`의 타입과 허용 값, 서로 간의 조합을 검증해야 합니다. JSON parsing이 성공했다는 것과 business contract가 유효하다는 것도 다른 단계입니다.

### response validation은 boundary에서 끝낸다

외부 DTO를 application/domain 내부까지 그대로 전달하면 vendor field 이름, nullable 규칙, error code 체계가 내부 코드에 퍼집니다. client adapter가 외부 response를 읽고 다음을 검증한 뒤 내부 결과 또는 내부 예외로 번역하는 편이 경계를 보호합니다.

1. HTTP status와 content type
2. body size와 parsing 가능 여부
3. 필수 field, type, enum 값과 schema version
4. business status와 identifier의 조합
5. remote request id 같은 진단 metadata

```text
External response DTO
        │ validate + map
        ▼
Internal result / typed failure
        │
        ├─ application policy
        └─ API error contract
```

### 실패를 내부 error model로 번역한다

외부 `404`, `429`, `500`, timeout, malformed body를 모두 “외부 API 오류” 하나로 뭉개면 retry·사용자 응답·운영 대응을 구분할 수 없습니다. 내부에서는 예를 들어 not found, rate limited, unavailable, invalid response처럼 의미가 드러나는 실패 종류로 정리하고 원인과 remote request id를 보존합니다.

```text
remote 429  ─▶ rate limited       ─▶ 제한된 retry 또는 사용자 안내
remote 500  ─▶ unavailable        ─▶ bounded retry / fallback
malformed   ─▶ invalid response   ─▶ retry 전 계약 변경·장애 조사
timeout     ─▶ outcome unknown    ─▶ idempotency/result lookup 판단
```

내부 error model은 vendor exception의 세부 구현을 무조건 숨기는 것이 아니라, application이 실제로 정책을 결정하는 데 필요한 정보만 안정적으로 노출하는 번역 경계입니다.

### response body를 그대로 신뢰하거나 노출하지 않는다

remote error body는 HTML, 너무 큰 payload, 민감정보, 예상하지 못한 JSON일 수 있습니다. 파싱 실패 시 body 전체를 로그나 API response에 넣으면 log injection, secret 노출, 저장소·로그 용량 문제로 이어질 수 있습니다. 제한된 크기와 안전한 field를 선택해 기록하고 correlation id를 함께 남기는 편이 좋습니다.

### 운영에서는 “success rate”를 여러 층으로 나눈다

HTTP 2xx 비율만 보면 remote가 business failure를 200으로 포장하는 문제를 놓칠 수 있습니다. 다음을 분리해 관측합니다.

- 호출 시도와 timeout 비율
- HTTP status별 응답 수
- schema validation 실패 수
- business success/failure 수
- retry 후 최종 성공 수와 unknown outcome 수
- remote request id와 내부 correlation id

### 문제를 풀 때 확인할 것

1. HTTP status와 body business status를 따로 확인합니다.
2. parsing 성공과 schema/semantic validation 성공을 구분합니다.
3. 외부 DTO를 내부 domain 상태로 직접 사용하지 않습니다.
4. 실패 종류별 retry, fallback, 사용자 응답 정책을 나눕니다.
5. error body와 correlation metadata의 보안·크기 경계를 확인합니다.

### 면접에서 설명한다면

외부 호출은 HTTP status만 확인하는 것으로 끝나지 않고 content type, schema, 필수 field와 business status를 검증해야 합니다. adapter 경계에서 vendor response를 내부 결과와 typed failure로 번역하면 retry·fallback·API error mapping이 안정적으로 분리됩니다. timeout이나 malformed response처럼 결과가 불확실한 경우에는 idempotency와 결과 조회 가능성도 함께 판단해야 합니다.

