---
kind: concept
contentKey: network-http.core.http-versions.transport-head-of-line
topicContentKey: network-http.core.http-versions
slug: transport-head-of-line
title: "전송 계층의 HOL 차단"
summary: "HTTP/2 스트림 다중화 아래에서도 TCP의 순서 보장 때문에 하나의 손실이 여러 스트림 전달을 함께 지연시킬 수 있는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9000"
    title: "QUIC: A UDP-Based Multiplexed and Secure Transport"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "QUIC 연결·스트림·손실 복구와 혼잡 제어의 기본 규칙을 확인한다."
    displayOrder: 1
---
# 전송 계층의 HOL 차단

HTTP/2는 여러 HTTP 스트림을 하나의 연결에서 다중화(multiplexing)한다. 그러나 그 연결이 TCP 위에 있다면 모든 HTTP/2 프레임 바이트는 결국 **하나의 순서가 보장된 TCP 바이트 스트림**을 공유한다.

TCP 시퀀스의 앞부분이 유실되면 뒤쪽 바이트가 네트워크에 먼저 도착했더라도 TCP는 빈 구간을 건너뛰어 애플리케이션에 전달할 수 없다. 그 결과 유실된 바이트 뒤에 실린 여러 HTTP/2 스트림의 프레임이 함께 기다릴 수 있다.

```text
HTTP/2 stream A ┐
HTTP/2 stream B ├─> 하나의 TCP ordered byte stream
HTTP/2 stream C ┘
                     ↑ 앞쪽 바이트 유실
                     → 뒤쪽 프레임 전달도 대기
```

이 현상은 HTTP/1.1 파이프라이닝의 응답 순서 HOL과 계층이 다르다. HTTP/2는 HTTP 수준에서 독립 스트림을 도입해 한 요청의 느린 응답이 다른 응답의 프레임 전송을 직접 막는 문제를 줄였지만, 아래의 TCP는 여전히 하나의 바이트 순서를 유지한다.

QUIC은 신뢰성 상태를 스트림별로 분리해 한 스트림의 유실된 데이터가 다른 스트림의 순서 있는 전달을 같은 방식으로 막지 않도록 설계됐다. 다만 혼잡 제어와 네트워크 대역폭처럼 연결 전체가 공유하는 자원까지 완전히 독립되는 것은 아니다.

따라서 ‘HTTP/2는 multiplexing이 있으니 HOL 문제가 없다’고 말하면 계층을 섞게 된다. **HTTP/2는 HTTP 수준 HOL을 크게 줄이지만 TCP의 순서 보장으로 인한 전송 계층 HOL은 남을 수 있고, HTTP/3가 QUIC을 사용하는 이유 중 하나가 이 경계를 개선하기 위해서다.**
