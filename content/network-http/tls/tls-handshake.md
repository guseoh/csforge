---
kind: concept
contentKey: network-http.core.tls.tls-handshake
topicContentKey: network-http.core.tls
slug: tls-handshake
title: "TLS 핸드셰이크"
summary: "TLS 1.3 핸드셰이크가 통신 조건과 키 재료를 합의하고 서버 인증과 핸드셰이크 무결성을 확인한 뒤 애플리케이션 데이터용 키를 준비하는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# TLS 핸드셰이크

HTTPS로 HTTP 데이터를 보호하려면 클라이언트와 서버가 먼저 **어떤 TLS 조건으로 통신할지 합의하고, 서로 같은 키 재료를 만들며, 필요한 상대 인증을 끝내야 한다.** 이 준비 과정이 TLS 핸드셰이크다.

TLS 1.3의 일반적인 인증서 기반 흐름을 단순화하면 다음과 같다.

```text
클라이언트                                      서버
  | -- ClientHello(TLS 버전, 암호 조합(cipher suite), 키 공유 정보(key share)) --> |
  | <-- ServerHello(선택한 값, 키 공유 정보(key share)) -------- |
  | <-- EncryptedExtensions + Certificate -------------- |
  | <-- CertificateVerify + Finished ------------------- |
  | ---------------- Finished --------------------------> |
  | ===== 보호된 애플리케이션 데이터 ==================> |
```

`ClientHello`에는 지원하는 TLS 버전, 암호 조합, 키 합의에 사용할 키 공유 정보(key share) 같은 정보가 들어간다. 서버는 `ServerHello`에서 사용할 조건을 선택하고 자신의 키 공유 정보를 보낸다. TLS 1.3에서는 이 시점 이후 핸드셰이크 메시지의 상당 부분도 파생된 핸드셰이크 키로 보호된다.

여기서 암호 조합(cipher suite)이 모든 TLS 동작을 하나로 결정한다고 이해하면 안 된다. TLS 1.3의 암호 조합(cipher suite)은 주로 사용할 AEAD 알고리즘과 해시 함수 조합을 나타내고, 키 교환 그룹이나 서명 방식 같은 다른 조건은 별도의 확장과 협상으로 정해진다.

### CertificateVerify와 Finished는 확인하는 대상이 다르다

인증서 기반 서버 인증에서는 `Certificate`가 서버의 인증서 체인을 전달한다. 그다음 `CertificateVerify`는 서버가 인증서의 공개 키와 짝인 개인 키를 실제로 제어하고 있음을 **현재 핸드셰이크 내용(transcript)에 대한 서명**으로 증명한다.

`Finished`는 지금까지의 핸드셰이크 내용(transcript)과 파생된 키 상태를 바탕으로 계산한 검증 값을 교환한다. 양쪽이 같은 핸드셰이크 내용을 보고 같은 키 상태에 도달했는지 확인하는 단계다.

```text
Certificate       → 어떤 공개 키·서비스 식별 정보를 제시하는가
CertificateVerify → 그 공개 키와 짝인 개인 키를 실제로 제어하는가
Finished          → 지금까지의 핸드셰이크와 파생 키 상태가 양쪽에서 일치하는가
```

인증서가 신뢰할 수 있다는 사실 하나만으로 이 세 질문이 모두 해결되는 것은 아니다.

### 핸드셰이크가 끝나면 애플리케이션 데이터용 키를 사용한다

핸드셰이크 과정에서 얻은 비밀 값으로부터 이후 HTTP 데이터를 보호할 트래픽 키가 파생된다. 실제 애플리케이션 데이터는 이 대칭 키와 AEAD를 이용해 효율적으로 암호화·무결성 보호된다.

그래서 `인증서의 공개 키로 모든 HTTPS 데이터를 직접 암호화한다`고 이해하면 부정확하다. 공개 키 기반 서명과 키 합의는 안전하게 상대를 인증하고 공통 비밀을 만들기 위해 사용되며, 대량의 데이터 보호는 이후 대칭 키가 담당한다.

### 모든 TLS 1.3 연결이 같은 메시지 순서를 가지는 것은 아니다

PSK나 세션 재개(resumption)를 사용하면 인증서 메시지가 생략될 수 있고, 0-RTT 조기 데이터(early data)를 사용하는 흐름은 일반적인 1-RTT 연결과 다른 제약을 가진다. 따라서 위 도식은 인증서 기반 서버 인증의 대표적인 흐름이지 TLS 1.3의 모든 경우를 고정한 유일한 순서는 아니다.

핵심은 **TLS 핸드셰이크가 통신 조건과 키 상태를 맞추고 서버 인증과 핸드셰이크 무결성을 확인해 보호된 애플리케이션 통신을 시작할 준비를 한다는 점**이다. 핸드셰이크 성공 뒤에도 HTTP 파싱, 사용자 인가, 데이터베이스 처리 같은 상위 계층 작업은 별도로 실패할 수 있다.
