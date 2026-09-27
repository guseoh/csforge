---
kind: concept
contentKey: network-http.core.tls.tls-handshake
topicContentKey: network-http.core.tls
slug: tls-handshake
title: "TLS 핸드셰이크"
summary: "TLS 핸드셰이크가 버전·암호 조합·키 재료·상대 인증을 합의해 애플리케이션 데이터 보호 키를 만드는 흐름을 설명한다."
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

HTTPS에서 HTTP 데이터를 암호화하려면 클라이언트와 서버가 먼저 사용할 TLS 버전과 암호 조합을 정하고, 공통 키 재료를 만들며, 필요한 경우 상대가 의도한 서버인지 인증해야 한다. 이 준비 과정이 TLS 핸드셰이크다.

TLS 1.3의 일반적인 인증서 기반 흐름에서는 클라이언트가 `ClientHello`에 지원하는 버전, cipher suite와 key share 등을 담아 보낸다. 서버는 `ServerHello`에서 사용할 조합과 자신의 key share를 선택한다. 이후에는 핸드셰이크 트래픽도 보호되는 상태로 전환되고 서버 인증에 필요한 인증서와 검증 메시지가 이어진다.

```text
Client                                              Server
  | -- ClientHello(version, cipher, key share) ----> |
  | <- ServerHello(selected values, key share) ----- |
  | <- EncryptedExtensions + Certificate             |
  | <- CertificateVerify + Finished ---------------- |
  | ---------------- Finished ---------------------> |
  | ===== encrypted application data =============> |
```

핵심 순서는 **통신 조건 합의 → 키 재료 합의 → 상대 인증 → 핸드셰이크 무결성 확인 → 애플리케이션 데이터 전송**이다.

### CertificateVerify와 Finished는 확인하는 대상이 다르다

인증서 기반 서버 인증에서는 `Certificate`가 인증서 체인을 전달하고, `CertificateVerify`가 서버가 해당 인증서의 개인 키를 실제로 보유하고 있다는 사실을 현재 핸드셰이크 transcript와 연결해 증명한다.

`Finished`는 지금까지의 핸드셰이크 transcript와 파생된 키 재료를 이용해 양쪽이 같은 핸드셰이크 상태를 공유하는지 확인한다. 따라서 인증서가 유효하다는 것과 핸드셰이크 전체가 변조 없이 같은 상태로 끝났다는 것은 서로 다른 검증 단계다.

### 모든 TLS 1.3 연결이 같은 메시지 순서를 쓰는 것은 아니다

PSK나 세션 재개(resumption)를 사용하면 인증서 메시지가 생략되는 등 흐름이 달라질 수 있다. 위 도식은 인증서 기반 서버 인증의 대표 흐름이지 모든 TLS 1.3 핸드셰이크의 유일한 형태가 아니다.

TLS 핸드셰이크가 성공했다는 것은 **검증된 TLS 상대와 보호된 채널을 사용할 준비가 됐다는 뜻**이다. 그 위의 HTTP 요청이 올바른지, 로그인 사용자가 특정 기능을 실행할 권한이 있는지, 데이터베이스 작업이 성공했는지는 애플리케이션이 별도로 판단한다.
