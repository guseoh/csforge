---
kind: concept
contentKey: operating-systems.core.ipc.network-socket-ipc
topicContentKey: operating-systems.core.ipc
slug: network-socket-ipc
title: "네트워크 소켓 IPC(Network Socket IPC)"
summary: "프로세스·호스트 경계를 넘는 소켓 통신에서 직렬화·프레이밍·실패 책임을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man7/socket.7.html"
    title: "socket(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process IPC와 socket lifecycle을 확인한다."
    displayOrder: 1
---
# 네트워크 소켓 IPC(Network Socket IPC)

네트워크 소켓은 프로세스가 커널 소켓 객체를 통해 같은 호스트의 다른 프로세스나 원격 호스트의 엔드포인트와 데이터를 주고받는 IPC다. 애플리케이션은 소켓 API를 사용하지만 실제 바이트는 로컬 소켓 버퍼와 전송·네트워크 스택을 거쳐 상대편에 전달된다.

### `send()` 성공과 상대 애플리케이션 처리 완료는 다르다

보내는 쪽의 `write()`나 `send()`가 성공했다는 것은 로컬 커널이 일부 또는 전체 바이트를 받아들였다는 의미일 수 있다. 그 뒤 실제 네트워크 전송, 상대 커널의 수신 버퍼 적재, 상대 프로세스의 `read()`가 이어진다. 따라서 **보내는 쪽 시스템 콜 성공을 상대 애플리케이션의 처리 완료로 해석하면 안 된다.**

스트림 소켓에서는 애플리케이션 메시지 경계가 보존되지 않으므로 받는 쪽이 프레이밍을 직접 정의해야 한다. 데이터그램 소켓은 메시지 경계를 보존하지만 손실, 잘림(truncation), 최대 크기 같은 별도 계약을 가진다.

### 네트워크 경계는 추가 실패 상태를 만든다

원격 호스트와 통신하면 연결 재설정(connection reset), 타임아웃, 패킷 손실, 경로 장애처럼 한 호스트 내부 IPC에는 없던 실패가 생긴다. 보내는 쪽과 받는 쪽의 진행 상태를 항상 동시에 알 수 있는 것도 아니다. 따라서 네트워크 소켓은 단순한 "멀리 있는 파이프"가 아니라 **별도의 실패 경계**를 가진다.

### 직렬화도 애플리케이션 책임이다

서로 다른 프로세스는 각자의 주소 공간을 사용하므로 메모리 객체의 포인터를 그대로 전달할 수 없다. 데이터를 바이트 표현으로 직렬화하고 상대가 같은 프로토콜로 해석해야 한다. 스트림 소켓이라면 메시지 경계를 찾기 위한 프레이밍까지 함께 정의해야 한다.

네트워크 소켓 IPC의 핵심은 **호스트 경계를 넘어 통신 범위를 넓힐 수 있는 대신 직렬화, 프레이밍, 네트워크 실패를 명시적으로 다뤄야 한다는 것**이다.

```text
보내는 애플리케이션
        │ send()가 바이트를 로컬 커널에 전달
        ▼
보내는 쪽 소켓 버퍼 → 전송/네트워크 → 상대 소켓 버퍼
                                           │
                                           ▼
                               받는 쪽이 read() 후 프레이밍·처리
```

`send()` 성공은 상대 애플리케이션이 바이트를 읽거나 처리했다는 확인이 아니다.
